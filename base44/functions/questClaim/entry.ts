import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser, publicWallet } from '../../shared/economy.ts';
import { QUEST_CATALOG, periodKey, periodRange, progressFor } from '../../shared/quests.ts';

// Claim a completed quest: progress is re-computed server-side from live-feed
// rollups, the claim is checked, and the reward (Haven Tokens + XP) is paid
// with an auditable ledger entry. Clients can never claim twice or early.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const quest = QUEST_CATALOG.find((q) => q.id === String(body.quest_id || ''));
    if (!quest) return Response.json({ error: 'Unknown quest.' }, { status: 400 });

    const service = base44.asServiceRole;
    const linkPage = await service.entities.SteamLink.filter({ user_id: user.id }, { limit: 1 });
    const link = (linkPage.items || [])[0];
    if (!link) return Response.json({ error: 'Link your Steam account first.' }, { status: 400 });

    const now = new Date();
    const period = periodKey(quest.cadence, now);
    const { start, end } = periodRange(quest.cadence, period);
    const rollPage = await service.entities.FeedDay.filter(
      { steam_id: link.steam_id, day: { $gte: start, $lte: end } },
      { limit: 500 }
    );
    const progress = progressFor(quest.metric, rollPage.items || []);

    const recPage = await service.entities.QuestProgress.filter(
      { user_id: user.id, quest_id: quest.id, period },
      { limit: 1 }
    );
    let rec = (recPage.items || [])[0];
    if (!rec) {
      rec = await service.entities.QuestProgress.create({
        user_id: user.id, quest_id: quest.id, period, progress, claimed: false,
      });
    }
    if (progress < quest.target) {
      return Response.json({ error: 'Quest not complete yet.' }, { status: 400 });
    }

    // Atomically claim first: only one concurrent request can flip the flag,
    // so a race can never pay the reward twice. Verified by the claim stamp.
    const claimedDate = now.toISOString();
    await service.entities.QuestProgress.updateMany(
      { id: rec.id, claimed: false },
      { $set: { claimed: true, progress, claimed_date: claimedDate } }
    );
    const verify = await service.entities.QuestProgress.get(rec.id);
    if (!verify || verify.claimed_date !== claimedDate) {
      return Response.json({ error: 'Already claimed for this period.' }, { status: 409 });
    }

    // Reward: atomic increments so concurrent spends keep their balance.
    await service.entities.Wallet.updateMany(
      { user_id: user.id },
      { $inc: { balance: quest.tokens, xp: quest.xp } }
    );
    const wallet = await getWalletForUser(service, user.id, link.steam_id);
    await service.entities.CoinTransaction.create({
      user_id: user.id,
      type: 'quest',
      amount: quest.tokens,
      reason: `Quest reward: ${quest.title}`,
      balance_after: wallet.balance,
    });

    return Response.json({
      ok: true,
      wallet: publicWallet(wallet),
      quest: { ...quest, progress, claimed: true },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}