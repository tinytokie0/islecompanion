import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getConfig, getWalletForUser, publicWallet } from '../../shared/economy.ts';

// Secure purchase of a shop reward with Haven Tokens. Checks the item is
// active, enforces one-time rewards, deducts the price with a conditional
// update that can never drive the balance negative, and writes an auditable
// ledger record. If the ledger write fails the coins are refunded.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const itemId = String(body.item_id || '');
    if (!itemId) return Response.json({ error: 'item_id is required' }, { status: 400 });

    const service = base44.asServiceRole;
    const config = await getConfig(service);
    if (config.shop_enabled === false) {
      return Response.json({ error: 'The shop is currently closed.' }, { status: 403 });
    }

    const item = await service.entities.ShopItem.get(itemId);
    if (!item || item.active === false) {
      return Response.json({ error: 'This reward is not available.' }, { status: 404 });
    }
    const price = Math.floor(Number(item.price));
    if (!Number.isFinite(price) || price < 1) {
      return Response.json({ error: 'This reward has an invalid price.' }, { status: 400 });
    }

    const links = await service.entities.SteamLink.filter({ user_id: user.id });
    const wallet = await getWalletForUser(service, user.id, links.length > 0 ? links[0].steam_id : null);

    if (item.one_time) {
      const existingPage = await service.entities.CoinTransaction.filter(
        { user_id: user.id, type: 'purchase', item_id: itemId },
        { limit: 1 }
      );
      const existing = existingPage.items || [];
      if (existing.length > 0) {
        return Response.json({ error: 'You already own this reward.' }, { status: 409 });
      }
    }

    const before = wallet.balance || 0;
    if (before < price) {
      return Response.json({ error: 'Not enough Haven Tokens.' }, { status: 400 });
    }

    // Conditional deduct: only applied while the stored balance is still at
    // least the price, so overlapping purchases cannot go negative.
    await service.entities.Wallet.updateMany(
      { id: wallet.id, balance: { $gte: price } },
      { $inc: { balance: -price } }
    );
    const after = await service.entities.Wallet.get(wallet.id);
    if (!after || (after.balance || 0) === before) {
      return Response.json({ error: 'Purchase could not complete. Try again.' }, { status: 409 });
    }

    let tx;
    try {
      tx = await service.entities.CoinTransaction.create({
        user_id: user.id,
        type: 'purchase',
        amount: -price,
        reason: `Purchased: ${item.name}`,
        item_id: itemId,
        item_name: item.name,
        balance_after: after.balance,
      });
    } catch (ledgerError) {
      // Ledger write failed: put the coins back so the ledger stays truthful.
      await service.entities.Wallet.update(wallet.id, { balance: before });
      return Response.json({ error: 'Purchase failed and was refunded.' }, { status: 500 });
    }

    return Response.json({ ok: true, wallet: publicWallet(after), transaction: tx });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}