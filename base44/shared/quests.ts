import { dietOf } from './feed.ts';

// Quest catalog and real-data progress helpers shared by the quest backend
// functions. Progress is always computed server-side from FeedDay rollups and
// KillEvents of the live Arkanis feed (The Isle: Evrima) — clients never post
// progress or claim results. difficulty: easy | medium | hard.
export const QUEST_CATALOG = [
  // Daily
  { id: 'd1', cadence: 'daily', difficulty: 'medium', title: 'Survive 30 minutes on Evrima', metric: 'minutes', target: 30, tokens: 50, xp: 150 },
  { id: 'd2', cadence: 'daily', difficulty: 'medium', title: 'Gain 1% growth on any dino', metric: 'growth', target: 1, tokens: 50, xp: 100 },
  { id: 'd3', cadence: 'daily', difficulty: 'easy', title: 'Be seen alive on the island', metric: 'sightings', target: 1, tokens: 25, xp: 50 },
  { id: 'd6', cadence: 'daily', difficulty: 'easy', title: 'First blood: make a kill on Evrima', metric: 'kills', target: 1, tokens: 75, xp: 150 },
  { id: 'd7', cadence: 'daily', difficulty: 'hard', title: 'Rampage: score 3 kills in a single day', metric: 'kills', target: 3, tokens: 200, xp: 500 },
  { id: 'd8', cadence: 'daily', difficulty: 'medium', title: 'Survive 90 minutes in a single day', metric: 'minutes', target: 90, tokens: 100, xp: 250 },
  // Weekly
  { id: 'w1', cadence: 'weekly', difficulty: 'medium', title: 'Play 120 minutes this week', metric: 'minutes', target: 120, tokens: 200, xp: 500 },
  { id: 'w2', cadence: 'weekly', difficulty: 'medium', title: 'Play on 3 different days', metric: 'days', target: 3, tokens: 250, xp: 400 },
  { id: 'w3', cadence: 'weekly', difficulty: 'medium', title: 'Gain 10% growth this week', metric: 'growth', target: 10, tokens: 300, xp: 800 },
  { id: 'w7', cadence: 'weekly', difficulty: 'easy', title: 'Graze patrol: kill 5 herbivores this week', metric: 'herbivore_kills', target: 5, tokens: 200, xp: 400 },
  { id: 'w8', cadence: 'weekly', difficulty: 'hard', title: 'Pack hunter: 10 kills this week', metric: 'kills', target: 10, tokens: 450, xp: 1000 },
  { id: 'w9', cadence: 'weekly', difficulty: 'medium', title: 'Evolution: reach 50% growth on any dino this week', metric: 'peak_growth', target: 50, tokens: 400, xp: 900 },
  // Monthly
  { id: 'm1', cadence: 'monthly', difficulty: 'medium', title: 'Play 600 minutes this month', metric: 'minutes', target: 600, tokens: 800, xp: 1500 },
  { id: 'm2', cadence: 'monthly', difficulty: 'hard', title: 'Reach 80% growth on any dino', metric: 'peak_growth', target: 80, tokens: 1000, xp: 2500 },
  { id: 'm3', cadence: 'monthly', difficulty: 'medium', title: 'Play on 10 different days', metric: 'days', target: 10, tokens: 1200, xp: 2000 },
  { id: 'm8', cadence: 'monthly', difficulty: 'easy', title: 'Trophy hunter: 10 kills this month', metric: 'kills', target: 10, tokens: 700, xp: 1400 },
  // Elite: hard, long-term contracts for dedicated players. Same live-feed
  // metrics, far higher targets and payouts.
  { id: 'd4', cadence: 'daily', tier: 'elite', difficulty: 'hard', title: 'Survive 3 hours on Evrima in a single day', metric: 'minutes', target: 180, tokens: 200, xp: 500 },
  { id: 'd5', cadence: 'daily', tier: 'elite', difficulty: 'hard', title: 'Gain 10% growth in a single day', metric: 'growth', target: 10, tokens: 250, xp: 600 },
  { id: 'w4', cadence: 'weekly', tier: 'elite', difficulty: 'hard', title: 'Play 480 minutes (8 hours) this week', metric: 'minutes', target: 480, tokens: 500, xp: 1200 },
  { id: 'w5', cadence: 'weekly', tier: 'elite', difficulty: 'hard', title: 'Gain 25% growth this week', metric: 'growth', target: 25, tokens: 600, xp: 1500 },
  { id: 'w6', cadence: 'weekly', tier: 'elite', difficulty: 'hard', title: 'Play on 6 different days this week', metric: 'days', target: 6, tokens: 450, xp: 1000 },
  { id: 'm4', cadence: 'monthly', tier: 'elite', difficulty: 'hard', title: 'Play 1800 minutes (30 hours) this month', metric: 'minutes', target: 1800, tokens: 2000, xp: 5000 },
  { id: 'm5', cadence: 'monthly', tier: 'elite', difficulty: 'hard', title: 'Gain 50% growth this month', metric: 'growth', target: 50, tokens: 2500, xp: 6000 },
  { id: 'm6', cadence: 'monthly', tier: 'elite', difficulty: 'hard', title: 'Play on 20 different days this month', metric: 'days', target: 20, tokens: 2200, xp: 5000 },
  { id: 'm7', cadence: 'monthly', tier: 'elite', difficulty: 'hard', title: 'Reach 100% growth (full adult) on any dino this month', metric: 'peak_growth', target: 100, tokens: 3000, xp: 8000 },
  { id: 'm9', cadence: 'monthly', tier: 'elite', difficulty: 'hard', title: 'Apex of Evrima: 40 kills this month', metric: 'kills', target: 40, tokens: 2500, xp: 5000 },
];

function utcDateStr(d) {
  return d.toISOString().slice(0, 10);
}

// ISO-8601 week key, e.g. 2026-W43.
export function isoWeekKey(d) {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Period key a quest belongs to at the given time.
export function periodKey(cadence, now = new Date()) {
  if (cadence === 'daily') return utcDateStr(now);
  if (cadence === 'weekly') return isoWeekKey(now);
  return utcDateStr(now).slice(0, 7);
}

// Inclusive UTC day range [start, end] covered by a period key.
export function periodRange(cadence, key) {
  if (cadence === 'daily') return { start: key, end: key };
  if (cadence === 'monthly') {
    const [y, m] = key.split('-').map(Number);
    const last = new Date(Date.UTC(y, m, 0));
    return { start: `${key}-01`, end: utcDateStr(last) };
  }
  const [y, w] = key.split('-W').map(Number);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - day + 1 + (w - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { start: utcDateStr(monday), end: utcDateStr(sunday) };
}

// Progress for a metric over the rollups of one period. One sighting is
// roughly 5 minutes of verified playtime (the recorder runs every 5 minutes).
// Kill metrics come from the live feed's KillEvents, already filtered to the
// player's own kills within the period.
export function progressFor(metric, rollups, killEvents = []) {
  if (metric === 'minutes') {
    return rollups.reduce((a, r) => a + (r.sightings || 0) * 5, 0);
  }
  if (metric === 'sightings') {
    return rollups.reduce((a, r) => a + (r.sightings || 0), 0);
  }
  if (metric === 'days') {
    return rollups.length;
  }
  if (metric === 'growth') {
    return Math.round(rollups.reduce((a, r) => a + Math.max(0, (r.max_growth || 0) - (r.min_growth || 0)), 0) * 10) / 10;
  }
  if (metric === 'peak_growth') {
    return rollups.reduce((a, r) => Math.max(a, r.max_growth || 0), 0);
  }
  if (metric === 'kills') {
    return killEvents.length;
  }
  if (metric === 'herbivore_kills') {
    return killEvents.filter((e) => dietOf(e.victim_species) === 'herbivore').length;
  }
  return 0;
}

// Progress for one quest in one period: filters rollups to the period's UTC
// days and kill events to the period's datetime window, then computes.
export function questProgress(quest, period, rollups, killEvents = []) {
  const { start, end } = periodRange(quest.cadence, period);
  const inPeriod = rollups.filter((r) => r.day >= start && r.day <= end);
  const from = `${start}T00:00:00.000Z`;
  const to = `${end}T23:59:59.999Z`;
  const kills = (killEvents || []).filter(
    (e) => (e.killed_date || '') >= from && (e.killed_date || '') <= to
  );
  return progressFor(quest.metric, inPeriod, kills);
}

// Compute every quest's progress for a user from their rollups, persisting
// increases into QuestProgress (claimed state is never touched here).
// killEvents is the player's own KillEvents (as killer) since the month start,
// so kill-based quests track real feed data.
export async function syncQuestProgress(service, userId, allRollups, now = new Date(), killEvents = []) {
  const out = [];
  for (const q of QUEST_CATALOG) {
    const period = periodKey(q.cadence, now);
    const progress = questProgress(q, period, allRollups, killEvents);
    const page = await service.entities.QuestProgress.filter(
      { user_id: userId, quest_id: q.id, period },
      { limit: 1 }
    );
    let rec = (page.items || [])[0];
    if (rec) {
      if ((rec.progress || 0) < progress) {
        rec = await service.entities.QuestProgress.update(rec.id, { progress });
      }
    } else {
      rec = await service.entities.QuestProgress.create({
        user_id: userId, quest_id: q.id, period, progress, claimed: false,
      });
    }
    out.push({
      ...q,
      progress: rec ? rec.progress ?? progress : progress,
      claimed: rec ? rec.claimed === true : false,
    });
  }
  return out;
}