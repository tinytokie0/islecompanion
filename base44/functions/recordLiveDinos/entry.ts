import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const API_BASE = 'https://api.arkanis.gg';

function speciesFromPath(path) {
  const m = /BP_([A-Za-z]+)\.BP_[A-Za-z]+_C/.exec(path || '');
  if (!m) return 'Unknown';
  return m[1].replace(/([a-z])([A-Z])/g, '$1 $2');
}

function growthNumber(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const n = parseFloat(String(raw || '').replace('%', ''));
  return Number.isFinite(n) ? n : null;
}

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
    const server =
      servers.find((s) => s.kind === 'rcon' && s.game_type) ||
      servers.find((s) => s.game_type) ||
      servers.find((s) => s.is_default) ||
      servers[0];
    if (!server) {
      return Response.json({ error: 'No servers registered in Arkanis', recorded: 0 }, { status: 200 });
    }

    const statusRes = await fetch(
      `${API_BASE}/api/public/v1/guilds/${guildId}/servers/${encodeURIComponent(server.id)}/status`,
      { headers, signal: AbortSignal.timeout(10000) }
    );
    if (!statusRes.ok) {
      return Response.json({ error: `Arkanis status request returned ${statusRes.status}`, recorded: 0 }, { status: 200 });
    }
    const statusEnv = await statusRes.json();
    const status = statusEnv?.status || statusEnv || {};
    const players = Array.isArray(status.players) ? status.players : [];

    const now = new Date().toISOString();
    const records = [];
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

    let recorded = 0;
    if (records.length > 0) {
      const res = await base44.asServiceRole.entities.LiveDino.upsert(records, { key: 'steam_id' });
      recorded = (res?.records || records).length;
    }

    return Response.json({ online: status.online === true, player_count: typeof status.player_count === 'number' ? status.player_count : records.length, recorded });
  } catch (error) {
    return Response.json({ error: error.message, recorded: 0 }, { status: 200 });
  }
}