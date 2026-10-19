import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getConfig, getWalletForUser, publicWallet } from '../../shared/economy.ts';

// Secure purchase of a shop reward with Haven Tokens. Checks the item is
// active, enforces one-time rewards with an atomic ownership record, deducts
// the price with a conditional update that can never drive the balance
// negative, writes an auditable ledger record and a persistent purchase
// record. If any write after the deduction fails, the coins are refunded.
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

    // Ownership guard for one-time rewards: the upsert is atomic on
    // (user_id, item_id), so two simultaneous submissions cannot both pass.
    let guardRecordId = null;
    if (item.one_time) {
      const up = await service.entities.Purchase.upsert(
        [{
          user_id: user.id,
          item_id: itemId,
          item_name: item.name,
          category: item.category,
          price,
          refunded: false,
        }],
        { key: ['user_id', 'item_id'] }
      );
      if (up.updated > 0) {
        // The record already existed: owned, unless it was refunded.
        const existingPage = await service.entities.Purchase.filter(
          { user_id: user.id, item_id: itemId },
          { limit: 1 }
        );
        const rec = (existingPage.items || [])[0];
        if (rec && rec.refunded) {
          // Refunded rewards may be bought again: re-own the record.
          await service.entities.Purchase.update(rec.id, {
            refunded: false,
            refunded_date: null,
            refund_amount: null,
            price,
          });
        } else {
          return Response.json({ error: 'You already own this reward.' }, { status: 409 });
        }
      } else {
        guardRecordId = ((up.records || [])[0] || {}).id || null;
      }
    }

    const before = wallet.balance || 0;
    if (before < price) {
      if (guardRecordId) await service.entities.Purchase.delete(guardRecordId);
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
      if (guardRecordId) await service.entities.Purchase.delete(guardRecordId);
      return Response.json({ error: 'Purchase could not complete. Try again.' }, { status: 409 });
    }

    try {
      const tx = await service.entities.CoinTransaction.create({
        user_id: user.id,
        type: 'purchase',
        amount: -price,
        reason: `Purchased: ${item.name}`,
        item_id: itemId,
        item_name: item.name,
        balance_after: after.balance,
      });
      if (!item.one_time) {
        // One-time items already own their persistent purchase record.
        await service.entities.Purchase.create({
          user_id: user.id,
          item_id: itemId,
          item_name: item.name,
          category: item.category,
          price,
          refunded: false,
        });
      }
      return Response.json({ ok: true, wallet: publicWallet(after), transaction: tx });
    } catch (ledgerError) {
      // Ledger or purchase-record write failed: put the coins back so the
      // ledger stays truthful, and release the ownership guard.
      await service.entities.Wallet.update(wallet.id, { balance: before });
      if (item.one_time) {
        if (guardRecordId) {
          await service.entities.Purchase.delete(guardRecordId);
        } else {
          await service.entities.Purchase.updateMany(
            { user_id: user.id, item_id: itemId },
            { $set: { refunded: true, refunded_date: new Date().toISOString() } }
          );
        }
      }
      return Response.json({ error: 'Purchase failed and was refunded.' }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}