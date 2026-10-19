import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getConfig, getWalletForUser, publicWallet } from '../../shared/economy.ts';
import { SHOP_SKINS } from '../../shared/skins.ts';

// Skin shop actions for the signed-in player.
//   { action: "buy",  skin_id } -> validates the catalog price, debits the
//     wallet atomically, records the purchase and auto-equips, queueing a
//     skin command the HavenPosition bridge delivers to the game server.
//   { action: "equip", skin_id } -> equips an owned skin and re-queues the
//     in-game skin command.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'buy');
    const service = base44.asServiceRole;

    const skinId = String(body.skin_id || '');
    const skin = SHOP_SKINS.find((s) => s.id === skinId);
    if (!skin) return Response.json({ error: 'Unknown skin.' }, { status: 404 });

    if (action === 'buy') {
      const config = await getConfig(service);
      if (config.shop_enabled === false) {
        return Response.json({ error: 'The shop is currently closed.' }, { status: 403 });
      }

      // The skin is applied in-game, so a linked Steam account is required
      // for the command to have somewhere to go.
      const links = await service.entities.SteamLink.filter({ user_id: user.id });
      const link = links[0];
      if (!link) {
        return Response.json({ error: 'Link your Steam account first' }, { status: 400 });
      }

      const wallet = await getWalletForUser(service, user.id, link.steam_id);

      const ownedPage = await service.entities.OwnedSkin.filter(
        { user_id: user.id, skin_id: skin.id },
        { limit: 1 }
      );
      if (ownedPage.items.length > 0) {
        return Response.json({ error: 'You already own this skin.' }, { status: 409 });
      }

      const price = skin.price;
      const before = wallet.balance || 0;
      if (before < price) {
        return Response.json({ error: 'Not enough Haven Tokens.' }, { status: 400 });
      }

      // Conditional deduct: only applied while the stored balance is still
      // at least the price, so overlapping purchases cannot go negative.
      await service.entities.Wallet.updateMany(
        { id: wallet.id, balance: { $gte: price } },
        { $inc: { balance: -price } }
      );
      const after = await service.entities.Wallet.get(wallet.id);
      if (!after || (after.balance || 0) === before) {
        return Response.json({ error: 'Purchase could not complete. Try again.' }, { status: 409 });
      }

      try {
        await service.entities.CoinTransaction.create({
          user_id: user.id,
          type: 'purchase',
          amount: -price,
          reason: `Skin shop: ${skin.name}`,
          item_id: skin.id,
          item_name: skin.name,
          balance_after: after.balance,
        });
        await service.entities.OwnedSkin.updateMany(
          { user_id: user.id },
          { $set: { equipped: false } }
        );
        const record = await service.entities.OwnedSkin.create({
          user_id: user.id,
          steam_id: link.steam_id,
          skin_id: skin.id,
          name: skin.name,
          pattern: skin.pattern,
          color: skin.hex,
          price,
          equipped: true,
          server_status: 'queued',
          purchased_date: new Date().toISOString(),
        });
        return Response.json({ ok: true, wallet: publicWallet(after), record });
      } catch (ledgerError) {
        // Ledger or ownership write failed: put the coins back.
        await service.entities.Wallet.update(wallet.id, { balance: before });
        return Response.json({ error: 'Purchase failed and was refunded.' }, { status: 500 });
      }
    }

    if (action === 'equip') {
      const ownedPage = await service.entities.OwnedSkin.filter(
        { user_id: user.id, skin_id: skin.id },
        { limit: 1 }
      );
      const rec = ownedPage.items[0];
      if (!rec) return Response.json({ error: 'Buy this skin first.' }, { status: 403 });

      await service.entities.OwnedSkin.updateMany(
        { user_id: user.id },
        { $set: { equipped: false } }
      );
      const updated = await service.entities.OwnedSkin.update(rec.id, {
        equipped: true,
        server_status: 'queued',
        server_error: null,
      });
      return Response.json({ ok: true, record: updated });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}