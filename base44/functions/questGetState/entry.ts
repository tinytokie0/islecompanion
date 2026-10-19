import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser, publicWallet } from '../../shared/economy.ts';
import { QUEST_CATALOG, periodKey, periodRange, syncQuestProgress } from '../../shared/quests.ts';

// Signed-in quest state: progress is computed from the player's live-feed
// rollups (real server sightings) and persisted. Never trusts client values.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const service = base44.asServiceRole;
    const linkPage = await service.entities.SteamLink.filter({ user_id: user.id }, { limit: 1 });
    const link = (linkPage.items || [])[0];
    const wallet = await getWalletForUser(service, user.id, link ? link.steam_id : null);

    if (!link) {
      return Response.json({
        linked: false,
        quests: QUEST_CATALOG.map((q) => ({ ...q, progress: 0, claimed: false })),
        wallet: publicWallet(wallet),
      });
    }

    // This month's rollups cover the daily and weekly periods too.
    const now = new Date();
    const { start, end } = periodRange('monthly', periodKey('monthly', now));
    const rollPage = await service.entities.FeedDay.filter(
      { steam_id: link.steam_id, day: { $gte: start, $lte: end } },
      { limit: 500 }
    );
    // This month's kills by the player power the kill-based quests.
    const killPage = await service.entities.KillEvent.filter(
      { killer_steam_id: link.steam_id, killed_date: { $gte: `${start}T00:00:00.000Z`, $lte: `${end}T23:59:59.999Z` } },
      { limit: 1000, fields: ['victim_species', 'killed_date'] }
    );
    const quests = await syncQuestProgress(service, user.id, rollPage.items || [], now, killPage.items || []);

    return Response.json({ linked: true, quests, wallet: publicWallet(wallet) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}