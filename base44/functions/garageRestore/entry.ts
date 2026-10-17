import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Restores a parked dino instantly: the owner pulls it out of garage storage
// themselves and it returns to the island (the live feed picks it up again).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { id } = body;
    if (!id) return Response.json({ error: 'Missing parked dino id' }, { status: 400 });

    const record = await base44.asServiceRole.entities.ParkedDino.get(id).catch(() => null);
    if (!record || record.user_id !== user.id) {
      return Response.json({ error: 'Parked dino not found' }, { status: 404 });
    }
    if (record.status !== 'parked') {
      return Response.json({ error: 'This dino is not parked' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.ParkedDino.update(id, {
      status: 'restored',
      restored_date: new Date().toISOString(),
    });

    return Response.json({ record: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}