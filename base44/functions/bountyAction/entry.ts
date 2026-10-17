import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser } from '../../shared/economy.ts';
import { payBounty } from '../../shared/bounties.ts';

// Bounty actions on the board. Claim: the signed-in player must be the
// verified in-game killer — a KillEvent from the live feed has to exist with
// their Steam ID credited and a victim matching the bounty's target name
// after the bounty was posted. Cancel: only the poster can, with a full
// refund. Everything is paid through the ledger.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action === 'claim' || body.action === 'cancel' ? body.action : null;
    const bountyId = String(body.bounty_id || '');
    if (!action || !bountyId) {
      return Response.json({ error: 'bounty_id and action are required.' }, { status: 400 });
    }

    const service = base44.asServiceRole;
    let bounty = null;
    try {
      const page = await service.entities.Bounty.filter({ id: bountyId }, { limit: 1 });
      bounty = (page.items || [])[0];
    } catch {
      bounty = null;
    }
    if (!bounty) return Response.json({ error: 'Bounty not found.' }, { status: 404 });
    if (bounty.status !== 'open') {
      return Response.json({ error: 'This bounty is no longer open.' }, { status: 409 });
    }

    const nowIso = new Date().toISOString();

    if (action === 'cancel') {
      if (bounty.poster_user_id !== user.id) {
        return Response.json({ error: 'Only the bounty poster can cancel it.' }, { status: 403 });
      }
      // Cancel atomically too: only one request (cancel, claim or the live
      // feed's settlement) can flip the status away from 'open'.
      await service.entities.Bounty.updateMany(
        { id: bounty.id, status: 'open' },
        { $set: { status: 'cancelled' } }
      );
      const verify = await service.entities.Bounty.get(bounty.id);
      if (!verify || verify.status !== 'cancelled') {
        return Response.json({ error: 'This bounty is no longer open.' }, { status: 409 });
      }
      await service.entities.Wallet.updateMany(
        { user_id: user.id },
        { $inc: { balance: bounty.amount } }
      );
      const wallet = await getWalletForUser(service, user.id);
      await service.entities.CoinTransaction.create({
        user_id: user.id,
        type: 'refund',
        amount: bounty.amount,
        reason: `Bounty on ${bounty.target_name} cancelled`,
        balance_after: wallet.balance,
      });
      return Response.json({ ok: true, action, balance: wallet.balance });
    }

    // Claim: verify a real in-game kill from the live feed.
    const linkPage = await service.entities.SteamLink.filter({ user_id: user.id }, { limit: 1 });
    const link = (linkPage.items || [])[0];
    if (!link) {
      return Response.json({ error: 'Link your Steam account first.' }, { status: 400 });
    }

    const killPage = await service.entities.KillEvent.filter(
      { killer_steam_id: link.steam_id, killed_date: { $gte: bounty.created_date } },
      { sort: '-killed_date', limit: 100 }
    );
    const wanted = String(bounty.target_name || '').trim().toUpperCase();
    const match = (killPage.items || []).find(
      (k) => String(k.victim_name || '').trim().toUpperCase() === wanted
    );
    if (!match) {
      return Response.json(
        { error: `No in-game kill of ${bounty.target_name} recorded for your account yet.` },
        { status: 409 }
      );
    }

    const after = await payBounty(
      service,
      bounty,
      { steam_id: link.steam_id, player_name: match.killer_name || 'Unknown' },
      user.id,
      nowIso
    );
    if (after === null) {
      return Response.json({ error: 'This bounty is no longer open.' }, { status: 409 });
    }
    return Response.json({ ok: true, action, balance: after });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}