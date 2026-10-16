import React from "react";
import { Bone } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import usePlayShards from "@/hooks/usePlayShards";
import EconomyChips from "@/components/portal/EconomyChips";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

export default function CarcassDrop() {
  const [shards] = usePlayShards();

  return (
    <PageShell
      kicker="SCAVENGER FEED"
      title="CARCASS DROP"
      sub="A fresh carcass lands somewhere on the island every few hours. First scavenger takes the haul."
      right={<EconomyChips shards={shards} />}
    >
      {/* Active drop */}
      <div className="glass-panel rounded-lg p-8 mb-8 text-center">
        <span className="w-14 h-14 rounded-md border border-accent/40 bg-accent/10 flex items-center justify-center text-accent mx-auto mb-5">
          <Bone size={24} />
        </span>
        <div className="font-heading text-xl text-foreground mb-2">No drop scheduled right now</div>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Drops are announced here the moment admins schedule one.
        </p>
      </div>

      {/* History */}
      <div className="glass-panel rounded-lg divide-y divide-border/60 mb-8">
        <div className="p-5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
          PAST DROPS
        </div>
        <div className="p-8 font-mono text-[11px] text-muted-foreground text-center">
          No drops recorded yet.
        </div>
      </div>

      <LiveIslandStrip />
    </PageShell>
  );
}