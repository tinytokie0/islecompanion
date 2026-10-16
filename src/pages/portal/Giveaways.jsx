import React from "react";
import { Gift, Trophy } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

export default function Giveaways() {
  return (
    <PageShell
      kicker="TRIBE FAVORS"
      title="GIVEAWAYS"
      sub="Enter active giveaways for dinos, skins and Haven Tokens. Winners drawn live on Discord."
    >
      <div className="glass-panel rounded-lg p-10 text-center mb-8">
        <Gift size={22} className="mx-auto mb-3 text-muted-foreground" />
        <div className="font-heading text-xl text-foreground mb-2">No active giveaways right now</div>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Giveaways appear here as soon as admins start one.
        </p>
      </div>

      <div className="glass-panel rounded-lg p-6 mb-8">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5 flex items-center gap-2">
          <Trophy size={13} className="text-accent" /> PAST WINNERS
        </div>
        <div className="font-mono text-[11px] text-muted-foreground py-4 text-center">
          No winners recorded yet.
        </div>
      </div>

      <LiveIslandStrip />
    </PageShell>
  );
}