import React from "react";
import { Link } from "react-router-dom";
import { Warehouse, Brush, Loader2, Dna } from "lucide-react";
import PageShell from "@/components/portal/PageShell";

import useMyDino from "@/hooks/useMyDino";
import { stageFor } from "@/lib/growthStages";
import DinoPortrait from "@/components/DinoPortrait";

const ACCENTS = ["#dc2626", "#f59e0b", "#22c55e", "#84cc16", "#ef4444", "#38bdf8", "#a78bfa"];

const accentFor = (seed) => {
  let h = 0;
  for (const ch of String(seed || "")) h = (h + ch.charCodeAt(0) * 7) % 9973;
  return ACCENTS[h % ACCENTS.length];
};

const SILHOUETTE =
  "M 30 120 Q 40 100 60 95 L 80 85 Q 100 75 120 80 L 140 70 Q 160 65 170 75 L 165 90 Q 155 95 145 100 L 135 110 Q 130 125 120 130 L 110 135 Q 95 140 80 138 L 65 145 Q 45 150 35 140 Z";

export default function YourDino() {
  const { loading, linked, dino } = useMyDino();

  const fresh =
    dino &&
    dino.last_seen &&
    Date.now() - new Date(dino.last_seen).getTime() < 10 * 60 * 1000;
  const accent = accentFor(dino?.steam_id);
  const { current, next } = stageFor(dino?.growth || 0);

  return (
    <PageShell
      kicker="YOUR ROSTER"
      title="YOUR DINO"
      sub="Your current dinosaur, tracked live from the server."
    >
      {loading ? (
        <div className="glass-panel rounded-lg p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> READING ISLAND DATA...
        </div>
      ) : !linked ? (
        <div className="glass-panel rounded-lg p-10 text-center">
          <Dna size={22} className="mx-auto mb-3 text-muted-foreground" />
          <div className="font-heading text-xl text-foreground mb-2">Link your Steam account</div>
          <p className="font-mono text-xs text-muted-foreground mb-5 leading-relaxed">
            Connect Steam from the home page so the site knows which dino is
            yours.
          </p>
          <Link
            to="/"
            className="font-mono text-[10px] tracking-[0.25em] border border-primary/40 text-primary px-6 py-3 rounded-sm hover:bg-primary/10 transition-colors inline-flex items-center gap-2"
          >
            <Dna size={13} /> GO TO STEAM LINKING
          </Link>
        </div>
      ) : !dino ? (
        <div className="glass-panel rounded-lg p-10 text-center">
          <div className="font-heading text-xl text-foreground mb-2">No dino detected yet</div>
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            Spawn in on the island and your dinosaur appears here automatically.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-lg p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center">
          {/* Visual */}
          <div className="relative aspect-square glass-panel-light rounded-lg flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div
              className="absolute w-3/4 h-3/4 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: accent }}
            />
            <DinoPortrait species={dino.species} className="absolute inset-0" />
            <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              {dino.player_name ? dino.player_name.toUpperCase() : "UNKNOWN PLAYER"}
            </div>
            <div className="absolute top-4 right-4 font-mono text-[9px] tracking-[0.2em] px-2 py-1 border border-primary/50 text-primary bg-primary/10">
              {fresh ? "● ON THE ISLAND" : "○ LAST SEEN"}
            </div>
          </div>

          {/* Data */}
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-2">
              {fresh ? "ACTIVE SPECIMEN" : "LAST SEEN SPECIMEN"}
            </div>
            <h2 className="font-heading text-3xl md:text-4xl tracking-[0.05em] text-foreground mb-1">
              {(dino.species || "Unknown species").toUpperCase()}
            </h2>
            <div className="font-mono text-xs text-primary tracking-wide mb-6">
              SERVER: {(dino.server_name || "THE HAVEN").toUpperCase()} —{" "}
              {dino.last_seen ? new Date(dino.last_seen).toLocaleString() : "UNKNOWN"}
            </div>

            {/* Growth bar with stage */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">GROWTH</span>
                <span className="font-mono text-[10px] text-primary">
                  {dino.growth ?? 0}% — {current.name}
                  {next ? ` → ${next.name} AT ${next.at}%` : ""}
                </span>
              </div>
              <div className="h-1.5 bg-secondary overflow-hidden rounded-sm">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${dino.growth ?? 0}%`, backgroundColor: accent }}
                />
              </div>
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
      )}
    </PageShell>
  );
}