import React, { useState } from "react";
import { Coins, Target, Crosshair } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { START_SHARDS } from "@/lib/portalData";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

export default function Bounties() {
  const [shards, setShards] = useState(START_SHARDS);
  const [bounties, setBounties] = useState([]);
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState(1000);
  const [error, setError] = useState(null);

  const place = (e) => {
    e.preventDefault();
    const amt = parseInt(amount, 10) || 0;
    if (!target.trim()) return setError("Enter a player name.");
    if (amt < 100) return setError("Minimum bounty is 100 shards.");
    if (amt > shards) return setError("Not enough shards.");
    setError(null);
    setShards((s) => s - amt);
    setBounties((prev) => [
      { id: Date.now(), target: target.trim().toUpperCase(), amount: amt, placer: "YOU" },
      ...prev,
    ]);
    setTarget("");
    setAmount(1000);
  };

  const collect = (b) => {
    setShards((s) => s + b.amount);
    setBounties((prev) => prev.filter((x) => x.id !== b.id));
  };

  return (
    <PageShell
      kicker="BLOOD PRICE"
      title="BOUNTIES"
      sub="Put a price on a player's head. Kill the target to collect the pot."
      right={
        <div className="glass-panel-light px-4 py-2 flex items-center gap-2 w-fit">
          <Coins size={14} className="text-accent" />
          <span className="font-mono text-xs text-foreground">{shards.toLocaleString()}</span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">SHARDS</span>
        </div>
      }
    >
      {/* Place bounty */}
      <form onSubmit={place} className="glass-panel rounded-lg p-6 mb-8">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
          PLACE A BOUNTY
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="PLAYER NAME"
            className="flex-1 bg-secondary border border-border rounded-sm font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={100}
            className="w-full md:w-44 bg-secondary border border-border rounded-sm font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60"
          />
          <button
            type="submit"
            className="font-mono text-[10px] tracking-[0.25em] bg-primary text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Target size={13} /> PLACE BOUNTY
          </button>
        </div>
        {error && <div className="font-mono text-[10px] text-destructive mt-3 tracking-wide">{error}</div>}
      </form>

      {/* Bounty board */}
      <div className="glass-panel rounded-lg divide-y divide-border/60">
        <div className="p-5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
          OPEN CONTRACTS — {bounties.length}
        </div>
        {bounties.length === 0 && (
          <div className="p-8 font-mono text-[11px] text-muted-foreground text-center">
            The board is clear. No blood owed.
          </div>
        )}
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
              <span className="font-mono text-sm text-accent">{b.amount.toLocaleString()} SHARDS</span>
              <button
                onClick={() => collect(b)}
                className="font-mono text-[9px] tracking-[0.2em] border border-primary/40 text-primary px-4 py-2 rounded-sm hover:bg-primary/10 transition-colors"
              >
                COLLECT
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <LiveIslandStrip />
      </div>
    </PageShell>
  );
}