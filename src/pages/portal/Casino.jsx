import React, { useState } from "react";
import { Dices, Flame, Spade } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import useHt from "@/hooks/useHt";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";
import { base44 } from "@/api/base44Client";

const SYMBOLS = ["🦖", "💎", "🦴", "🔥", "⭐"];

const flashWin = (amount) =>
  window.dispatchEvent(new CustomEvent("ht-claimed", { detail: { amount } }));

const handValue = (hand) => {
  let total = hand.reduce((s, c) => s + c.value, 0);
  const aces = hand.filter((c) => c.ace).length;
  for (let i = 0; i < aces; i++) if (total + 10 <= 21) total += 10;
  return total;
};

export default function Casino() {
  const { balance, refresh } = useHt();
  const [bet, setBet] = useState(100);

  // Slots
  const [reels, setReels] = useState(["🦴", "💎", "🔥"]);
  const [spinning, setSpinning] = useState(false);
  const [slotsMsg, setSlotsMsg] = useState(null);

  // All or nothing
  const [aonMsg, setAonMsg] = useState(null);

  // Blackjack
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [phase, setPhase] = useState("bet"); // bet | play | done
  const [bjMsg, setBjMsg] = useState(null);

  const validBet = Math.max(10, Math.min(bet || 0, balance));

  // All three games run server-side: the backend charges the bet, plays the
  // outcome and settles the balance atomically. The client never sends a win.
  const play = async (payload) => {
    const res = await base44.functions.invoke("casinoPlay", payload);
    await refresh();
    return res.data;
  };

  const spin = async () => {
    if (spinning || validBet < 10) return;
    setSpinning(true);
    setSlotsMsg(null);
    let final = null;
    let win = 0;
    try {
      const res = await play({ action: "deal", game: "slots", bet: validBet });
      final = res.reels;
      win = res.win || 0;
    } catch {
      setSpinning(false);
      setSlotsMsg("BET REJECTED — CHECK YOUR BALANCE");
      return;
    }
    let ticks = 0;
    const iv = setInterval(() => {
      setReels([SYMBOLS[Math.floor(Math.random() * 5)], SYMBOLS[Math.floor(Math.random() * 5)], SYMBOLS[Math.floor(Math.random() * 5)]]);
      ticks++;
      if (ticks > 12) {
        clearInterval(iv);
        setReels(final);
        if (win) {
          flashWin(win);
          setSlotsMsg(`WIN +${win.toLocaleString()} HT`);
        } else {
          setSlotsMsg("NO MATCH — TRY AGAIN");
        }
        setSpinning(false);
      }
    }, 90);
  };

  const allOrNothing = async () => {
    if (validBet < 10) return;
    setAonMsg(null);
    try {
      const res = await play({ action: "deal", game: "all_or_nothing", bet: validBet });
      const win = res.win || 0;
      if (win > 0) {
        flashWin(win);
        setAonMsg(`DOUBLED! +${win.toLocaleString()} HT`);
      } else {
        setAonMsg("GONE. THE VOID KEEPS YOUR TOKENS.");
      }
    } catch {
      setAonMsg("BET REJECTED — CHECK YOUR BALANCE");
    }
  };

  const deal = async () => {
    if (validBet < 10) return;
    setBjMsg(null);
    try {
      const res = await play({ action: "deal", game: "blackjack", bet: validBet });
      setPlayer(res.player);
      setDealer(res.dealer);
      if (res.settled) {
        setPhase("done");
        flashWin(res.win);
        setBjMsg(`BLACKJACK! +${res.win.toLocaleString()} HT`);
      } else {
        setPhase("play");
      }
    } catch {
      setBjMsg("BET REJECTED — CHECK YOUR BALANCE");
    }
  };

  const hit = async () => {
    try {
      const res = await play({ action: "hit" });
      setPlayer(res.player);
      if (res.settled) {
        setPhase("done");
        setBjMsg("BUST — DEALER TAKES THE POT");
      }
    } catch {
      setPhase("done");
      setBjMsg("HAND EXPIRED — DEAL AGAIN");
    }
  };

  const stand = async () => {
    try {
      const res = await play({ action: "stand" });
      setDealer(res.dealer);
      setPhase("done");
      const { result, win } = res;
      if (result === "win") {
        flashWin(win);
        setBjMsg(`YOU WIN +${win.toLocaleString()} HT`);
      } else if (result === "push") {
        flashWin(win);
        setBjMsg("PUSH — BET RETURNED");
      } else {
        setBjMsg("DEALER WINS");
      }
    } catch {
      setPhase("done");
      setBjMsg("HAND EXPIRED — DEAL AGAIN");
    }
  };

  const Card = ({ c, hidden }) => (
    <span className={`inline-flex items-center justify-center w-9 h-12 rounded-sm border font-mono text-xs ${hidden ? "bg-secondary border-border text-muted-foreground" : "bg-secondary border-border text-foreground"}`}>
      {hidden ? "?" : c.label}
    </span>
  );

  return (
    <PageShell
      kicker="THE TOKEN DEN"
      title="CASINO"
      sub="Slots, all-or-nothing and blackjack with your Haven Tokens. Play sharp."
    >
      {/* Bet control */}
      <div className="glass-panel rounded-lg p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
          BET SIZE — {balance.toLocaleString()} HT AVAILABLE
        </span>
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(parseInt(e.target.value, 10) || 0)}
            className="flex-1 bg-secondary border border-border rounded-sm font-mono text-xs text-foreground px-3 py-2 outline-none focus:border-primary/60"
          />
          {[100, 500, 1000].map((v) => (
            <button
              key={v}
              onClick={() => setBet(v)}
              className="font-mono text-[9px] tracking-[0.1em] border border-border text-muted-foreground hover:text-foreground px-2 py-2 rounded-sm transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Slots */}
        <div className="glass-panel rounded-lg p-6 flex flex-col items-center">
          <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-6 self-start flex items-center gap-2">
            <Dices size={13} className="text-primary" /> SLOTS
          </div>
          <div className="flex gap-3 mb-6">
            {reels.map((sym, i) => (
              <span
                key={i}
                className={`w-16 h-20 glass-panel-light rounded-sm flex items-center justify-center text-3xl ${spinning ? "opacity-70" : ""}`}
              >
                {sym}
              </span>
            ))}
          </div>
          <button
            onClick={spin}
            disabled={spinning || validBet < 10}
            className="w-full font-mono text-[10px] tracking-[0.25em] bg-primary text-primary-foreground py-3 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {spinning ? "SPINNING..." : "SPIN — 3 MATCH x10 / 2 MATCH x2"}
          </button>
          {slotsMsg && (
            <div className="font-mono text-[10px] tracking-[0.15em] text-accent mt-4">{slotsMsg}</div>
          )}
        </div>

        {/* All or nothing */}
        <div className="glass-panel rounded-lg p-6 flex flex-col">
          <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-6 flex items-center gap-2">
            <Flame size={13} className="text-primary" /> ALL OR NOTHING
          </div>
          <p className="font-mono text-[11px] text-muted-foreground leading-relaxed mb-6 flex-1">
            Even odds. Double your bet or lose it all. The purist's game.
          </p>
          <button
            onClick={allOrNothing}
            disabled={validBet < 10}
            className="w-full font-mono text-[10px] tracking-[0.25em] border border-accent/60 text-accent py-3 rounded-sm hover:bg-accent/10 transition-colors disabled:opacity-50"
          >
            FLIP — x2 OR NOTHING
          </button>
          {aonMsg && (
            <div className="font-mono text-[10px] tracking-[0.15em] text-accent mt-4">{aonMsg}</div>
          )}
        </div>

        {/* Blackjack */}
        <div className="glass-panel rounded-lg p-6 flex flex-col">
          <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-6 flex items-center gap-2">
            <Spade size={13} className="text-primary" /> BLACKJACK
          </div>
          <div className="flex-1 mb-4">
            <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-2">
              DEALER {dealer.length ? `— ${handValue(dealer)}` : ""}
            </div>
            <div className="flex gap-2 mb-5">
              {dealer.length ? dealer.map((c, i) => <Card key={i} c={c} />) : <Card hidden />}
            </div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-2">
              YOU {player.length ? `— ${handValue(player)}` : ""}
            </div>
            <div className="flex gap-2">
              {player.length ? player.map((c, i) => <Card key={i} c={c} />) : <Card hidden />}
            </div>
          </div>
          <div className="flex gap-2">
            {phase !== "play" ? (
              <button
                onClick={deal}
                disabled={validBet < 10}
                className="flex-1 font-mono text-[10px] tracking-[0.25em] bg-primary text-primary-foreground py-3 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                DEAL
              </button>
            ) : (
              <>
                <button
                  onClick={hit}
                  className="flex-1 font-mono text-[10px] tracking-[0.25em] border border-primary/40 text-primary py-3 rounded-sm hover:bg-primary/10 transition-colors"
                >
                  HIT
                </button>
                <button
                  onClick={stand}
                  className="flex-1 font-mono text-[10px] tracking-[0.25em] border border-border text-foreground py-3 rounded-sm hover:bg-secondary transition-colors"
                >
                  STAND
                </button>
              </>
            )}
          </div>
          {bjMsg && (
            <div className="font-mono text-[10px] tracking-[0.15em] text-accent mt-4">{bjMsg}</div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <LiveIslandStrip />
      </div>
    </PageShell>
  );
}