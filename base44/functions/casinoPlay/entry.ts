import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getWalletForUser } from '../../shared/economy.ts';

// Casino games, played entirely server-side: the client sends only the game
// and the bet. The backend draws the outcome, charges the bet and pays any
// win with atomic balance-anchored writes, and writes every ledger entry
// itself. No payout amount ever comes from the browser.
const MIN_BET = 10;
const MAX_BET = 1000000;
const SYMBOLS = ['🦖', '💎', '🦴', '🔥', '⭐'];

const randCard = () => {
  const r = Math.floor(Math.random() * 13) + 1; // 1..13
  const label = r === 1 ? 'A' : r === 11 ? 'J' : r === 12 ? 'Q' : r === 13 ? 'K' : String(r);
  return { label, value: Math.min(r, 10), ace: r === 1 };
};

const handValue = (hand) => {
  let total = hand.reduce((s, c) => s + c.value, 0);
  const aces = hand.filter((c) => c.ace).length;
  for (let i = 0; i < aces; i++) if (total + 10 <= 21) total += 10;
  return total;
};

// Charge a bet atomically: balance-anchored conditional write, verified, then
// the ledger entry. Returns the new balance, or null when funds are missing
// or a concurrent transaction won the write.
async function chargeBet(service, userId, bet, reason) {
  const wallet = await getWalletForUser(service, userId);
  const old = wallet.balance || 0;
  if (old < bet) return null;
  const next = old - bet;
  await service.entities.Wallet.updateMany(
    { user_id: userId, balance: old },
    { $set: { balance: next } }
  );
  const winners = await service.entities.Wallet.filter({ user_id: userId, balance: next });
  if (winners.length === 0) return null;
  await service.entities.CoinTransaction.create({
    user_id: userId,
    type: 'game',
    amount: -bet,
    reason,
    balance_after: next,
  });
  return next;
}

// Pay a win atomically ($inc cannot lose to a concurrent spend).
async function payWin(service, userId, win, reason) {
  await service.entities.Wallet.updateMany(
    { user_id: userId },
    { $inc: { balance: win } }
  );
  const wallet = await getWalletForUser(service, userId);
  await service.entities.CoinTransaction.create({
    user_id: userId,
    type: 'game',
    amount: win,
    reason,
    balance_after: wallet.balance,
  });
  return wallet.balance;
}

// One-step settle for instant games: bet and win in a single atomic write.
async function settleNet(service, userId, bet, win, reason) {
  const wallet = await getWalletForUser(service, userId);
  const old = wallet.balance || 0;
  if (old < bet) return null;
  const next = old - bet + win;
  await service.entities.Wallet.updateMany(
    { user_id: userId, balance: old },
    { $set: { balance: next } }
  );
  const winners = await service.entities.Wallet.filter({ user_id: userId, balance: next });
  if (winners.length === 0) return null;
  await service.entities.CoinTransaction.create({
    user_id: userId,
    type: 'game',
    amount: win - bet,
    reason,
    balance_after: next,
  });
  return next;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const service = base44.asServiceRole;

    if (action === 'deal') {
      const game = String(body.game || '');
      const bet = Math.floor(Number(body.bet));
      if (!['slots', 'all_or_nothing', 'blackjack'].includes(game)) {
        return Response.json({ error: 'Unknown game.' }, { status: 400 });
      }
      if (!Number.isFinite(bet) || bet < MIN_BET || bet > MAX_BET) {
        return Response.json(
          { error: `Bet must be a whole number between ${MIN_BET} and ${MAX_BET}.` },
          { status: 400 }
        );
      }

      if (game === 'slots') {
        const reels = [0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * 5)]);
        let win = 0;
        if (reels[0] === reels[1] && reels[1] === reels[2]) win = bet * 10;
        else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) win = bet * 2;
        const balance = await settleNet(service, user.id, bet, win, 'Casino: slots');
        if (balance === null) {
          return Response.json({ error: 'Not enough Haven Tokens, or the balance changed. Try again.' }, { status: 409 });
        }
        return Response.json({ ok: true, game, reels, win, balance });
      }

      if (game === 'all_or_nothing') {
        const won = Math.random() < 0.5;
        const win = won ? bet * 2 : 0;
        const balance = await settleNet(service, user.id, bet, win, 'Casino: all-or-nothing');
        if (balance === null) {
          return Response.json({ error: 'Not enough Haven Tokens, or the balance changed. Try again.' }, { status: 409 });
        }
        return Response.json({ ok: true, game, won, win, balance });
      }

      // Blackjack: the bet is charged when the hand is dealt and the hand is
      // stored server-side, so hit/stand decisions can be verified later.
      await service.entities.CasinoHand.deleteMany({ user_id: user.id, status: 'active' });
      const player = [randCard(), randCard()];
      const dealer = [randCard(), randCard()];
      const balance = await chargeBet(service, user.id, bet, 'Casino: blackjack bet');
      if (balance === null) {
        return Response.json({ error: 'Not enough Haven Tokens, or the balance changed. Try again.' }, { status: 409 });
      }
      if (handValue(player) === 21) {
        const win = Math.floor(bet * 2.5);
        const paid = await payWin(service, user.id, win, 'Casino: blackjack');
        return Response.json({ ok: true, game, player, dealer, settled: true, result: 'blackjack', win, balance: paid });
      }
      await service.entities.CasinoHand.create({
        user_id: user.id,
        bet,
        player: JSON.stringify(player),
        dealer: JSON.stringify(dealer),
        status: 'active',
      });
      return Response.json({ ok: true, game, player, dealer, settled: false, result: null, win: 0, balance });
    }

    if (action === 'hit' || action === 'stand') {
      const handPage = await service.entities.CasinoHand.filter(
        { user_id: user.id, status: 'active' },
        { limit: 1 }
      );
      const hand = (handPage.items || [])[0];
      if (!hand) {
        return Response.json({ error: 'No active blackjack hand — deal first.' }, { status: 409 });
      }
      const bet = hand.bet || 0;
      const player = JSON.parse(hand.player);
      const dealer = JSON.parse(hand.dealer);

      if (action === 'hit') {
        player.push(randCard());
        if (handValue(player) > 21) {
          await service.entities.CasinoHand.update(hand.id, { status: 'settled', player: JSON.stringify(player) });
          const wallet = await getWalletForUser(service, user.id);
          return Response.json({ ok: true, player, dealer, settled: true, result: 'bust', win: 0, balance: wallet.balance });
        }
        await service.entities.CasinoHand.update(hand.id, { player: JSON.stringify(player) });
        return Response.json({ ok: true, player, dealer, settled: false, result: null, win: 0 });
      }

      // Stand: dealer draws below 17, then the hand is settled and paid.
      while (handValue(dealer) < 17) dealer.push(randCard());
      const pv = handValue(player);
      const dv = handValue(dealer);
      let result = 'lose';
      let win = 0;
      if (dv > 21 || pv > dv) {
        result = 'win';
        win = bet * 2;
      } else if (pv === dv) {
        result = 'push';
        win = bet;
      }
      let balance;
      if (win > 0) {
        balance = await payWin(service, user.id, win, result === 'push' ? 'Casino: blackjack push' : 'Casino: blackjack win');
      } else {
        const wallet = await getWalletForUser(service, user.id);
        balance = wallet.balance;
      }
      await service.entities.CasinoHand.update(hand.id, {
        status: 'settled',
        player: JSON.stringify(player),
        dealer: JSON.stringify(dealer),
      });
      return Response.json({ ok: true, player, dealer, settled: true, result, win, balance });
    }

    return Response.json({ error: 'action must be "deal", "hit" or "stand".' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}