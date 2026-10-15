import React, { useState } from "react";

const BLIPS = [
  { id: 1, x: 22, y: 30, type: "Carnotaurus", level: "Sub-Adult", threat: "high", color: "#ef4444" },
  { id: 2, x: 45, y: 55, type: "Tyrannosaurus", level: "Adult", threat: "critical", color: "#dc2626" },
  { id: 3, x: 68, y: 25, type: "Dakotaraptor", level: "Juvenile", threat: "medium", color: "#f59e0b" },
  { id: 4, x: 35, y: 70, type: "Stegosaurus", level: "Adult", threat: "low", color: "#22c55e" },
  { id: 5, x: 78, y: 60, type: "Acrocanthosaurus", level: "Sub-Adult", threat: "high", color: "#ef4444" },
  { id: 6, x: 15, y: 50, type: "Pteranodon", level: "Adult", threat: "low", color: "#22c55e" },
  { id: 7, x: 55, y: 40, type: "Deinosuchus", level: "Adult", threat: "critical", color: "#dc2626" },
  { id: 8, x: 88, y: 38, type: "Dakotaraptor", level: "Sub-Adult", threat: "medium", color: "#f59e0b" },
];

const ZONES = [
  { name: "SWAMP", x: 20, y: 65 },
  { name: "PLAINS", x: 55, y: 30 },
  { name: "RIDGE", x: 80, y: 55 },
];

export default function LiveMap() {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <section id="map" className="relative py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary mb-3 block">
              01 — CARTOGRAPHY
            </span>
            <h2 className="font-heading text-3xl md:text-5xl tracking-[0.08em] text-foreground">
              LIVING MAP
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-md tracking-wide leading-relaxed">
            Real-time spatial telemetry. Neural blips pulse with creature
            activity. Hover any contact for elevation and threat data.
          </p>
        </div>

        {/* Map container */}
        <div
          className="relative w-full aspect-[16/9] glass-panel overflow-hidden group"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
        >
          {/* Topographic grid */}
          <div className="absolute inset-0 grid-bg" />

          {/* Contour lines SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 56" preserveAspectRatio="none">
            <defs>
              <radialGradient id="terrain1" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Water bodies */}
            <path d="M 5 40 Q 15 35 25 42 Q 35 48 20 52 Q 8 50 5 40 Z" fill="#1e3a5f" opacity="0.3" />
            <path d="M 70 15 Q 80 12 85 20 Q 88 28 75 25 Q 68 20 70 15 Z" fill="#1e3a5f" opacity="0.3" />
            {/* Contour curves */}
            {[...Array(6)].map((_, i) => (
              <path
                key={i}
                d={`M ${10 + i * 3} ${15 + i * 2} Q ${30 + i * 4} ${10 + i * 3} ${50 + i * 3} ${20 + i * 2} T ${90 - i * 2} ${30 + i * 2}`}
                fill="none"
                stroke="#22c55e"
                strokeWidth="0.15"
                opacity={0.15 - i * 0.015}
              />
            ))}
            {/* Roads / paths */}
            <path d="M 10 50 Q 30 40 50 45 T 90 35" fill="none" stroke="#f59e0b" strokeWidth="0.2" strokeDasharray="1 1" opacity="0.4" />
          </svg>

          {/* Zone labels */}
          {ZONES.map((zone) => (
            <div
              key={zone.name}
              className="absolute font-mono text-[10px] tracking-[0.25em] text-muted-foreground/60 pointer-events-none"
              style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {zone.name}
            </div>
          ))}

          {/* Blips */}
          {BLIPS.map((blip) => (
            <div
              key={blip.id}
              className="absolute cursor-pointer"
              style={{ left: `${blip.x}%`, top: `${blip.y}%`, transform: "translate(-50%, -50%)" }}
              onMouseEnter={() => setHovered(blip)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Pulse ring */}
              <span
                className="absolute inset-0 rounded-full animate-blip"
                style={{ backgroundColor: blip.color }}
              />
              {/* Core dot */}
              <span
                className="relative block w-3 h-3 rounded-full border-2 border-background animate-breathe"
                style={{ backgroundColor: blip.color, boxShadow: `0 0 12px ${blip.color}` }}
              />
            </div>
          ))}

          {/* Compass */}
          <div className="absolute top-6 right-6 w-16 h-16 glass-panel-light flex items-center justify-center">
            <div className="font-mono text-[10px] text-primary tracking-widest">N</div>
            <div className="absolute top-1 w-px h-3 bg-primary" />
          </div>

          {/* Coordinates display */}
          <div className="absolute bottom-6 left-6 glass-panel-light px-3 py-2">
            <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
              GRID:{" "}
              <span className="text-primary">
                {String(Math.round(mousePos.x / 10)).padStart(2, "0")}/
                {String(Math.round(mousePos.y / 10)).padStart(2, "0")}
              </span>
            </span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 right-6 glass-panel-light px-4 py-3 flex flex-col gap-1.5">
            {[
              { color: "#dc2626", label: "CRITICAL" },
              { color: "#ef4444", label: "HIGH" },
              { color: "#f59e0b", label: "MEDIUM" },
              { color: "#22c55e", label: "LOW" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Hover tooltip */}
          {hovered && (
            <div
              className="absolute z-20 glass-panel px-4 py-3 pointer-events-none animate-flicker min-w-[180px]"
              style={{
                left: `${hovered.x}%`,
                top: `${hovered.y}%`,
                transform: "translate(20px, -50%)",
              }}
            >
              <div className="font-mono text-xs text-foreground tracking-wide mb-1">{hovered.type}</div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-wide mb-2">
                {hovered.level}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: hovered.color }}
                />
                <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                  Threat: {hovered.threat}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats below map */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "CONTACTS", value: BLIPS.length },
            { label: "HOSTILES", value: BLIPS.filter((b) => b.threat === "critical" || b.threat === "high").length },
            { label: "HERBIVORES", value: 2 },
            { label: "AQUATIC", value: 1 },
          ].map((s) => (
            <div key={s.label} className="glass-panel-light px-4 py-3">
              <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1">{s.label}</div>
              <div className="font-mono text-xl text-primary">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}