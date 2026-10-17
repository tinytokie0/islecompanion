// Shared live-feed helpers used by every data ingestion path: parse Arkanis
// player fields, keep one LiveDino snapshot per Steam ID, and accumulate the
// daily FeedDay rollups (which power quests and playtime rewards) so every
// player who appears on the server is accounted for — no matter which
// function recorded them.
//
// Deaths and kills: the feed never reports combat events directly, but a
// death always resets growth to near zero, so a big growth drop between two
// snapshots is treated as a respawn. Kills are a proximity estimate — when a
// player dies, the nearest other player recorded in the same snapshot, within
// radius, is credited with the kill and its prey-diet tally.
const KILL_RADIUS = 2500; // world units

const CARNIVORES = new Set([
  'Allosaurus', 'Austroraptor', 'Carnotaurus', 'Ceratosaurus', 'Deinosuchus',
  'Dilophosaurus', 'Herrerasaurus', 'Omniraptor', 'Pteranodon', 'Troodon',
  'Tyrannosaurus',
]);
const OMNIVORES = new Set(['Beipiaosaurus', 'Hypsilophodon']);

export function dietOf(species) {
  if (!species) return null;
  if (CARNIVORES.has(species)) return 'carnivore';
  if (OMNIVORES.has(species)) return 'omnivore';
  return 'herbivore';
}

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

  const dead = new Set();
  const enriched = clean.map((r) => {
    const prev = prevBySteam.get(r.steam_id) || null;
    const growth = typeof r.growth === 'number' ? r.growth : null;
    const prevGrowth = prev && typeof prev.growth === 'number' ? prev.growth : null;

    let deaths = prev?.deaths || 0;
    let lifeStarted = prev?.life_started_at || null;
    let bestLife = prev?.best_life_minutes || 0;

    if (growth != null && prevGrowth != null && growth < prevGrowth - 15) {
      deaths += 1;
      dead.add(r.steam_id);
      if (lifeStarted) {
        const lifeMin = Math.round((Date.now() - Date.parse(lifeStarted)) / 60000);
        if (lifeMin > bestLife) bestLife = lifeMin;
      }
      lifeStarted = nowIso;
    }
    if (!lifeStarted) lifeStarted = nowIso;

    // Carry forward the last known position when a feed reports none: the
    // roster-only pull (Arkanis) must not wipe GPS coordinates delivered by
    // the position feed until the player respawns or is seen elsewhere.
    const carried =
      r.pos_x == null && prev?.pos_x != null && !dead.has(r.steam_id)
        ? { pos_x: prev.pos_x, pos_y: prev.pos_y, pos_z: prev.pos_z }
        : {};
    return {
      ...r,
      ...carried,
      deaths,
      life_started_at: lifeStarted,
      best_life_minutes: bestLife,
      kills: prev?.kills || 0,
      kills_carnivore: prev?.kills_carnivore || 0,
      kills_herbivore: prev?.kills_herbivore || 0,
      kills_omnivore: prev?.kills_omnivore || 0,
    };
  });

  // Proximity kill attribution: each detected death is credited to the
  // nearest other player in the same snapshot, when they stand within radius
  // and both positions are known. Every death is also logged as a KillEvent
  // for the killfeed, with the killer left empty for environmental deaths.
  const dist = (a, b) => {
    const ax = a.pos_x, ay = a.pos_y, bx = b.pos_x, by = b.pos_y;
    if (ax == null || ay == null || bx == null || by == null) return Infinity;
    return Math.hypot(ax - bx, ay - by);
  };
  const killEvents = [];
  for (const victim of enriched) {
    if (!dead.has(victim.steam_id)) continue;
    let killer = null;
    let killerDist = Infinity;
    for (const cand of enriched) {
      if (cand.steam_id === victim.steam_id) continue;
      const d = dist(cand, victim);
      if (d < killerDist) { killerDist = d; killer = cand; }
    }
    if (killer && killerDist <= KILL_RADIUS) {
      killer.kills += 1;
      const diet = dietOf(victim.species);
      if (diet === 'carnivore') killer.kills_carnivore += 1;
      else if (diet === 'herbivore') killer.kills_herbivore += 1;
      else if (diet === 'omnivore') killer.kills_omnivore += 1;
    }
    const prevVictim = prevBySteam.get(victim.steam_id);
    killEvents.push({
      victim_steam_id: victim.steam_id,
      victim_name: victim.player_name || 'Unknown',
      victim_species: victim.species || 'Unknown',
      victim_growth: prevVictim && typeof prevVictim.growth === 'number' ? prevVictim.growth : null,
      killer_steam_id: killer ? killer.steam_id : '',
      killer_name: killer ? killer.player_name || 'Unknown' : '',
      killer_species: killer ? killer.species || '' : '',
      killer_growth: killer && typeof killer.growth === 'number' ? killer.growth : null,
      killed_date: nowIso,
    });
  }

  await service.entities.LiveDino.upsert(enriched, { key: 'steam_id' });
  if (killEvents.length > 0) {
    await service.entities.KillEvent.bulkCreate(killEvents);
  }

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