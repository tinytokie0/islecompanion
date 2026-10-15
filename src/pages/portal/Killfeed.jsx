import React from "react";
import { Skull } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { KILLFEED } from "@/lib/portalData";

const TIER_COLOR = { critical: "#dc2626", high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

export default function Killfeed() {
  return (
    <PageShell
      kicker="REALM NEWS"
      title="KILLFEED"
      sub="Every death on the island, as it happens. Fresh kills at the top."
    >
      <div className="glass-panel rounded-lg divide-y divide-border/60">
        {KILLFEED.map((k, i) => (
          <div
            key={i}
            className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 border-l-2"
            style={{ borderLeftColor: TIER_COLOR[k.tier] }}
          >
            <span
              className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
              style={{ color: TIER_COLOR[k.tier], backgroundColor: `${TIER_COLOR[k.tier]}14`, border: `1px solid ${TIER_COLOR[k.tier]}44` }}
            >
              <Skull size={15} />
            </span>
            <div className="flex-1 min-w-0 font-mono text-xs text-foreground tracking-wide">
              <span style={{ color: TIER_COLOR[k.tier] }}>{k.killer}</span>
              <span className="text-muted-foreground"> ({k.dino}) </span>
              <span className="text-muted-foreground/60">killed</span>
              <span className="text-muted-foreground"> {k.victim} </span>
              <span className="text-muted-foreground">({k.vdino})</span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
                {k.region.toUpperCase()}
              </span>
              <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground/70">
                {k.ago.toUpperCase()} AGO
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 mt-6">
        {[
          { label: "CRITICAL KILL", color: "#dc2626" },
          { label: "HIGH THREAT", color: "#ef4444" },
          { label: "MEDIUM THREAT", color: "#f59e0b" },
          { label: "LOW THREAT", color: "#22c55e" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}