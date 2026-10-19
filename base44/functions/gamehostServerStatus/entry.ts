import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Game Host Bros panel (Pterodactyl). The server lives here; its live
// online/offline state is read from the panel's client API.
const PANEL = 'https://bropanel.gamehostbros.com';
const SERVER_ID = 'db061c4f';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Sign in to check the server status.' }, { status: 401 });
    }

    const token = secrets.get('GAMEHOSTBROS_API_TOKEN');
    if (!token) {
      return Response.json({
        configured: false,
        error: 'Panel API key is not configured yet.',
      });
    }

    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

    // Server details (name, limits) and live resources (state) in parallel.
    const [detailsRes, resourcesRes] = await Promise.allSettled([
      fetch(`${PANEL}/api/client/servers/${SERVER_ID}`, {
        headers,
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${PANEL}/api/client/servers/${SERVER_ID}/resources`, {
        headers,
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    const pick = (r) => (r.status === 'fulfilled' ? r.value : null);
    const details = pick(detailsRes);
    const resources = pick(resourcesRes);

    if (details && (details.status === 401 || details.status === 403)) {
      return Response.json({
        configured: false,
        error: 'The panel rejected the API key. Create a new one in the panel under API Credentials.',
      });
    }
    if (!details || !details.ok || !resources || !resources.ok) {
      return Response.json({
        configured: true,
        error: `The panel request failed${resources && !resources.ok ? ` (${resources.status})` : ''}.`,
      });
    }

    const detailsPayload = await details.json().catch(() => ({}));
    const resourcesPayload = await resources.json().catch(() => ({}));
    const attrs = resourcesPayload?.attributes || {};
    const isSuspended = attrs.is_suspended === true;

    const state = attrs.current_state || attrs.state || null;
    return Response.json({
      configured: true,
      online: state === 'running' && !isSuspended,
      state,
      suspended: isSuspended,
      serverName: detailsPayload?.attributes?.name || null,
    });
  } catch (error) {
    return Response.json({ configured: true, error: error.message });
  }
}