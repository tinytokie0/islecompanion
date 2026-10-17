import React, { useEffect, useState } from "react";
import { Loader2, Archive, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { stageFor } from "@/lib/growthStages";
import DinoPortrait from "@/components/DinoPortrait";

// Same cinematic jungle footage the portal home hero uses, so the garage
// opens with the same atmospheric full-bleed look.
const HERO_VIDEO =
  "https://media.base44.com/videos/public/user_699e79e1191555fa18956285/b1dafa1ed_lv__20261015084341.mp4";

const ACCENTS = ["#dc2626", "#f59e0b", "#22c55e", "#84cc16", "#ef4444", "#38bdf8", "#a78bfa"];

const accentFor = (seed) => {
  let h = 0;
  for (const ch of String(seed || "")) h = (h + ch.charCodeAt(0) * 7) % 9973;
  return ACCENTS[h % ACCENTS.length];
};

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
  const [mySteamId, setMySteamId] = useState(null);
  const [parked, setParked] = useState(null);
  const [parking, setParking] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [garageMsg, setGarageMsg] = useState("");

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

  // Parked dinos + the signed-in player's Steam id, for park/restore actions
  const loadGarage = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        setParked([]);
        return;
      }
      const links = await base44.entities.SteamLink.filter({});
      setMySteamId(links[0]?.steam_id || null);
      const page = await base44.entities.ParkedDino.filter(
        { status: { $in: ["parked", "restore_pending"] } },
        { sort: "-parked_date", limit: 50 }
      );
      setParked(page.items);
    } catch {
      setParked((p) => p || []);
    }
  };

  useEffect(() => {
    loadGarage();
  }, []);

  const park = async () => {
    if (parking) return;
    setParking(true);
    setGarageMsg("");
    try {
      await base44.functions.invoke("garagePark", {});
      await loadGarage();
      setGarageMsg("Dino parked — it's now stored in your garage.");
    } catch (e) {
      setGarageMsg(e.message);
    }
    setParking(false);
  };

  const restore = async (id) => {
    setRestoring(id);
    setGarageMsg("");
    try {
      await base44.functions.invoke("garageRestore", { id });
      await loadGarage();
      setGarageMsg("Dino restored — it's back on the island.");
    } catch (e) {
      setGarageMsg(e.message);
    }
    setRestoring(null);
  };

  const loading = specimens === null;
  const active = specimens && specimens[selected];
  const myActiveParked = parked && active && parked.some((p) => p.steam_id === active.steam_id);
  const lastSeen = specimens && specimens.length > 0 ? specimens[0].last_seen : null;

  return (
    <section id="garage" className="relative">
      {/* ============ Full-bleed garage hero ============ */}
      <div className="relative h-[80vh] min-h-[560px] overflow-hidden flex items-center justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/45 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute left-0 right-0 h-32 scanline animate-scan pointer-events-none" />

        {/* Centered hero content */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-8 glass-panel-light px-4 py-2 rounded-full animate-flicker">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
              {loading
                ? "READING ISLAND DATA..."
                : `${specimens.length} DINOS PARKED ON THE ISLAND`}
            </span>
          </div>

          <h1 className="font-heading text-5xl md:text-7xl tracking-[0.1em] text-foreground leading-none mb-6 animate-flicker text-glow">
            YOUR GARAGE
          </h1>

          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed tracking-wide">
            Every dino currently on the island, recorded live from the server.
            Select a specimen below to inspect it.
          </p>
        </div>

        {/* Bottom stat bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 glass-panel">
          <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1">
                SPECIMENS
              </span>
              <span className="font-mono text-sm md:text-base text-primary tracking-wide">
                {loading ? "—" : specimens.length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1">
                LAST UPDATE
              </span>
              <span className="font-mono text-sm md:text-base text-primary tracking-wide">
                {lastSeen ? ageOf(lastSeen).toUpperCase() : "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1">
                FEED WINDOW
              </span>
              <span className="font-mono text-sm md:text-base text-primary tracking-wide">
                15 MIN
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1">
                SERVER
              </span>
              <span className="font-mono text-sm md:text-base text-primary tracking-wide">
                THE HAVEN
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Specimens ============ */}
      <div className="relative py-16 md:py-20 px-6 md:px-10">
        <div className="max-w-[1600px] mx-auto">
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
              <div className="glass-panel p-6 md:p-10 mb-10 grid md:grid-cols-2 gap-8 items-center">
                {/* Specimen visual */}
                <div className="relative aspect-square glass-panel-light flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 grid-bg opacity-30" />
                  <div
                    className="absolute w-3/4 h-3/4 rounded-full blur-3xl opacity-30 transition-colors duration-700"
                    style={{ backgroundColor: accentFor(active.steam_id) }}
                  />
                  <DinoPortrait species={active.species} className="absolute inset-0" />
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
                  <h2 className="font-heading text-3xl md:text-4xl tracking-[0.05em] text-foreground mb-1">
                    {(active.species || "Unknown species").toUpperCase()}
                  </h2>
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

                  {/* Park action: only on the signed-in player's own dino */}
                  {mySteamId && active.steam_id === mySteamId && (
                    <div className="flex items-center gap-3">
                      {myActiveParked ? (
                        <span className="font-mono text-[10px] tracking-[0.2em] px-4 py-2 border border-accent/40 text-accent rounded-sm">
                          IN GARAGE STORAGE — RESTORE BELOW
                        </span>
                      ) : (
                        <button
                          onClick={park}
                          disabled={parking}
                          className="font-mono text-[10px] tracking-[0.2em] px-4 py-2 border border-primary/40 text-primary rounded-sm hover:bg-primary/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {parking ? <Loader2 size={12} className="animate-spin" /> : <Archive size={12} />}
                          PARK THIS DINO
                        </button>
                      )}
                      <span className="font-mono text-[9px] text-muted-foreground tracking-wide">
                        Stored in your garage until you restore it.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specimen gallery */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {specimens.map((spec, i) => {
                  const accent = accentFor(spec.steam_id);
                  const { current, next } = stageFor(spec.growth || 0);
                  return (
                    <button
                      key={spec.steam_id}
                      onClick={() => setSelected(i)}
                      className={`flex-shrink-0 glass-panel-light p-4 text-left transition-all duration-300 hover:scale-105 ${
                        selected === i ? "border-primary/60 ring-1 ring-primary/30" : ""
                      }`}
                    >
                      <div
                        className="w-full aspect-video mb-3 flex items-center justify-center relative overflow-hidden dino-group"
                        style={{ backgroundColor: `${accent}11` }}
                      >
                        <DinoPortrait species={spec.species} className="absolute inset-0" />
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

          {/* ============ Parked specimens ============ */}
          <div className="mt-12">
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4 flex items-center gap-2">
              <Archive size={13} className="text-primary" /> PARKED SPECIMENS — {parked ? parked.length : "…"}
            </div>
            {garageMsg && (
              <div className="glass-panel-light px-4 py-3 mb-4 font-mono text-[10px] text-accent tracking-wide">
                {garageMsg}
              </div>
            )}
            {parked === null ? (
              <div className="glass-panel p-8 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
                <Loader2 size={14} className="animate-spin" /> READING GARAGE STORAGE...
              </div>
            ) : parked.length === 0 ? (
              <div className="glass-panel p-8 text-center font-mono text-[11px] text-muted-foreground">
                Nothing parked yet. Select your own dino above and park it to store it safely.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {parked.map((p) => (
                  <div key={p.id} className="glass-panel-light p-4">
                    <div className="w-full aspect-video mb-3 relative overflow-hidden rounded-sm">
                      <DinoPortrait species={p.species} className="absolute inset-0" />
                      <div className="absolute bottom-1 right-1 font-mono text-[8px] text-muted-foreground">
                        {p.growth ?? 0}%
                      </div>
                    </div>
                    <div className="font-mono text-xs text-foreground tracking-wide truncate mb-1">
                      {p.species || "Unknown"}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-wide mb-3">
                      PARKED {p.parked_date ? ageOf(p.parked_date).toUpperCase() : ""}
                    </div>
                    {p.status === "parked" ? (
                      <button
                        onClick={() => restore(p.id)}
                        disabled={restoring === p.id}
                        className="w-full font-mono text-[9px] tracking-[0.2em] px-3 py-2 border border-primary/40 text-primary rounded-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {restoring === p.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <RotateCcw size={11} />
                        )}{" "}
                        RESTORE
                      </button>
                    ) : (
                      <div className="w-full font-mono text-[9px] tracking-[0.2em] px-3 py-2 border border-accent/40 text-accent rounded-sm text-center">
                        AWAITING DELIVERY
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}