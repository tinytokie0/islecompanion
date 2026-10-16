// Shared live-feed helpers used by every data ingestion path: parse Arkanis
// player fields, keep one LiveDino snapshot per Steam ID, and accumulate the
// daily FeedDay rollups (which power quests and playtime rewards) so every
// player who appears on the server is accounted for — no matter which
// function recorded them.
export function speciesFromPath(path) {
  const m = /BP_([A-Za-z]+)\.BP_[A-Za-z]+_C/.exec(path || '');
  if (!m) return 'Unknown';
  return m[1].replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function growthNumber(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const n = parseFloat(String(raw || '').replace('%', ''));
  return Number.isFinite(n) ? n : null;
}

// Upsert the latest snapshot per player and record one sighting per player
// for the UTC day. Duplicate Steam IDs in one batch collapse to the last
// entry, so a player seen on two feeds in the same run counts once.
//
// Deaths and life spans: the feed never reports death events directly, but a
// death always resets growth to near zero, so a big growth drop between two
// snapshots is treated as a respawn. Each player accumulates a death count
// and their best tracked life (minutes between life start and the death).
export async function applyFeedRecords(service, records, nowIso) {
  const bySteam = new Map();
  for (const r of records) {
    if (r && r.steam_id) bySteam.set(String(r.steam_id), r);
  }
  const clean = [...bySteam.values()];
  if (clean.length === 0) return { upserted: 0 };

  const steamIds = clean.map((r) => r.steam_id);
  const dinoPage = await service.entities.LiveDino.filter(
    { steam_id: { $in: steamIds } },
    { limit: 500 }
  );
  const prevBySteam = new Map((dinoPage.items || []).map((r) => [r.steam_id, r]));

  const enriched = clean.map((r) => {
    const prev = prevBySteam.get(r.steam_id) || null;
    const growth = typeof r.growth === 'number' ? r.growth : null;
    const prevGrowth = prev && typeof prev.growth === 'number' ? prev.growth : null;

    let deaths = prev?.deaths || 0;
    let lifeStarted = prev?.life_started_at || null;
    let bestLife = prev?.best_life_minutes || 0;

    if (growth != null && prevGrowth != null && growth < prevGrowth - 15) {
      deaths += 1;
      if (lifeStarted) {
        const lifeMin = Math.round((Date.now() - Date.parse(lifeStarted)) / 60000);
        if (lifeMin > bestLife) bestLife = lifeMin;
      }
      lifeStarted = nowIso;
    }
    if (!lifeStarted) lifeStarted = nowIso;

    return { ...r, deaths, life_started_at: lifeStarted, best_life_minutes: bestLife };
  });

  await service.entities.LiveDino.upsert(enriched, { key: 'steam_id' });

  const day = nowIso.slice(0, 10);
  const rollPage = await service.entities.FeedDay.filter(
    { steam_id: { $in: steamIds }, day },
    { limit: 500 }
  );
  const prevBySteamDay = new Map((rollPage.items || []).map((r) => [r.steam_id, r]));
  for (const r of enriched) {
    const prev = prevBySteamDay.get(r.steam_id);
    const growth = typeof r.growth === 'number' ? r.growth : null;
    const minG = growth != null && prev?.min_growth != null
      ? Math.min(prev.min_growth, growth)
      : (growth ?? prev?.min_growth ?? 0);
    const maxG = growth != null && prev?.max_growth != null
      ? Math.max(prev.max_growth, growth)
      : (growth ?? prev?.max_growth ?? 0);
    const payload = {
      steam_id: r.steam_id,
      day,
      player_name: r.player_name,
      species: r.species,
      sightings: (prev?.sightings || 0) + 1,
      first_seen: prev?.first_seen || nowIso,
      last_seen: nowIso,
      min_growth: minG,
      max_growth: maxG,
    };
    if (prev) await service.entities.FeedDay.update(prev.id, payload);
    else await service.entities.FeedDay.create(payload);
  }
  return { upserted: enriched.length };
}