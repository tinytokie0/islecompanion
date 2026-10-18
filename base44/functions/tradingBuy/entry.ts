import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser } from '../../shared/economy.ts';

// Server-authoritative island market price list (HT per species). The browser
// shows these prices, but the charge below always uses THIS table, so a
// tampered client can never pay less.
const PRICES = {
  Tyrannosaurus: 2500, Deinosuchus: 2500, Triceratops: 2500,
  Allosaurus: 2000, Carnotaurus: 1800, Austroraptor: 1800,
  Pteranodon: 1600, Gallimimus: 1600,
  Stegosaurus: 1500, Ceratosaurus: 1400, Maiasaura: 1400,
  Tenontosaurus: 1300, Kentrosaurus: 1300, Omniraptor: 1200,
  Dilophosaurus: 1200, Pachycephalosaurus: 1200, Herrerasaurus: 1100,
  Diabloceratops: 1100, Beipiaosaurus: 1100, Troodon: 1000,
  Dryosaurus: 1000, Hypsilophodon: 1000,
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const species = body && typeof body.species === 'string' ? body.species.trim() : '';
    if (!species || !PRICES[species]) {
      return Response.json({ error: 'Unknown species' }, { status: 400 });
    }
    const amount = PRICES[species];

    const service = base44.asServiceRole;

    // Real island data only: the species must have been seen on the island
    // feed in the last 24 hours to be buyable.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const live = await service.entities.LiveDino.filter(
      { species, last_seen: { $gte: since } },
      { limit: 1 }
    );
    if (live.items.length === 0) {
      return Response.json(
        { ok: false, error: `No ${species} on the island right now.` },
        { status: 409 }
      );
    }

    // One specimen of a species per player.
    const owned = await service.entities.Specimen.filter({ user_id: user.id, species }, { limit: 1 });
    if (owned.items.length > 0) {
      return Response.json({ ok: false, error: 'You already own this specimen.' }, { status: 409 });
    }

    const wallet = await getWalletForUser(service, user.id);
    const oldBalance = wallet.balance || 0;
    if (oldBalance < amount) {
      const fresh = await getWalletForUser(service, user.id);
      return Response.json(
        { ok: false, error: 'Not enough Haven Tokens.', balance: fresh.balance },
        { status: 409 }
      );
    }

    // Atomic charge anchored on the exact current balance.
    const nextBalance = oldBalance - amount;
    await service.entities.Wallet.updateMany(
      { user_id: user.id, balance: oldBalance },
      { $set: { balance: nextBalance } }
    );
    const winners = await service.entities.Wallet.filter({ user_id: user.id, balance: nextBalance });
    if (winners.length === 0) {
      const fresh = await getWalletForUser(service, user.id);
      return Response.json(
        { ok: false, error: 'Balance changed, try again.', balance: fresh.balance },
        { status: 409 }
      );
    }

    const specimen = await service.entities.Specimen.create({
      user_id: user.id,
      species,
      price_paid: amount,
      listed: false,
      purchased_date: new Date().toISOString(),
    });

    await service.entities.CoinTransaction.create({
      user_id: user.id,
      type: 'purchase',
      amount: -amount,
      reason: `Trading market: ${species}`,
      item_name: species,
      balance_after: nextBalance,
    });

    return Response.json({ ok: true, balance: nextBalance, specimen });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}