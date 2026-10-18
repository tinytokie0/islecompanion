import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser } from '../../shared/economy.ts';

// Battlepass rules — mirrored by the Battlepass page for display. Level comes
// from real wallet XP, which players earn by claiming quests.
const XP_MAX = 500;
const TIERS = Array.from({ length: 10 }, (_, i) => {
  const tier = i + 1;
  return {
    tier,
    free: ["500 HT", "Mossback Skin", "Teleport Voucher", "750 HT", "Ember Stripe", "Reward Pack", "1,000 HT", "Gilded Scales", "Carcass Beacon", "Mythic Pack"][i],
    premium: ["1,000 HT", "Amethyst Veil", "2x XP Weekend", "1,500 HT", "Abyss Watcher", "Apex Pack", "2,500 HT", "Blood Moon", "Prismatic", "Legendary Dino"][i],
  };
});

// Parses the HT amount out of a reward like "1,000 HT"; returns 0 for
// non-HT rewards (skins, packs) which are recorded as claims only.
function htAmount(reward) {
  const m = /^([\d,]+)\s*HT$/i.exec(String(reward || '').trim().replace(/\u00a0/g, ' '));
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const tier = Math.floor(Number(body ? body.tier : NaN));
    const track = body ? body.track : null;
    if (!Number.isFinite(tier) || tier < 1 || tier > 10) {
      return Response.json({ error: 'tier must be 1-10' }, { status: 400 });
    }
    if (track !== 'free' && track !== 'premium') {
      return Response.json({ error: 'track must be "free" or "premium"' }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const wallet = await getWalletForUser(service, user.id);

    // Real progression: the tier unlocks from wallet XP, not client state.
    const level = Math.floor((wallet.xp || 0) / XP_MAX) + 1;
    if (level < tier) {
      return Response.json({ ok: false, error: `Tier ${tier} unlocks at level ${tier}.` }, { status: 403 });
    }

    const existing = await service.entities.BattlepassClaim.filter(
      { user_id: user.id, tier, track },
      { limit: 1 }
    );
    if (existing.items.length > 0) {
      return Response.json({ ok: false, error: 'Already claimed.' }, { status: 409 });
    }

    const reward = TIERS[tier - 1][track];
    await service.entities.BattlepassClaim.create({
      user_id: user.id,
      tier,
      track,
      reward,
      claimed_date: new Date().toISOString(),
    });

    // HT rewards are credited to the real wallet; everything else is a claim record.
    const amount = htAmount(reward);
    let balance = wallet.balance || 0;
    if (amount > 0) {
      await service.entities.Wallet.updateMany(
        { user_id: user.id },
        { $inc: { balance: amount } }
      );
      const fresh = await getWalletForUser(service, user.id);
      balance = fresh.balance;
      await service.entities.CoinTransaction.create({
        user_id: user.id,
        type: 'quest',
        amount,
        reason: `Battlepass ${track} tier ${tier}: ${reward}`,
        balance_after: balance,
      });
    }

    return Response.json({ ok: true, reward, balance, level });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}