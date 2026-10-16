import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { speciesFromPath, growthNumber, applyFeedRecords } from '../../shared/feed.ts';

const API_BASE = 'https://api.arkanis.gg';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const token = secrets.get('ARKANIS_API_TOKEN');
    const guildId = secrets.get('ARKANIS_GUILD_ID');
    if (!token || !guildId) {
      return Response.json({ error: 'Arkanis not configured', recorded: 0 }, { status: 200 });
    }

    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
    const serversRes = await fetch(`${API_BASE}/api/public/v1/guilds/${guildId}/servers`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!serversRes.ok) {
      return Response.json({ error: `Arkanis servers request returned ${serversRes.status}`, recorded: 0 }, { status: 200 });
    }
    const serversEnv = await serversRes.json();
    const servers = serversEnv?.items || serversEnv?.servers || serversEnv?.data || [];
    // Every Isle game server on the account, so players on any of them are
    // accounted for — not just the first one.
    const gameServers = servers.filter(
      (s) => s.kind === 'rcon' && String(s.game_type || '').startsWith('the_isle')
    );
    if (gameServers.length === 0) {
      return Response.json({ error: 'No Isle servers registered in Arkanis', recorded: 0 }, { status: 200 });
    }

    const now = new Date().toISOString();
    const records = [];
    let online = false;
    let playerCount = 0;
    for (const server of gameServers) {
      const statusRes = await fetch(
        `${API_BASE}/api/public/v1/guilds/${guildId}/servers/${encodeURIComponent(server.id)}/status`,
        { headers, signal: AbortSignal.timeout(10000) }
      );
      if (!statusRes.ok) continue; // one unreachable server never blocks the others
      const statusEnv = await statusRes.json();
      const status = statusEnv?.status || statusEnv || {};
      if (status.online === true) online = true;
      if (typeof status.player_count === 'number') playerCount += status.player_count;
      const players = Array.isArray(status.players) ? status.players : [];
      for (const p of players) {
        if (!p || !p.steamId) continue;
        records.push({
          steam_id: String(p.steamId),
          player_name: p.name || 'Unknown',
          species: speciesFromPath(p.dinosaur),
          growth: growthNumber(p.growth),
          server_name: server.server_name || 'The Haven',
          last_seen: now,
        });
      }
    }

    const { upserted } = await applyFeedRecords(base44.asServiceRole, records, now);

    return Response.json({
      online,
      player_count: playerCount || upserted,
      recorded: upserted,
      servers_polled: gameServers.length,
    });
  } catch (error) {
    return Response.json({ error: error.message, recorded: 0 }, { status: 200 });
  }
}