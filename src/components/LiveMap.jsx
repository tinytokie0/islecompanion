import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import gatewayMap from "@/assets/gateway-map.webp";

// Real Gateway (Evrima branch) landmarks, positioned as % of the map image
const ZONES = [
  { name: "East Plains", x: 83, y: 37.5 },
  { name: "Highlands J Sector", x: 36.6, y: 46.7 },
  { name: "Jungle I Sector", x: 56.4, y: 39.6 },
  { name: "North Lake", x: 75.1, y: 16.7 },
  { name: "Northern Jungle", x: 68.4, y: 18.5 },
  { name: "Northwest Ridge", x: 37.5, y: 22 },
  { name: "South Plains", x: 31.8, y: 64.8 },
  { name: "Southern Beach", x: 58.7, y: 83.3 },
  { name: "Swamps Center", x: 53.4, y: 70.4 },
  { name: "Swamps East", x: 60.3, y: 75.4 },
  { name: "Volcano", x: 70.8, y: 25.7 },
  { name: "Water Access", x: 53.4, y: 28.7 },
  { name: "West Access", x: 12.5, y: 38.7 },
  { name: "West Rail Access", x: 24.7, y: 51.6 },
];

const BLIPS = [
  { id: 1, x: 37.5, y: 24, type: "Carnotaurus", level: "Sub-Adult", threat: "high", color: "#ef4444" },
  { id: 2, x: 56.4, y: 41, type: "Tyrannosaurus", level: "Adult", threat: "critical", color: "#dc2626" },
  { id: 3, x: 70, y: 21, type: "Dakotaraptor", level: "Juvenile", threat: "medium", color: "#f59e0b" },
  { id: 4, x: 33, y: 66, type: "Stegosaurus", level: "Adult", threat: "low", color: "#22c55e" },
  { id: 5, x: 54, y: 72, type: "Acrocanthosaurus", level: "Sub-Adult", threat: "high", color: "#ef4444" },
  { id: 6, x: 83, y: 39, type: "Pteranodon", level: "Adult", threat: "low", color: "#22c55e" },
  { id: 7, x: 59, y: 83, type: "Deinosuchus", level: "Adult", threat: "critical", color: "#dc2626" },
  { id: 8, x: 25, y: 52, type: "Dakotaraptor", level: "Sub-Adult", threat: "medium", color: "#f59e0b" },
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
              01 — REALM CARTOGRAPHY
            </span>
            <h2 className="font-heading text-3xl md:text-5xl tracking-[0.08em] text-foreground">
              GATEWAY — LIVING MAP
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-md tracking-wide leading-relaxed">
            Real-time spatial telemetry over Gateway, the Evrima branch island.
            Hover any contact for species, growth stage and threat data.
          </p>
        </div>

        <div className="flex justify-center">
          {/* Map container */}
          <div
            className="relative w-full max-w-[900px] aspect-square glass-panel overflow-hidden group"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
          >
            {/* In-game Gateway map render */}
            <Image
              src={gatewayMap}
              alt="The Isle Gateway map"
              className="absolute inset-0 w-full h-full"
              fittingType="fill"
            />

            {/* Tactical tint overlays */}
            <div className="absolute inset-0 bg-background/25" />

            {/* Tactical grid */}
            <div className="absolute inset-0 grid-bg opacity-40" />

            {/* Zone labels — in-game style */}
            {ZONES.map((zone) => (
              <div
                key={zone.name}
                className="absolute font-mono text-[10px] md:text-xs tracking-wide pointer-events-none whitespace-nowrap"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  transform: "translate(-50%, -50%)",
                  color: "#ffa500",
                  textShadow: "0 0 4px #000, 0 1px 2px #000, 1px 1px 0 #000",
                }}
              >
                {zone.name}
              </div>
            ))}

            {/* Blips */}
            {BLIPS.map((blip) => (
              <div
                key={blip.id}
                className="absolute cursor-pointer z-10"
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
        </div>

        {/* Stats below map */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-[900px] mx-auto">
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