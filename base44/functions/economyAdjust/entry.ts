import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser, publicWallet } from '../../shared/economy.ts';

// Admin-only staff adjustment: grant, deduct or refund Haven Tokens for a
// player, always with a recorded reason and an auditable ledger entry.
// Refunds may reference a shop purchase via item_id: the player's latest
// unrefunded purchase record for that item is marked refunded, so a refunded
// one-time reward can be bought again. Server-side authorization: non-admins
// get 403.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const userId = String(body.user_id || '');
    const type = String(body.type || '');
    const amount = Math.floor(Number(body.amount));
    const reason = String(body.reason || '').trim();
    const purchaseItemId = String(body.item_id || '').trim();

    if (!userId) return Response.json({ error: 'user_id is required' }, { status: 400 });
    if (!['staff_grant', 'staff_deduct', 'refund'].includes(type)) {
      return Response.json({ error: 'type must be staff_grant, staff_deduct or refund' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: 'amount must be a positive number of HT' }, { status: 400 });
    }
    if (!reason) return Response.json({ error: 'A reason is required.' }, { status: 400 });

    const service = base44.asServiceRole;
    const wallet = await getWalletForUser(service, userId, null);

    const signed = type === 'staff_deduct' ? -amount : amount;
    const after = (wallet.balance || 0) + signed;
    if (after < 0) {
      return Response.json({ error: 'This deduction would make the balance negative.' }, { status: 400 });
    }

    // Refund tied to a purchase: validate and mark the purchase refunded.
    let purchase = null;
    if (type === 'refund' && purchaseItemId) {
      const purPage = await service.entities.Purchase.filter(
        { user_id: userId, item_id: purchaseItemId, refunded: false },
        { sort: '-created_date', limit: 1 }
      );
      purchase = (purPage.items || [])[0] || null;
      if (!purchase) {
        return Response.json({ error: 'No unrefunded purchase found for this player and reward.' }, { status: 404 });
      }
    }

    const updated = await service.entities.Wallet.update(wallet.id, { balance: after });
    const tx = await service.entities.CoinTransaction.create({
      user_id: userId,
      type,
      amount: signed,
      reason: purchase
        ? `Refund: ${purchase.item_name || purchaseItemId} — ${reason}`
        : reason,
      item_id: purchase ? purchase.item_id : undefined,
      item_name: purchase ? purchase.item_name : undefined,
      staff_admin_id: user.id,
      balance_after: after,
    });

    if (purchase) {
      await service.entities.Purchase.update(purchase.id, {
        refunded: true,
        refunded_date: new Date().toISOString(),
        refund_amount: amount,
      });
    }

    return Response.json({
      ok: true,
      wallet: publicWallet(updated || { ...wallet, balance: after }),
      transaction: tx,
      refunded_purchase_id: purchase ? purchase.id : undefined,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}