import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const API_BASE = 'https://api.arkanis.gg';

function normalizeStatus(status) {
  if (!status || typeof status !== 'object') return null;
  if (status.kind === 'rcon') {
    return {
      online: status.online === true,
      players: typeof status.player_count === 'number' ? status.player_count : null,
      playerList: Array.isArray(status.players) ? status.players : [],
      lastCheckedAt: status.last_checked_at || null,
    };
  }
  // Pterodactyl kind: bot-owned passthrough — surface only what we can trust.
  const players = typeof status.players === 'number'
    ? status.players
    : typeof status.player_count === 'number' ? status.player_count : null;
  return {
    online: status.online === true || status.state === 'running',
    players,
    playerList: [],
    lastCheckedAt: status.last_checked_at || null,
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const token = secrets.get('ARKANIS_API_TOKEN');
    const guildId = secrets.get('ARKANIS_GUILD_ID');
    if (!token || !guildId) {
      return Response.json({
        configured: false,
        error: 'Arkanis is not configured yet. Set ARKANIS_API_TOKEN and ARKANIS_GUILD_ID in the app dashboard.',
      }, { status: 200 });
    }

    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

    const serversRes = await fetch(`${API_BASE}/api/public/v1/guilds/${guildId}/servers`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (serversRes.status === 401 || serversRes.status === 403) {
      return Response.json({ configured: false, error: 'Arkanis rejected the API token. Re-issue it in the Arkanis dashboard.' }, { status: 200 });
    }
    if (!serversRes.ok) {
      return Response.json({ configured: true, error: `Arkanis returned ${serversRes.status}.` }, { status: 200 });
    }
    const serversEnvelope = await serversRes.json();
    const servers = serversEnvelope?.items || serversEnvelope?.servers || serversEnvelope?.data || [];
    if (!Array.isArray(servers) || servers.length === 0) {
      return Response.json({ configured: true, error: 'No servers are registered in Arkanis yet.' }, { status: 200 });
    }

    const server = servers.find((s) => s.is_default) || servers[0];

    const statusRes = await fetch(`${API_BASE}/api/public/v1/guilds/${guildId}/servers/${encodeURIComponent(server.id)}/status`, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!statusRes.ok) {
      return Response.json({
        configured: true,
        error: `Arkanis status request returned ${statusRes.status}.`,
        server: { id: server.id, name: server.server_name, kind: server.kind },
      }, { status: 200 });
    }
    const statusEnvelope = await statusRes.json();
    const normalized = normalizeStatus(statusEnvelope?.status || statusEnvelope);

    return Response.json({
      configured: true,
      server: {
        id: server.id,
        name: server.server_name,
        kind: server.kind,
        gameType: server.game_type,
      },
      status: normalized,
    });
  } catch (error) {
    return Response.json({ configured: true, error: error.message }, { status: 200 });
  }
}