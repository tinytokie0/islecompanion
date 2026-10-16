import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Inbound feed for The Isle server player data (Arkanis Isle Plugin roster
// or any UE4SS mod). POST JSON:
//   { "players": [ { "steam_id": "...", "name": "...", "species": "...",
//     "growth": 63, "health": 5302, "stamina": 1000, "hunger": 18.5,
//     "thirst": 880, "position": {"x": 1.2, "y": 3.4, "z": 5.6},
//     "sex": "female" }, ... ] }
// Authenticity: the shared feed secret sent as the "x-feed-secret" header
// or a "secret" query param, verified with an exact string match.
const MAX_PLAYERS = 200;

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default async function (req) {
  try {
    // Verify the feed secret first — this endpoint is unauthenticated, so
    // anyone could otherwise write player data into the app.
    const expected = secrets.get('ARKANIS_FEED_SECRET') || '';
    const url = new URL(req.url);
    const provided = req.headers.get('x-feed-secret') || url.searchParams.get('secret') || '';
    if (!expected || provided.length !== expected.length || provided !== expected) {
      return Response.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (req.method !== 'POST') {
      return Response.json({ success: false, error: 'POST only.' }, { status: 405 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ success: false, error: 'Body must be JSON.' }, { status: 400 });
    }

    const rawPlayers = Array.isArray(body?.players) ? body.players : null;
    if (!rawPlayers || rawPlayers.length === 0) {
      return Response.json({
        success: false,
        error: 'Body must include a non-empty "players" array.',
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const records = [];
    for (const p of rawPlayers.slice(0, MAX_PLAYERS)) {
      const steamId = String(p?.steam_id || '').trim();
      if (!steamId) continue; // upsert key required
      const pos = p?.position && typeof p.position === 'object' ? p.position : {};
      records.push({
        steam_id: steamId,
        player_name: String(p?.name || p?.player_name || '').trim() || null,
        species: String(p?.species || '').trim() || null,
        sex: String(p?.sex || '').trim() || null,
        growth: num(p?.growth),
        health: num(p?.health),
        stamina: num(p?.stamina),
        hunger: num(p?.hunger),
        thirst: num(p?.thirst),
        pos_x: num(pos.x),
        pos_y: num(pos.y),
        pos_z: num(pos.z),
        server_name: String(body?.server_name || p?.server_name || '').trim() || null,
        last_seen: now,
      });
    }

    if (records.length === 0) {
      return Response.json({
        success: false,
        error: 'No valid players: every entry needs a steam_id.',
      }, { status: 400 });
    }

    // One upsert keeps the latest snapshot per Steam ID (one record per player).
    const base44 = createClientFromRequest(req);
    await base44.asServiceRole.entities.LiveDino.upsert(records, { key: 'steam_id' });

    return Response.json({ success: true, players: records.length });
  } catch (error) {
    console.error('dinoFeedIngest failed');
    return Response.json(
      { success: false, error: 'Internal error.' },
      { status: 500 }
    );
  }
}