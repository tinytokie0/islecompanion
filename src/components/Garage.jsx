import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { stageFor } from "@/lib/growthStages";

const ACCENTS = ["#dc2626", "#f59e0b", "#22c55e", "#84cc16", "#ef4444", "#38bdf8", "#a78bfa"];

const accentFor = (seed) => {
  let h = 0;
  for (const ch of String(seed || "")) h = (h + ch.charCodeAt(0) * 7) % 9973;
  return ACCENTS[h % ACCENTS.length];
};

const SILHOUETTE =
  "M 30 120 Q 40 100 60 95 L 80 85 Q 100 75 120 80 L 140 70 Q 160 65 170 75 L 165 90 Q 155 95 145 100 L 135 110 Q 130 125 120 130 L 110 135 Q 95 140 80 138 L 65 145 Q 45 150 35 140 Z";

const ageOf = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
};

export default function Garage() {
  const [specimens, setSpecimens] = useState(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const page = await base44.entities.LiveDino.filter(
          { last_seen: { $gte: since } },
          { sort: "-last_seen", limit: 50 }
        );
        if (alive) {
          setSpecimens(page.items);
          setSelected((s) => Math.min(s, Math.max(0, page.items.length - 1)));
        }
      } catch {
        if (alive) setSpecimens([]);
      }
    };
    load();
    const timer = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const loading = specimens === null;
  const active = specimens && specimens[selected];

  return (
    <section id="garage" className="relative py-24 md:py-32 px-6 md:px-10 overflow-hidden">
      {/* Biome lighting shift */}
      <div
        className="absolute inset-0 transition-all duration-1000 opacity-20"
        style={{
          background: active
            ? `radial-gradient(ellipse at center, ${accentFor(active.steam_id)}22 0%, transparent 70%)`
            : "none",
        }}
      />

      <div className="relative max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary mb-3 block">
              LIVE SPECIMENS
            </span>
            <h2 className="font-heading text-3xl md:text-5xl tracking-[0.08em] text-foreground">
              THE GARAGE
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-md tracking-wide leading-relaxed">
            Every dino currently on the island, recorded live from the server
            every five minutes. Select one to inspect it.
          </p>
        </div>

        {loading ? (
          <div className="glass-panel p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> READING ISLAND DATA...
          </div>
        ) : specimens.length === 0 ? (
          <div className="glass-panel p-10 text-center">
            <div className="font-heading text-xl text-foreground mb-2">No dinos on the island</div>
            <p className="font-mono text-xs text-muted-foreground">
              Specimens appear here the moment players spawn in.
            </p>
          </div>
        ) : (
          <>
            {/* Active specimen display */}
            <div className="glass-panel p-6 md:p-10 mb-8 grid md:grid-cols-2 gap-8 items-center">
              {/* Specimen visual */}
              <div className="relative aspect-square glass-panel-light flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div
                  className="absolute w-3/4 h-3/4 rounded-full blur-3xl opacity-30 transition-colors duration-700"
                  style={{ backgroundColor: accentFor(active.steam_id) }}
                />
                <svg viewBox="0 0 200 200" className="relative w-3/4 h-3/4">
                  <path
                    d={SILHOUETTE}
                    fill={accentFor(active.steam_id)}
                    opacity="0.9"
                    className="animate-breathe"
                  />
                  <circle cx="155" cy="80" r="3" fill="#0A0F0D" />
                  {[...Array(5)].map((_, i) => (
                    <path
                      key={i}
                      d={`M ${75 + i * 18} ${85 - i * 1} L ${80 + i * 18} ${75 - i * 1} L ${85 + i * 18} ${85 - i * 1}`}
                      fill={accentFor(active.steam_id)}
                      opacity="0.7"
                    />
                  ))}
                </svg>
                <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                  STEAM {String(active.steam_id || "").slice(-6)}
                </div>
                <div className="absolute top-4 right-4 font-mono text-[9px] tracking-[0.2em] px-2 py-1 border text-primary border-primary/50 bg-primary/10">
                  ● ON THE ISLAND
                </div>
              </div>

              {/* Specimen data */}
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-2">
                  PLAYER — {active.player_name || "UNKNOWN"}
                </div>
                <h3 className="font-heading text-3xl md:text-4xl tracking-[0.05em] text-foreground mb-1">
                  {(active.species || "Unknown species").toUpperCase()}
                </h3>
                <div className="font-mono text-xs text-primary tracking-wide mb-6">
                  SERVER: {active.server_name || "THE HAVEN"} — SEEN {ageOf(active.last_seen).toUpperCase()}
                </div>

                {/* Growth bar with stage */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">GROWTH</span>
                    <span className="font-mono text-[10px] text-primary">
                      {active.growth ?? 0}% — {stageFor(active.growth || 0).current.name}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${active.growth || 0}%`, backgroundColor: accentFor(active.steam_id) }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Specimen gallery */}
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {specimens.map((spec, i) => {
                const accent = accentFor(spec.steam_id);
                const { current, next } = stageFor(spec.growth || 0);
                return (
                  <button
                    key={spec.steam_id}
                    onClick={() => setSelected(i)}
                    className={`flex-shrink-0 w-44 md:w-52 glass-panel-light p-4 text-left transition-all duration-300 hover:scale-105 ${
                      selected === i ? "border-primary/60 ring-1 ring-primary/30" : ""
                    }`}
                  >
                    <div
                      className="w-full aspect-video mb-3 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: `${accent}11` }}
                    >
                      <svg viewBox="0 0 200 200" className="w-3/4 h-3/4">
                        <path d={SILHOUETTE} fill={accent} opacity="0.8" />
                      </svg>
                      <div className="absolute bottom-1 right-1 font-mono text-[8px] text-muted-foreground">
                        {spec.growth ?? 0}%
                      </div>
                      <div className="absolute bottom-1 left-1 font-mono text-[8px] tracking-[0.15em] text-primary">
                        ● LIVE
                      </div>
                    </div>
                    <div className="font-mono text-xs text-foreground tracking-wide mb-1 truncate">
                      {spec.species || "Unknown"}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-wide mb-2 truncate">
                      {spec.player_name || "Unknown"} — {current.name}
                      {next ? ` → ${next.name}` : ""}
                    </div>
                    <div className="h-1 bg-secondary overflow-hidden">
                      <div
                        className="h-full transition-all duration-700"
                        style={{ width: `${spec.growth || 0}%`, backgroundColor: accent }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}