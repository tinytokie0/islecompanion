import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  DAILY_CLAIM_AMOUNT,
  DAILY_CLAIM_COOLDOWN_MS,
  getWalletForUser,
  dailyClaimInfo,
} from '../../shared/economy.ts';

// Daily claim: 3,000 HT once every 24 hours for any authenticated player with
// a verified Steam-linked wallet. Server-side only: the claim is guarded by an
// atomic conditional update on the wallet's claim timestamp, so rapid repeated
// requests and simultaneous requests cannot double-award. Every successful
// claim is recorded in the transaction ledger as "Daily Claim".
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const service = base44.asServiceRole;

    // Claims are tied to the player's verified Steam-linked wallet.
    const links = await service.entities.SteamLink.filter({ user_id: user.id });
    const steamId = links.length > 0 ? links[0].steam_id : null;
    if (!steamId) {
      return Response.json(
        { error: 'Link your Steam account first to claim your daily reward.', needs_steam_link: true },
        { status: 400 }
      );
    }

    const wallet = await getWalletForUser(service, user.id, steamId);
    const now = new Date();
    const last = wallet.last_daily_claim_at ? new Date(wallet.last_daily_claim_at).getTime() : 0;
    const eligibleAt = last + DAILY_CLAIM_COOLDOWN_MS;
    if (now.getTime() < eligibleAt) {
      return Response.json(
        {
          ok: false,
          error: 'Daily claim already used.',
          ...dailyClaimInfo(wallet),
        },
        { status: 409 }
      );
    }

    // Atomic guard anchored on the exact current balance: only one concurrent
    // request's write can match the pre-claim balance, so the balance can
    // never be incremented twice for the same claim window.
    const oldBalance = wallet.balance || 0;
    await service.entities.Wallet.updateMany(
      { user_id: user.id, balance: oldBalance },
      {
        $set: {
          balance: oldBalance + DAILY_CLAIM_AMOUNT,
          last_daily_claim_at: now.toISOString(),
        },
      }
    );

    // Confirm this request's write is the wallet's final state; if a
    // concurrent request overwrote it, that one won and this one is rejected.
    const winners = await service.entities.Wallet.filter({
      user_id: user.id,
      balance: oldBalance + DAILY_CLAIM_AMOUNT,
      last_daily_claim_at: now.toISOString(),
    });
    if (winners.length === 0) {
      const fresh = await getWalletForUser(service, user.id, steamId);
      return Response.json(
        {
          ok: false,
          error: 'Daily claim already used.',
          ...dailyClaimInfo(fresh),
        },
        { status: 409 }
      );
    }

    const finalWallet = winners[0];

    // Ledger entry: amount, timestamp (created_date), reason "Daily Claim".
    const tx = await service.entities.CoinTransaction.create({
      user_id: user.id,
      type: 'daily_claim',
      amount: DAILY_CLAIM_AMOUNT,
      reason: 'Daily Claim',
      balance_after: finalWallet.balance,
    });

    return Response.json({
      ok: true,
      amount: DAILY_CLAIM_AMOUNT,
      balance: finalWallet.balance,
      next_available_at: new Date(now.getTime() + DAILY_CLAIM_COOLDOWN_MS).toISOString(),
      transaction: tx,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}