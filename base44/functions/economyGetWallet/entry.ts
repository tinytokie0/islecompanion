import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getConfig, getWalletForUser, isFeedFresh, publicWallet, dailyClaimInfo } from '../../shared/economy.ts';

// Signed-in player's own wallet, economy rules and live earning progress.
// Creates the wallet on first visit and backfills the verified Steam id.
// Never awards coins itself: the scheduled sweep owns all playtime awards.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const service = base44.asServiceRole;
    const links = await service.entities.SteamLink.filter({ user_id: user.id });
    const steamId = links.length > 0 ? links[0].steam_id : null;

    const config = await getConfig(service);
    const wallet = await getWalletForUser(service, user.id, steamId);

    const earn = {
      enabled: config.earning_enabled !== false,
      tracked: false,
      fresh: false,
      next_in_minutes: null,
      rate: config.coins_per_interval,
      interval_minutes: config.interval_minutes,
    };

    if (earn.enabled && steamId) {
      const dinoPage = await service.entities.LiveDino.filter({ steam_id: steamId }, { sort: '-last_seen', limit: 1 });
      const dino = (dinoPage.items || [])[0] || null;
      const fresh = isFeedFresh(dino ? dino.last_seen : null, config.feed_fresh_minutes);
      earn.tracked = !!dino;
      earn.fresh = fresh;
      if (fresh && wallet.last_reward_at) {
        const minutes = (Date.now() - new Date(wallet.last_reward_at).getTime()) / 60000;
        earn.next_in_minutes = Math.max(0, Math.ceil(config.interval_minutes - minutes));
      } else if (fresh) {
        earn.next_in_minutes = config.interval_minutes;
      }
    }

    return Response.json({
      wallet: publicWallet(wallet),
      config,
      earn,
      daily_claim: dailyClaimInfo(wallet),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}