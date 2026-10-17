import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Parks the signed-in player's current dino: snapshots its live stats into a
// ParkedDino record so staff can move it into garage storage in-game.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Resolve the player's linked Steam account
    const links = await base44.entities.SteamLink.filter({ user_id: user.id });
    const link = links[0];
    if (!link) {
      return Response.json({ error: 'Link your Steam account first' }, { status: 400 });
    }

    // One active garage slot: reject if something is already parked or being restored
    const activeRecords = await base44.asServiceRole.entities.ParkedDino.filter({
      user_id: user.id,
      status: 'parked',
    });
    if (activeRecords.items.length > 0) {
      return Response.json({ error: 'You already have a dino in garage storage' }, { status: 400 });
    }

    // Snapshot the player's most recent live dino from the island feed
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const page = await base44.asServiceRole.entities.LiveDino.filter(
      { steam_id: link.steam_id, last_seen: { $gte: since } },
      { sort: '-last_seen', limit: 1 }
    );
    const dino = page.items[0];
    if (!dino) {
      return Response.json({ error: 'No live dino found to park' }, { status: 400 });
    }

    const record = await base44.asServiceRole.entities.ParkedDino.create({
      user_id: user.id,
      steam_id: link.steam_id,
      player_name: dino.player_name || null,
      species: dino.species || 'Unknown',
      sex: dino.sex || null,
      growth: dino.growth ?? 0,
      health: dino.health ?? 0,
      stamina: dino.stamina ?? 0,
      hunger: dino.hunger ?? 0,
      thirst: dino.thirst ?? 0,
      server_name: dino.server_name || null,
      status: 'parked',
      parked_date: new Date().toISOString(),
      server_status: 'queued',
    });

    return Response.json({ record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}