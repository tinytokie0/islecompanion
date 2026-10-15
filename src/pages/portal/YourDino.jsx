import React from "react";
import { Link } from "react-router-dom";
import { Warehouse, Brush, Coins } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { stageFor } from "@/lib/growthStages";
import { START_SHARDS } from "@/lib/portalData";
import SteamLinkCard from "@/components/SteamLinkCard";

const SPECIMEN = {
  name: "Tyrannosaurus",
  code: "T-REX-001",
  growth: 92,
  biome: "VOID RIDGE",
  prime: "94",
  stats: { speed: 68, damage: 98, stamina: 72, health: 95 },
  accent: "#dc2626",
  skin: "Gilded Scales",
};

const SILHOUETTE =
  "M 30 120 Q 40 100 60 95 L 80 85 Q 100 75 120 80 L 140 70 Q 160 65 170 75 L 165 90 Q 155 95 145 100 L 135 110 Q 130 125 120 130 L 110 135 Q 95 140 80 138 L 65 145 Q 45 150 35 140 Z";

export default function YourDino() {
  const { current, next } = stageFor(SPECIMEN.growth);

  return (
    <PageShell
      kicker="YOUR ROSTER"
      title="YOUR DINO"
      sub="Your current dinosaur with skin, stats and prime status."
      right={
        <div className="glass-panel-light px-4 py-2 flex items-center gap-2 w-fit">
          <Coins size={14} className="text-accent" />
          <span className="font-mono text-xs text-foreground">{START_SHARDS.toLocaleString()}</span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">SHARDS</span>
        </div>
      }
    >
      <div className="glass-panel rounded-lg p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center">
        {/* Visual */}
        <div className="relative aspect-square glass-panel-light rounded-lg flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div
            className="absolute w-3/4 h-3/4 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: SPECIMEN.accent }}
          />
          <svg viewBox="0 0 200 200" className="relative w-3/4 h-3/4">
            <path d={SILHOUETTE} fill={SPECIMEN.accent} opacity="0.9" className="animate-breathe" />
            <circle cx="155" cy="80" r="3" fill="#0A0F0D" />
          </svg>
          <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
            {SPECIMEN.code}
          </div>
          <div className="absolute top-4 right-4 font-mono text-[9px] tracking-[0.2em] px-2 py-1 border border-primary/50 text-primary bg-primary/10">
            ● DEPLOYED
          </div>
        </div>

        {/* Data */}
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-2">
            ACTIVE SPECIMEN
          </div>
          <h2 className="font-heading text-3xl md:text-4xl tracking-[0.05em] text-foreground mb-1">
            {SPECIMEN.name.toUpperCase()}
          </h2>
          <div className="font-mono text-xs text-primary tracking-wide mb-6">
            BIOME: {SPECIMEN.biome} — PRIME: {SPECIMEN.prime}%
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">GROWTH</span>
              <span className="font-mono text-[10px] text-primary">
                {SPECIMEN.growth}% — {current.name}
                {next ? ` → ${next.name} AT ${next.at}%` : ""}
              </span>
            </div>
            <div className="h-1.5 bg-secondary overflow-hidden rounded-sm">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${SPECIMEN.growth}%`, backgroundColor: SPECIMEN.accent }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(SPECIMEN.stats).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">{key}</span>
                  <span className="font-mono text-[9px] text-foreground">{val}</span>
                </div>
                <div className="h-1 bg-secondary overflow-hidden rounded-sm">
                  <div className="h-full" style={{ width: `${val}%`, backgroundColor: SPECIMEN.accent }} />
                </div>
              </div>
            ))}
          </div>

          <div className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground mb-8">
            EQUIPPED SKIN: <span style={{ color: SPECIMEN.accent }}>{SPECIMEN.skin.toUpperCase()}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/garage"
              className="flex-1 font-mono text-[10px] tracking-[0.25em] border border-primary/40 text-primary px-6 py-3 rounded-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
            >
              <Warehouse size={13} /> MANAGE GARAGE
            </Link>
            <Link
              to="/skin"
              className="flex-1 font-mono text-[10px] tracking-[0.25em] border border-border text-muted-foreground px-6 py-3 rounded-sm hover:text-foreground hover:border-primary/40 transition-colors flex items-center justify-center gap-2"
            >
              <Brush size={13} /> EDIT SKIN
            </Link>
          </div>
        </div>
      </div>

      <SteamLinkCard />
    </PageShell>
  );
}