// Shared Haven Tokens (HT) economy helpers used by the economy backend functions.
const DEFAULT_CONFIG = {
  earning_enabled: true,
  coins_per_interval: 10,
  interval_minutes: 30,
  max_backlog_intervals: 3,
  feed_fresh_minutes: 12,
  shop_enabled: true,
};

// Load the singleton config, creating it with default rules on first use.
export async function getConfig(service) {
  const items = await service.entities.EconomyConfig.filter({});
  if (items.length > 0) return items[0];
  return await service.entities.EconomyConfig.create(DEFAULT_CONFIG);
}

// Load (or lazily create) the wallet for a user, backfilling their verified
// Steam id when the wallet predates the link. Only ever called with the
// service-role client from inside backend functions.
export async function getWalletForUser(service, userId, steamId = null) {
  const page = await service.entities.Wallet.filter(
    { user_id: userId },
    { sort: 'created_date', limit: 1 }
  );
  const items = page.items || [];
  if (items.length > 0) {
    const wallet = items[0];
    if (!wallet.steam_id && steamId) {
      try {
        const updated = await service.entities.Wallet.update(wallet.id, { steam_id: steamId });
        return updated || { ...wallet, steam_id: steamId };
      } catch {
        return wallet;
      }
    }
    return wallet;
  }
  return await service.entities.Wallet.create({
    user_id: userId,
    steam_id: steamId || '',
    balance: 0,
  });
}

// A sighting counts as verified playtime only while it is fresh; a stale or
// unavailable feed pauses earning entirely.
export function isFeedFresh(lastSeen, freshMinutes) {
  if (!lastSeen) return false;
  const age = Date.now() - new Date(lastSeen).getTime();
  return age >= 0 && age <= freshMinutes * 60 * 1000;
}

// Wallet projection for API responses: strips the private Steam id so it is
// never exposed to any client.
export function publicWallet(wallet) {
  if (!wallet) return null;
  const { steam_id, ...safe } = wallet;
  return safe;
}