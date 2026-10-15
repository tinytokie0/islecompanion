import React, { useState } from "react";

const SPECIMENS = [
  {
    name: "Tyrannosaurus",
    code: "T-REX-001",
    growth: 92,
    biome: "RIDGE",
    prime: "94",
    stats: { speed: 68, damage: 98, stamina: 72, health: 95 },
    accent: "#dc2626",
  },
  {
    name: "Carnotaurus",
    code: "CARNO-014",
    growth: 78,
    biome: "PLAINS",
    prime: "88",
    stats: { speed: 85, damage: 80, stamina: 78, health: 70 },
    accent: "#f59e0b",
  },
  {
    name: "Dakotaraptor",
    code: "RAPT-007",
    growth: 100,
    biome: "SWAMP",
    prime: "91",
    stats: { speed: 95, damage: 60, stamina: 90, health: 55 },
    accent: "#22c55e",
  },
  {
    name: "Stegosaurus",
    code: "STEG-003",
    growth: 85,
    biome: "PLAINS",
    prime: "87",
    stats: { speed: 40, damage: 75, stamina: 65, health: 90 },
    accent: "#84cc16",
  },
  {
    name: "Acrocanthosaurus",
    code: "ACRO-009",
    growth: 64,
    biome: "RIDGE",
    prime: "82",
    stats: { speed: 72, damage: 90, stamina: 70, health: 85 },
    accent: "#ef4444",
  },
];

export default function Garage() {
  const [selected, setSelected] = useState(0);
  const active = SPECIMENS[selected];

  return (
    <section id="garage" className="relative py-24 md:py-32 px-6 md:px-10 overflow-hidden">
      {/* Biome lighting shift */}
      <div
        className="absolute inset-0 transition-all duration-1000 opacity-20"
        style={{
          background: `radial-gradient(ellipse at center, ${active.accent}22 0%, transparent 70%)`,
        }}
      />

      <div className="relative max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary mb-3 block">
              02 — STASIS CHAMBER
            </span>
            <h2 className="font-heading text-3xl md:text-5xl tracking-[0.08em] text-foreground">
              THE GARAGE
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-md tracking-wide leading-relaxed">
            Your specimen collection. Each creature carries its prime stats
            and growth telemetry. Select to inspect.
          </p>
        </div>

        {/* Active specimen display */}
        <div className="glass-panel p-6 md:p-10 mb-8 grid md:grid-cols-2 gap-8 items-center">
          {/* Specimen visual */}
          <div className="relative aspect-square glass-panel-light flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div
              className="absolute w-3/4 h-3/4 rounded-full blur-3xl opacity-30 transition-colors duration-700"
              style={{ backgroundColor: active.accent }}
            />
            {/* Silhouette */}
            <svg viewBox="0 0 200 200" className="relative w-3/4 h-3/4">
              <path
                d="M 30 120 Q 40 100 60 95 L 80 85 Q 100 75 120 80 L 140 70 Q 160 65 170 75 L 165 90 Q 155 95 145 100 L 135 110 Q 130 125 120 130 L 110 135 Q 95 140 80 138 L 65 145 Q 45 150 35 140 Z"
                fill={active.accent}
                opacity="0.9"
                className="animate-breathe"
              />
              <circle cx="155" cy="80" r="3" fill="#0A0F0D" />
              {/* Spine ridges */}
              {[...Array(5)].map((_, i) => (
                <path
                  key={i}
                  d={`M ${75 + i * 18} ${85 - i * 1} L ${80 + i * 18} ${75 - i * 1} L ${85 + i * 18} ${85 - i * 1}`}
                  fill={active.accent}
                  opacity="0.7"
                />
              ))}
            </svg>
            <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              {active.code}
            </div>
          </div>

          {/* Specimen data */}
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-2">
              SPECIMEN — {active.code}
            </div>
            <h3 className="font-heading text-3xl md:text-4xl tracking-[0.05em] text-foreground mb-1">
              {active.name.toUpperCase()}
            </h3>
            <div className="font-mono text-xs text-primary tracking-wide mb-8">
              BIOME: {active.biome} — PRIME: {active.prime}%
            </div>

            {/* Growth bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">GROWTH</span>
                <span className="font-mono text-[10px] text-primary">{active.growth}%</span>
              </div>
              <div className="h-1.5 bg-secondary overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${active.growth}%`, backgroundColor: active.accent }}
                />
              </div>
            </div>

            {/* Prime stats */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(active.stats).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                      {key}
                    </span>
                    <span className="font-mono text-[9px] text-foreground">{val}</span>
                  </div>
                  <div className="h-1 bg-secondary overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${val}%`, backgroundColor: active.accent }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 font-mono text-[10px] tracking-[0.25em] border border-primary/40 text-primary px-6 py-3 hover:bg-primary/10 transition-colors w-full md:w-auto">
              DEPLOY SPECIMEN →
            </button>
          </div>
        </div>

        {/* Horizontal specimen gallery */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {SPECIMENS.map((spec, i) => (
            <button
              key={spec.code}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-44 md:w-52 glass-panel-light p-4 text-left transition-all duration-300 hover:scale-105 ${
                selected === i ? "border-primary/60 ring-1 ring-primary/30" : ""
              }`}
            >
              <div
                className="w-full aspect-video mb-3 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: `${spec.accent}11` }}
              >
                <svg viewBox="0 0 200 200" className="w-3/4 h-3/4">
                  <path
                    d="M 30 120 Q 40 100 60 95 L 80 85 Q 100 75 120 80 L 140 70 Q 160 65 170 75 L 165 90 Q 155 95 145 100 L 135 110 Q 130 125 120 130 L 110 135 Q 95 140 80 138 L 65 145 Q 45 150 35 140 Z"
                    fill={spec.accent}
                    opacity="0.8"
                  />
                </svg>
                <div className="absolute bottom-1 right-1 font-mono text-[8px] text-muted-foreground">
                  {spec.prime}%
                </div>
              </div>
              <div className="font-mono text-xs text-foreground tracking-wide mb-1 truncate">
                {spec.name}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground tracking-wide">
                {spec.code} — {spec.biome}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}