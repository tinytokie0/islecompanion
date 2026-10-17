import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Game-server command sync for the garage. The HavenPosition bridge polls
// this endpoint with the shared feed secret:
//   { action: "poll" }              -> queued park/restore commands, marked sent
//   { action: "result", id, ok, error } -> records the server's outcome
// Authenticated exactly like dinoFeedIngest (x-feed-secret header or ?secret=).
export default async function (req) {
  try {
    const expected = secrets.get('ARKANIS_FEED_SECRET') || '';
    const url = new URL(req.url);
    const provided = req.headers.get('x-feed-secret') || url.searchParams.get('secret') || '';
    if (!expected || provided.length !== expected.length || provided !== expected) {
      return Response.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (req.method !== 'POST') {
      return Response.json({ success: false, error: 'POST only.' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    if (body?.action === 'poll') {
      const page = await base44.asServiceRole.entities.ParkedDino.filter(
        { server_status: 'queued' },
        { sort: '-parked_date', limit: 20 }
      );
      const commands = page.items.map((r) => ({
        id: r.id,
        command: r.status === 'restored' ? 'restore' : 'park',
        steam_id: r.steam_id,
        species: r.species,
        growth: r.growth ?? 0,
        health: r.health,
        stamina: r.stamina,
        hunger: r.hunger,
        thirst: r.thirst,
        player_name: r.player_name,
      }));
      if (commands.length > 0) {
        await base44.asServiceRole.entities.ParkedDino.bulkUpdate(
          commands.map((c) => ({ id: c.id, server_status: 'sent' }))
        );
      }
      return Response.json({ success: true, commands });
    }

    if (body?.action === 'result') {
      const { id, ok, error } = body;
      if (!id) return Response.json({ success: false, error: 'Missing id.' }, { status: 400 });
      await base44.asServiceRole.entities.ParkedDino.update(id, {
        server_status: ok ? 'applied' : 'failed',
        server_error: ok ? null : String(error || 'Server could not apply the command'),
      });
      return Response.json({ success: true });
    }

    return Response.json({ success: false, error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}