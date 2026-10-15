import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const STEAM_OP = 'https://steamcommunity.com/openid/login';
const REQUEST_TTL_MS = 10 * 60 * 1000;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Sign in to link a Steam account.' }, { status: 401 });
    }

    const service = base44.asServiceRole;

    // One live request per user: clear any earlier unused ones
    const stale = await service.entities.SteamLinkRequest.filter({ user_id: user.id, used: false });
    for (const old of stale) {
      await service.entities.SteamLinkRequest.delete(old.id);
    }

    const nonce = crypto.randomUUID();
    await service.entities.SteamLinkRequest.create({
      nonce,
      user_id: user.id,
      expires_at: new Date(Date.now() + REQUEST_TTL_MS).toISOString(),
      used: false
    });

    const origin = req.headers.get('X-Base44-App-Url') || 'https://isle-tactical-hub.base44.app';
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': `${origin}/functions/steamLinkCallback?nonce=${encodeURIComponent(nonce)}`,
      'openid.realm': origin,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });

    return Response.json({ redirect_url: `${STEAM_OP}?${params.toString()}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}