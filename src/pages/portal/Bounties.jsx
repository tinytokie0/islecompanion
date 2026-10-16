import React, { useState } from "react";
import { Coins, Crosshair, Target } from "lucide-react";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";
import useHt from "@/hooks/useHt";

export default function Bounties() {
  const { balance, spend, award } = useHt();
  const [bounties, setBounties] = useState([]);
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState(1000);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const place = async (e) => {
    e.preventDefault();
    const amt = parseInt(amount, 10) || 0;
    if (!target.trim()) return setError("Enter a player name.");
    if (amt < 100) return setError("Minimum bounty is 100 HT.");
    if (amt > balance) return setError("Not enough Haven Tokens.");
    setError(null);
    setBusy(true);
    try {
      await spend(amt, `Bounty placed on ${target.trim()}`);
      setBounties((prev) => [
        { id: Date.now(), target: target.trim().toUpperCase(), amount: amt, placer: "YOU" },
        ...prev,
      ]);
      setTarget("");
      setAmount(1000);
    } catch {
      setError("Could not place the bounty — check your balance.");
    } finally {
      setBusy(false);
    }
  };

  const collect = async (b) => {
    try {
      await award(b.amount, `Bounty collected on ${b.target}`);
      setBounties((prev) => prev.filter((x) => x.id !== b.id));
    } catch {
      /* balance unchanged — the bounty stays on the board */
    }
  };

  return (
    <section className="px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Bounties</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Put a price on a player's head. Whoever kills them collects the reward.
          </p>
        </div>

        {/* Place a bounty */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8 mb-10">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-1">Place a bounty</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Name the player and the price. The pot is deducted from your Haven Tokens up front.
          </p>
          <form onSubmit={place} className="flex flex-col md:flex-row gap-3">
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Player name"
              className="flex-1 bg-secondary border border-border rounded-md font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={100}
              className="w-full md:w-44 bg-secondary border border-border rounded-md font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60"
            />
            <button
              type="submit"
              disabled={busy}
              className="font-heading text-sm font-bold tracking-wide bg-primary text-primary-foreground px-6 py-3 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Target size={15} /> Place bounty
            </button>
          </form>
          {error && <div className="font-mono text-[10px] text-destructive mt-3 tracking-wide">{error}</div>}
        </div>

        {/* Bounty board */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border/60 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
            ACTIVE BOUNTIES — {bounties.length}
          </div>
          {bounties.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No active bounties. Be the first to post one.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {bounties.map((b) => (
                <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-md border border-destructive/40 bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                      <Crosshair size={15} />
                    </span>
                    <div>
                      <div className="font-mono text-xs text-foreground tracking-wide">{b.target}</div>
                      <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">
                        PLACED BY {b.placer}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-accent flex items-center gap-1.5">
                      <Coins size={13} /> {b.amount.toLocaleString()} HT
                    </span>
                    <button
                      onClick={() => collect(b)}
                      className="font-heading text-xs font-bold tracking-wide border border-primary/40 text-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors"
                    >
                      Collect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <LiveIslandStrip />
        </div>
      </div>
    </section>
  );
}