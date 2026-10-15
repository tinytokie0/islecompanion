import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = base44.asServiceRole;
    const links = await service.entities.SteamLink.filter({ user_id: user.id });
    if (links.length === 0) {
      return Response.json({ error: 'No linked Steam account.' }, { status: 404 });
    }
    await service.entities.SteamLink.delete(links[0].id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}