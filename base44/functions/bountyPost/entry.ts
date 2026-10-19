import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser } from '../../shared/economy.ts';

const MIN_BOUNTY = 100;
const MAX_BOUNTY = 1000000;

// Post a bounty: deducts the pot from the poster's Haven Tokens up front with
// an atomic balance-anchored write and an auditable ledger entry, then puts
// the bounty on the board. The live feed settles it when the target dies.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetName = String(body.target_name || '').trim();
    const amount = Math.floor(Number(body.amount));
    if (targetName.length < 2 || targetName.length > 40) {
      return Response.json({ error: 'Enter the target player name (2-40 characters).' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < MIN_BOUNTY || amount > MAX_BOUNTY) {
      return Response.json(
        { error: `Bounty must be a whole number between ${MIN_BOUNTY} and ${MAX_BOUNTY} HT.` },
        { status: 400 }
      );
    }

    const service = base44.asServiceRole;
    const wallet = await getWalletForUser(service, user.id);
    const oldBalance = wallet.balance || 0;
    if (oldBalance < amount) {
      return Response.json(
        { ok: false, error: 'Not enough Haven Tokens.', balance: oldBalance },
        { status: 409 }
      );
    }

    // Atomic spend anchored on the exact current balance.
    const nextBalance = oldBalance - amount;
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

    const bounty = await service.entities.Bounty.create({
      poster_user_id: user.id,
      poster_name: user.full_name || user.email,
      target_name: targetName,
      amount,
      status: 'open',
    });
    await service.entities.CoinTransaction.create({
      user_id: user.id,
      type: 'game',
      amount: -amount,
      reason: `Bounty placed on ${targetName}`,
      balance_after: nextBalance,
    });

    return Response.json({ ok: true, bounty, balance: nextBalance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}