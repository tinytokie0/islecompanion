import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser } from '../../shared/economy.ts';

// Player activity spending of Haven Tokens (HT) for portal activities
// (dino shop, packs, trading market). Casino payouts are settled server-side
// by the casinoPlay function — no client-supplied amount is ever credited.
// Server-side only: the balance change is an atomic conditional write anchored
// on the exact current balance, and every change lands in the ledger.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const action = body ? body.action : null;
    const amount = Math.floor(Number(body ? body.amount : NaN));
    const reason = body && typeof body.reason === 'string' && body.reason.trim()
      ? body.reason.trim().slice(0, 140)
      : 'Portal activity';

    // Wins are never client-awardable: the only accepted action is a spend.
    if (action !== 'spend') {
      return Response.json({ error: 'action must be "spend"' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 1 || amount > 1000000) {
      return Response.json({ error: 'amount must be a whole number between 1 and 1,000,000' }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const wallet = await getWalletForUser(service, user.id);
    const oldBalance = wallet.balance || 0;

    if (action === 'spend' && oldBalance < amount) {
      const fresh = await getWalletForUser(service, user.id);
      return Response.json(
        { ok: false, error: 'Not enough Haven Tokens.', balance: fresh.balance },
        { status: 409 }
      );
    }

    const nextBalance = oldBalance - amount;

    // Atomic guard anchored on the exact current balance: only one concurrent
    // request's write can match the pre-transaction balance.
    await service.entities.Wallet.updateMany(
      { user_id: user.id, balance: oldBalance },
      { $set: { balance: nextBalance } }
    );
    const winners = await service.entities.Wallet.filter({ user_id: user.id, balance: nextBalance });
    if (winners.length === 0) {
      const fresh = await getWalletForUser(service, user.id);
      return Response.json(
        { ok: false, error: 'Balance changed, try again.', balance: fresh.balance },
        { status: 409 }
      );
    }

    const tx = await service.entities.CoinTransaction.create({
      user_id: user.id,
      type: 'game',
      amount: -amount,
      reason,
      balance_after: nextBalance,
    });

    return Response.json({ ok: true, balance: nextBalance, transaction: tx });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}