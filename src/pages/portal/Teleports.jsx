import React from "react";
import { Zap } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

export default function Teleports() {
  return (
    <PageShell
      kicker="WAYGATE NETWORK"
      title="TELEPORTS"
      sub="Teleport to locations set up by the admins. Waygates cost shards and share one cooldown."
    >
      <div className="glass-panel rounded-lg p-10 text-center mb-8">
        <Zap size={22} className="mx-auto mb-3 text-muted-foreground" />
        <div className="font-heading text-xl text-foreground mb-2">No waygates configured yet</div>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Waygates appear here as soon as admins set them up.
        </p>
      </div>

      <LiveIslandStrip />
    </PageShell>
  );
}