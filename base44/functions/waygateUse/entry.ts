import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser } from '../../shared/economy.ts';

// Player uses a waygate: pays the gate's HT price server-side (atomic, no
// double-charge) and records a TeleportRequest that staff deliver in-game.
// All waygates share one per-player cooldown so teleports cannot be spammed.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const waygateId = String(body.waygate_id || '');
    if (!waygateId) return Response.json({ error: 'waygate_id is required' }, { status: 400 });

    const service = base44.asServiceRole;

    let gate = null;
    try {
      gate = await service.entities.Waygate.get(waygateId);
    } catch {
      gate = null;
    }
    if (!gate || !gate.active) {
      return Response.json({ error: 'This waygate is not available.' }, { status: 404 });
    }

    // Teleports are tied to the player's verified Steam-linked account.
    const links = await service.entities.SteamLink.filter({ user_id: user.id });
    const steamId = links.length > 0 ? links[0].steam_id : null;
    if (!steamId) {
      return Response.json(
        { error: 'Link your Steam account first to use waygates.', needs_steam_link: true },
        { status: 400 }
      );
    }

    // Shared cooldown: no teleport request from this player within 10 minutes.
    const COOLDOWN_MS = 10 * 60 * 1000;
    const recentPage = await service.entities.TeleportRequest.filter(
      { user_id: user.id },
      { sort: '-created_date', limit: 1 }
    );
    const lastRequest = (recentPage.items || [])[0];
    if (lastRequest) {
      const eligibleAt = new Date(lastRequest.created_date).getTime() + COOLDOWN_MS;
      if (Date.now() < eligibleAt) {
        return Response.json(
          {
            error: 'The waygate network is recharging.',
            next_available_at: new Date(eligibleAt).toISOString(),
          },
          { status: 429 }
        );
      }
    }

    const wallet = await getWalletForUser(service, user.id, steamId);
    const price = Math.floor(Number(gate.price) || 0);
    const oldBalance = wallet.balance || 0;
    if (oldBalance < price) {
      return Response.json(
        { error: `Not enough Haven Tokens. You need ${price.toLocaleString()} HT.` },
        { status: 400 }
      );
    }

    // Snapshot the player's live dino so staff know who and what to move.
    const dinoPage = await service.entities.LiveDino.filter(
      { steam_id: steamId },
      { sort: '-last_seen', limit: 1 }
    );
    const dino = (dinoPage.items || [])[0] || null;

    // Atomic charge anchored on the exact current balance, mirroring the
    // daily claim guard: only one concurrent request can win.
    const now = new Date();
    await service.entities.Wallet.updateMany(
      { user_id: user.id, balance: oldBalance },
      { $set: { balance: oldBalance - price } }
    );
    const winners = await service.entities.Wallet.filter({
      user_id: user.id,
      balance: oldBalance - price,
    });
    if (winners.length === 0) {
      return Response.json(
        { error: 'Your balance changed at the same moment. Try again.' },
        { status: 409 }
      );
    }
    const finalWallet = winners[0];

    const tx = await service.entities.CoinTransaction.create({
      user_id: user.id,
      type: 'teleport',
      amount: -price,
      reason: `Waygate: ${gate.name}`,
      balance_after: finalWallet.balance,
    });

    const request = await service.entities.TeleportRequest.create({
      user_id: user.id,
      steam_id: steamId,
      player_name: dino?.player_name || user.full_name || '',
      species: dino?.species || '',
      waygate_id: gate.id,
      waygate_name: gate.name,
      price,
      status: 'pending',
    });

    return Response.json({
      ok: true,
      balance: finalWallet.balance,
      request,
      transaction: tx,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}