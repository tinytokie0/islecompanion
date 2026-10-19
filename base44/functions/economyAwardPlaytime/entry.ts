import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getConfig, isFeedFresh } from '../../shared/economy.ts';

// Admin / scheduled sweep: awards Haven Tokens for verified playtime.
// For every wallet whose player has a fresh live-feed sighting, awards
// coins_per_interval per elapsed interval since the last award, capped at
// max_backlog_intervals so unverified offline time never pays out. A stale
// or unavailable feed means no awards at all. All math and writes happen
// here on the server — clients can never post a balance or time value.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;
    const config = await getConfig(service);
    if (config.earning_enabled === false) {
      return Response.json({ ok: true, earning_enabled: false, awarded: 0, started: 0 });
    }

    // Every wallet, page by page.
    let wallets = [];
    let cursor = undefined;
    do {
      const page = await service.entities.Wallet.list(cursor ? { limit: 100, cursor } : { limit: 100 });
      wallets = wallets.concat(page.items || []);
      cursor = page.has_more ? page.next_cursor : undefined;
    } while (cursor);

    // Only wallets with a current, matching Steam link can earn: this guards
    // against a stale Steam id left on a wallet after an unlink or a switch
    // to a different Steam account.
    const links = await service.entities.SteamLink.filter({});
    const linkedByUser = new Map(links.map((l) => [l.user_id, l.steam_id]));
    wallets = wallets.filter(
      (w) => w.steam_id && linkedByUser.get(w.user_id) === w.steam_id
    );

    // Latest feed record per Steam id, batched.
    const ids = wallets.map((w) => w.steam_id).filter(Boolean);
    const dinoPage = ids.length > 0
      ? await service.entities.LiveDino.filter({ steam_id: { $in: ids } }, { limit: 500 })
      : { items: [] };
    const dinos = dinoPage.items || [];
    const dinoBySteam = new Map(dinos.map((d) => [d.steam_id, d]));

    const now = Date.now();
    const intervalMs = (config.interval_minutes || 30) * 60000;
    const cap = config.max_backlog_intervals ?? 3;
    const rate = config.coins_per_interval || 10;

    let started = 0;
    let awarded = 0;
    let paid = 0;

    for (const wallet of wallets) {
      const dino = wallet.steam_id ? dinoBySteam.get(wallet.steam_id) : null;
      if (!isFeedFresh(dino ? dino.last_seen : null, config.feed_fresh_minutes)) continue;

      if (!wallet.last_reward_at) {
        // First fresh sighting: start the reward window, no payout yet.
        await service.entities.Wallet.update(wallet.id, { last_reward_at: dino.last_seen });
        started += 1;
        continue;
      }

      const elapsed = now - new Date(wallet.last_reward_at).getTime();
      const full = Math.floor(elapsed / intervalMs);
      if (full <= 0) continue;

      const n = Math.min(full, cap);
      const amount = n * rate;
      const newBalance = (wallet.balance || 0) + amount;
      // Beyond the cap the backlog was not verified live, so it is discarded
      // and the window resets to now.
      const newLast = full > cap
        ? new Date(now).toISOString()
        : new Date(new Date(wallet.last_reward_at).getTime() + n * intervalMs).toISOString();

      await service.entities.Wallet.update(wallet.id, { balance: newBalance, last_reward_at: newLast });
      await service.entities.CoinTransaction.create({
        user_id: wallet.user_id,
        type: 'playtime',
        amount,
        reason: `Verified playtime: ${n} x ${config.interval_minutes} min`,
        balance_after: newBalance,
      });
      awarded += 1;
      paid += amount;
    }

    return Response.json({
      ok: true,
      earning_enabled: true,
      wallets: wallets.length,
      fresh_players: dinos.length,
      started,
      awarded,
      tokens_paid: paid,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}