import React, { useEffect, useState } from "react";
import { Bone, Coins } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { DROP_HISTORY, START_SHARDS } from "@/lib/portalData";

const format = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export default function CarcassDrop() {
  const [dropIn, setDropIn] = useState(2 * 3600 + 14 * 60 + 37);
  const [claimed, setClaimed] = useState(false);
  const [shards, setShards] = useState(START_SHARDS);

  useEffect(() => {
    const iv = setInterval(() => setDropIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const ready = dropIn === 0;
  const canClaim = ready && !claimed;

  const claim = () => {
    if (!canClaim) return;
    setClaimed(true);
    setShards((s) => s + 1500);
  };

  return (
    <PageShell
      kicker="SCAVENGER FEED"
      title="CARCASS DROP"
      sub="A fresh carcass lands somewhere on the island every few hours. First scavenger takes the haul."
      right={
        <div className="glass-panel-light px-4 py-2 flex items-center gap-2 w-fit">
          <Coins size={14} className="text-accent" />
          <span className="font-mono text-xs text-foreground">{shards.toLocaleString()}</span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">SHARDS</span>
        </div>
      }
    >
      {/* Active drop */}
      <div className="glass-panel rounded-lg p-8 mb-8 text-center">
        <span className="w-14 h-14 rounded-md border border-accent/40 bg-accent/10 flex items-center justify-center text-accent mx-auto mb-5">
          <Bone size={24} />
        </span>
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-2">
          NEXT DROP LANDS IN
        </div>
        <div className="font-heading text-5xl text-accent text-glow tracking-[0.1em] mb-2 font-mono">
          {format(dropIn)}
        </div>
        <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-6">
          LOCATION REVEALS AT DROP TIME
        </div>
        <button
          onClick={claim}
          disabled={!canClaim}
          className={`font-mono text-[10px] tracking-[0.25em] px-8 py-3 rounded-sm border transition-colors ${
            canClaim
              ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
              : "border-border text-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          {claimed ? "HAUL CLAIMED — +1,500 SHARDS" : ready ? "CLAIM THE DROP" : "NOT READY"}
        </button>
      </div>

      {/* History */}
      <div className="glass-panel rounded-lg divide-y divide-border/60">
        <div className="p-5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
          PAST DROPS
        </div>
        {DROP_HISTORY.map((d, i) => (
          <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-mono text-xs text-foreground">{d.contents}</div>
              <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">
                {d.region.toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-muted-foreground">
                CLAIMED BY <span className="text-primary">{d.claimedBy}</span>
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/70">{d.ago.toUpperCase()} AGO</span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}