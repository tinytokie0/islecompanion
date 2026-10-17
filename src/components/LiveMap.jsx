import React from "react";
import { Loader2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import gatewayMap from "@/assets/gateway-map.webp";
import useLiveDinos from "@/hooks/useLiveDinos";

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

// World units -> Gateway map percentage. Evrima spans about ±350,000 units on
// both axes: UE X runs south-to-north (up the image), Y west-to-east (right).
const WORLD_HALF = 350000;
function worldToMap(d) {
  if (d.pos_x == null || d.pos_y == null) return null;
  const x = ((d.pos_y + WORLD_HALF) / (WORLD_HALF * 2)) * 100;
  const y = ((WORLD_HALF - d.pos_x) / (WORLD_HALF * 2)) * 100;
  return {
    x: Math.min(99, Math.max(1, x)),
    y: Math.min(99, Math.max(1, y)),
  };
}

// Blip color by diet
const CARNIVORES = new Set([
  "Allosaurus", "Austroraptor", "Carnotaurus", "Ceratosaurus", "Deinosuchus",
  "Dilophosaurus", "Herrerasaurus", "Omniraptor", "Pteranodon", "Troodon",
  "Tyrannosaurus",
]);
const OMNIVORES = new Set(["Beipiaosaurus", "Hypsilophodon"]);
function blipColor(species) {
  if (CARNIVORES.has(species)) return "#ef4444";
  if (OMNIVORES.has(species)) return "#f59e0b";
  return "#22c55e";
}

function seenAgo(iso) {
  if (!iso) return "—";
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ${min % 60}m ago`;
}

export default function LiveMap() {
  const { dinos, loading } = useLiveDinos({ windowMinutes: 15, refreshMs: 30000 });
  const players = dinos || [];

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
            Gateway, the Evrima branch island, tracking live player positions
            and last-seen times from the server feed.
          </p>
        </div>

        <div className="flex justify-center">
          {/* Map container */}
          <div className="relative w-full max-w-[900px] aspect-square glass-panel overflow-hidden">
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

            {/* Live player blips */}
            {!loading && players.map((d) => {
              const p = worldToMap(d);
              if (!p) return null;
              const color = blipColor(d.species);
              return (
                <div
                  key={d.steam_id}
                  className="absolute group pointer-events-auto"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  {/* parent box sized to the dot so the pulse ring can fill it */}
                  <div className="relative w-2.5 h-2.5">
                    <span
                      className="absolute inset-0 rounded-full animate-blip"
                      style={{ backgroundColor: color, opacity: 0.4 }}
                    />
                    <span
                      className="block w-2.5 h-2.5 rounded-full border border-black/60"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                    />
                  </div>
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block glass-panel rounded-md px-3 py-2 whitespace-nowrap z-20">
                    <div className="font-mono text-[10px] text-foreground">
                      {d.player_name || "Unknown"}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground">
                      {d.species || "?"} · {d.growth ?? 0}% · seen {seenAgo(d.last_seen)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Compass */}
            <div className="absolute top-6 right-6 w-16 h-16 glass-panel-light flex items-center justify-center">
              <div className="font-mono text-[10px] text-primary tracking-widest">N</div>
              <div className="absolute top-1 w-px h-3 bg-primary" />
            </div>

            {/* Live players panel */}
            <div className="absolute top-6 left-6 glass-panel-light px-4 py-3 max-w-[260px] max-h-[60%] overflow-y-auto hide-scrollbar">
              <div className="font-mono text-[9px] tracking-[0.2em] text-primary mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ON THE ISLAND
              </div>
              {loading ? (
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                  <Loader2 size={11} className="animate-spin" /> SCANNING...
                </div>
              ) : players.length === 0 ? (
                <div className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  No players detected right now. Players appear here the moment they spawn in.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {players.map((d) => (
                    <div key={d.steam_id} className="font-mono text-[10px] leading-tight">
                      <span className="text-foreground">{d.player_name || "Unknown"}</span>
                      <span className="text-muted-foreground">
                        {" "}· {d.species || "?"} · {d.growth ?? 0}% · {seenAgo(d.last_seen)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coordinates display */}
            <div className="absolute bottom-6 left-6 glass-panel-light px-3 py-2">
              <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
                MAP: <span className="text-primary">GATEWAY</span>
              </span>
            </div>

            {/* Feed status */}
            <div className="absolute bottom-6 right-6 glass-panel-light px-4 py-3 text-right">
              <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
                {loading
                  ? "READING FEED..."
                  : `${players.length} CONTACT${players.length === 1 ? "" : "S"} · LIVE FEED`}
              </div>
              {!loading && players.length > 0 && players.every((d) => d.pos_x == null) && (
                <div className="font-mono text-[8px] tracking-[0.15em] text-primary mt-1 max-w-[190px]">
                  WAITING ON GPS FEED — MARKERS APPEAR ONCE THE SERVER SENDS POSITIONS
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}