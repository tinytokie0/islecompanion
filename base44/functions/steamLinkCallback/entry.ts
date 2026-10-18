import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { waitUntil } from 'base44:runtime';
import { getWalletForUser } from '../../shared/economy.ts';

export default async function(req) {
  const origin = req.headers.get('X-Base44-App-Url') || new URL(req.url).origin;
  const back = (status, reason) => {
    const target = new URL(`${origin}/`);
    target.searchParams.set('steam', status);
    if (reason) target.searchParams.set('reason', reason);
    return Response.redirect(target.toString(), 302);
  };

  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const nonce = url.searchParams.get('nonce');
    const claimedId = url.searchParams.get('openid.claimed_id');

    if (!nonce || !claimedId) return back('error', 'missing');

    // 1. Defense-in-depth: openid.return_to must target this app's callback
    //    (exact origin, no attacker-controlled destination) and must carry
    //    exactly the nonce this request was started with.
    try {
      const returnTo = url.searchParams.get('openid.return_to');
      const returnUrl = returnTo ? new URL(returnTo) : null;
      if (
        !returnUrl ||
        returnUrl.origin !== origin ||
        returnUrl.pathname !== '/functions/steamLinkCallback' ||
        returnUrl.searchParams.get('nonce') !== nonce
      ) {
        return back('error', 'bad_return_to');
      }
    } catch {
      return back('error', 'bad_return_to');
    }

    // 2. Verify the response with Steam, server-side. Never trust the browser.
    const check = new URLSearchParams(url.searchParams);
    check.set('openid.mode', 'check_authentication');
    const steamRes = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: check.toString(),
      signal: AbortSignal.timeout(10000)
    });
    const steamBody = await steamRes.text();
    if (!steamBody.includes('is_valid:true')) return back('error', 'invalid_signature');

    // 3. Extract and validate the Steam ID from the verified claimed ID
    const match = claimedId.match(/^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);
    if (!match) return back('error', 'bad_id');
    const steamId = match[1];

    // Resolve the player's real persona name so the site shows it correctly
    // everywhere; fall back to the ID if Steam doesn't answer.
    let persona = steamId;
    try {
      const profRes = await fetch(`https://steamcommunity.com/profiles/${steamId}/?xml=1`, {
        signal: AbortSignal.timeout(5000)
      });
      if (profRes.ok) {
        const xml = await profRes.text();
        const pm = /<steamID><!\[CDATA\[([\s\S]*?)\]\]><\/steamID>|<steamID>([^<]+)<\/steamID>/.exec(xml);
        const name = (pm?.[1] || pm?.[2] || '').trim();
        if (name) persona = name;
      }
    } catch {
      // keep the Steam ID as persona
    }

    const service = base44.asServiceRole;

    // 4. Consume the nonce exactly once, within its lifetime
    const requests = await service.entities.SteamLinkRequest.filter({ nonce });
    const linkRequest = requests.find(
      (r) => r.nonce === nonce && r.used === false && r.expires_at > new Date().toISOString()
    );
    if (!linkRequest) return back('error', 'expired');

    // Session binding: the browser completing Steam sign-in must be the same
    // signed-in user who started the flow. Without this, a nonce link sent to
    // a victim could attach the victim's Steam account to the attacker's
    // profile. An anonymous or different session is rejected.
    let session = null;
    try {
      session = await base44.auth.me();
    } catch {
      session = null;
    }
    if (!session || session.id !== linkRequest.user_id) {
      return back('error', 'session');
    }

    await service.entities.SteamLinkRequest.update(linkRequest.id, { used: true });

    // 5. One Steam ID maps to at most one Base44 user
    const links = await service.entities.SteamLink.filter({ steam_id: steamId });
    if (links.length > 0) {
      const existing = links[0];
      if (existing.user_id === linkRequest.user_id) return back('linked');
      return back('error', 'taken');
    }

    await service.entities.SteamLink.create({
      steam_id: steamId,
      steam_persona: persona,
      user_id: linkRequest.user_id,
      linked_date: new Date().toISOString()
    });

    // Connect the Steam account to the player's wallet immediately, so live
    // server data flows into their quests and playtime rewards right away.
    await getWalletForUser(service, linkRequest.user_id, steamId);

    // Housekeeping: drop expired requests
    waitUntil(
      service.entities.SteamLinkRequest.deleteMany({ expires_at: { $lt: new Date().toISOString() } })
    );

    return back('linked');
  } catch (error) {
    console.error('steamLinkCallback error:', error);
    return back('error', 'server');
  }
}