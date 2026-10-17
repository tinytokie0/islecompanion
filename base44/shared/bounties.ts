// Shared bounty settlement used by the live feed and the claim endpoint:
// pays a bounty's HT reward to a verified app-user killer, writes the ledger
// entry and closes the bounty with the killer's details.
import { getWalletForUser } from './economy.ts';

export async function payBounty(service, bounty, killer, userId, nowIso) {
  const wallet = await getWalletForUser(service, userId);
  const after = (wallet.balance || 0) + bounty.amount;
  await service.entities.Wallet.update(wallet.id, { balance: after });
  await service.entities.CoinTransaction.create({
    user_id: userId,
    type: 'game',
    amount: bounty.amount,
    reason: `Bounty collected on ${bounty.target_name}`,
    balance_after: after,
  });
  await service.entities.Bounty.update(bounty.id, {
    status: 'collected',
    killer_steam_id: killer.steam_id,
    killer_name: killer.player_name || 'Unknown',
    collected_by_user_id: userId,
    collected_date: nowIso,
  });
  return after;
}

// Settle open bounties against fresh kill events from the feed. Bounties are
// matched by target in-game name, case-insensitive. A killer without a linked
// app account leaves the bounty open — they can claim it from the board after
// linking their Steam account.
export async function collectBounties(service, killEvents, nowIso) {
  const withKiller = killEvents.filter((e) => e.killer_steam_id);
  if (withKiller.length === 0) return { settled: 0 };
  const page = await service.entities.Bounty.filter({ status: 'open' }, { limit: 500 });
  const open = page.items || [];
  if (open.length === 0) return { settled: 0 };

  const byName = new Map();
  for (const b of open) {
    const key = String(b.target_name || '').trim().toUpperCase();
    if (!key) continue;
    byName.set(key, [...(byName.get(key) || []), b]);
  }

  let settled = 0;
  for (const e of withKiller) {
    const matches = byName.get(String(e.victim_name || '').trim().toUpperCase()) || [];
    for (const bounty of matches) {
      const linkPage = await service.entities.SteamLink.filter(
        { steam_id: e.killer_steam_id },
        { limit: 1 }
      );
      const link = (linkPage.items || [])[0];
      if (!link) continue;
      await payBounty(
        service,
        bounty,
        { steam_id: e.killer_steam_id, player_name: e.killer_name },
        link.user_id,
        nowIso
      );
      settled += 1;
    }
  }
  return { settled };
}