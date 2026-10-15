import React, { useState } from "react";
import { Coins, Zap, MapPin } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { TELEPORTS, START_SHARDS } from "@/lib/portalData";

export default function Teleports() {
  const [shards, setShards] = useState(START_SHARDS);
  const [busy, setBusy] = useState(null); // name of location being teleported to
  const [arrived, setArrived] = useState(null);

  const teleport = (loc) => {
    if (busy || shards < loc.cost) return;
    setBusy(loc.name);
    setArrived(null);
    setShards((s) => s - loc.cost);
    setTimeout(() => {
      setBusy(null);
      setArrived(loc.name);
    }, 1800);
  };

  return (
    <PageShell
      kicker="WAYGATE NETWORK"
      title="TELEPORTS"
      sub="Teleport to locations set up by the admins. Waygates cost shards and share one cooldown."
      right={
        <div className="glass-panel-light px-4 py-2 flex items-center gap-2 w-fit">
          <Coins size={14} className="text-accent" />
          <span className="font-mono text-xs text-foreground">{shards.toLocaleString()}</span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">SHARDS</span>
        </div>
      }
    >
      {arrived && (
        <div className="glass-panel rounded-sm px-5 py-3 mb-6 flex items-center gap-3">
          <Zap size={14} className="text-accent" />
          <span className="font-mono text-[11px] tracking-[0.15em] text-foreground">
            ARRIVED AT {arrived.toUpperCase()}
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TELEPORTS.map((loc) => {
          const afford = shards >= loc.cost;
          const isActive = busy === loc.name;
          return (
            <div key={loc.name} className="glass-panel rounded-lg p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={15} className="text-primary" />
                <span className="font-heading text-lg tracking-[0.05em] text-foreground">
                  {loc.name.toUpperCase()}
                </span>
              </div>
              <div className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground mb-6 flex-1">
                {loc.biome.toUpperCase()}
              </div>
              <button
                onClick={() => teleport(loc)}
                disabled={!!busy || !afford}
                className={`w-full font-mono text-[10px] tracking-[0.25em] py-3 rounded-sm border transition-colors ${
                  isActive
                    ? "border-accent/60 text-accent animate-pulse"
                    : afford
                      ? "border-primary/40 text-primary hover:bg-primary/10"
                      : "border-border text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                {isActive ? "TELEPORTING..." : `TELEPORT — ${loc.cost} SHARDS`}
              </button>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}