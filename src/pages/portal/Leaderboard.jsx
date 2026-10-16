import React, { useState } from "react";
import { Loader2, Trophy, Egg, MapPin } from "lucide-react";
import useLiveDinos from "@/hooks/useLiveDinos";
import { NESTING_GUIDE } from "@/lib/portalData";
import { stageFor } from "@/lib/growthStages";

// Full playable roster: every species tab is always shown, like the reference
// board, even when no one is currently playing that species.
const ROSTER = [
  "Allosaurus", "Austroraptor", "Beipiaosaurus", "Carnotaurus", "Ceratosaurus",
  "Deinosuchus", "Diabloceratops", "Dilophosaurus", "Dryosaurus", "Gallimimus",
  "Herrerasaurus", "Hypsilophodon", "Kentrosaurus", "Maiasaura", "Omniraptor",
  "Pachycephalosaurus", "Pteranodon", "Stegosaurus", "Tenontosaurus",
  "Triceratops", "Troodon", "Tyrannosaurus",
];

const TABS = {
  kills: { label: "Kills", sort: "-kills", unit: "KILLS", stat: "Most credited kills on the server. Kills are a proximity estimate from the feed." },
  kd: { label: "K/D", sort: "-kills", unit: "K/D", stat: "Kill/death ratio across the island." },
  deaths: { label: "Most Deaths", sort: "-deaths", unit: "DEATHS", stat: "Most respawns recorded by the island feed." },
  nesting: { label: "Nesting", stat: "Nesting events aren't reported by the island feed yet." },
  carnivore: { label: "Carnivore hunter", sort: "-kills_carnivore", unit: "KILLS", stat: "Most credited kills of carnivore prey." },
  herbivore: { label: "Herbivore hunter", sort: "-kills_herbivore", unit: "KILLS", stat: "Most credited kills of herbivore prey." },
  omnivore: { label: "Omnivore hunter", sort: "-kills_omnivore", unit: "KILLS", stat: "Most credited kills of omnivore prey." },
  growth: { label: "Growth", sort: "-growth", unit: "GROWTH", stat: "Highest growth on the island right now." },
  life: { label: "Longest Life", sort: "-best_life_minutes", unit: "LIFE", stat: "Longest tracked life on the island." },
};

const fmtRatio = (kills, deaths) => {
  const k = kills || 0;
  const d = deaths || 0;
  return d > 0 ? (k / d).toFixed(2) : `${k}`;
};

const fmtLife = (min) => {
  const m = Math.round(min || 0);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

export default function Leaderboard() {
  const [tab, setTab] = useState("kills");
  // Real board: every dino seen on the island in the last 24 hours
  const { dinos, loading } = useLiveDinos({
    windowMinutes: 24 * 60,
    refreshMs: 60000,
    sort: TABS[tab].sort || "-growth",
  });

  const [species, setSpecies] = useState("All");
  const now = Date.now();
  const liveLife = (r) => Math.max(
    r.best_life_minutes || 0,
    r.life_started_at ? (now - Date.parse(r.life_started_at)) / 60000 : 0
  );

  let rows = dinos || [];
  if (tab === "kd") rows = [...rows].sort((a, b) => (b.kills || 0) / Math.max(b.deaths || 0, 1) - (a.kills || 0) / Math.max(a.deaths || 0, 1));
  if (tab === "life") rows = [...rows].sort((a, b) => liveLife(b) - liveLife(a));
  const filtered = species === "All" ? rows : rows.filter((r) => r.species === species);

  const valueFor = (r) => {
    switch (tab) {
      case "kills": return `${r.kills || 0}`;
      case "kd": return fmtRatio(r.kills, r.deaths);
      case "deaths": return `${r.deaths || 0}`;
      case "nesting": return "0";
      case "carnivore": return `${r.kills_carnivore || 0}`;
      case "herbivore": return `${r.kills_herbivore || 0}`;
      case "omnivore": return `${r.kills_omnivore || 0}`;
      case "growth": return `${Math.round(r.growth ?? 0)}`;
      default: return fmtLife(liveLife(r));
    }
  };
  const headValue = filtered.length ? valueFor(filtered[0]) : "0";
  const unitFor = tab === "growth" ? "GROWTH" : tab === "life" ? "LIFE" : TABS[tab].unit;

  return (
    <section className="px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Kills, K/D, deaths and nesting across the server.
          </p>
        </div>

        {/* Species filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSpecies("All")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              species === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            All dinos
          </button>
          {ROSTER.map((s) => (
            <button
              key={s}
              onClick={() => setSpecies(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                s === species
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Metric tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.entries(TABS).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`font-heading text-sm font-bold tracking-wide px-5 py-2 rounded-md border transition-colors ${
                tab === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-10 flex items-center justify-center gap-3 text-sm text-muted-foreground mb-6">
            <Loader2 size={14} className="animate-spin" /> Reading island data...
          </div>
        ) : tab === "nesting" ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center mb-10">
            <Egg size={22} className="mx-auto mb-3 text-muted-foreground" />
            <div className="font-heading text-xl font-bold text-foreground mb-2">No nesting events recorded yet</div>
            <p className="text-sm text-muted-foreground">
              Nesting isn't reported by the island feed. This board fills in as soon as nesting events arrive.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center mb-6">
            <Trophy size={22} className="mx-auto mb-3 text-muted-foreground" />
            <div className="font-heading text-xl font-bold text-foreground mb-2">No dinos on the island</div>
            <p className="text-sm text-muted-foreground">Players appear here as soon as they spawn in.</p>
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className="rounded-xl border border-border bg-card p-6 mb-8">
              <div className="font-heading text-2xl font-bold text-foreground">{TABS[tab].label}</div>
              <div className="text-sm text-muted-foreground mb-4">{TABS[tab].stat}</div>
              <div className="font-heading text-5xl font-bold text-primary">
                {headValue}
                <span className="text-sm text-muted-foreground font-medium ml-2">
                  {tab === "kills" || tab === "carnivore" || tab === "herbivore" || tab === "omnivore"
                    ? "kills counted"
                    : tab === "deaths"
                    ? "deaths counted"
                    : tab === "kd"
                    ? "top K/D"
                    : "counted"}
                </span>
              </div>
            </div>

            {/* Ranked list */}
            <div className="rounded-xl border border-border bg-card divide-y divide-border/60 overflow-hidden mb-10">
              {filtered.map((row, i) => {
                const podium = i < 3 ? ["#e6b84c", "#cbd5e1", "#c98a5e"][i] : null;
                return (
                  <div key={row.steam_id} className="px-5 py-4 flex items-center gap-4">
                    {podium ? (
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md font-heading font-bold text-sm text-black shrink-0"
                        style={{ backgroundColor: podium }}
                      >
                        {i + 1}
                      </span>
                    ) : (
                      <span className="font-heading text-sm font-semibold w-8 text-muted-foreground text-center shrink-0">
                        {i + 1}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {row.player_name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {row.species || "Unknown"} · {stageFor(row.growth || 0).current.name}
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-secondary w-20 hidden sm:block overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${row.growth ?? 0}%` }} />
                    </div>
                    <span className="font-mono text-sm text-primary font-semibold shrink-0 text-right">
                      {valueFor(row)}
                      <span className="text-[9px] text-muted-foreground ml-1">{unitFor}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Nesting guide */}
        <div className="mb-4">
          <div className="flex items-center gap-2.5 mb-5">
            <Egg size={15} className="text-primary" />
            <span className="font-heading text-lg font-bold text-foreground">Nesting by creature type</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {NESTING_GUIDE.map((g) => (
              <div key={g.species} className="rounded-xl border border-border bg-card p-5">
                <div className="font-heading text-base font-bold text-foreground mb-3">{g.species}</div>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground leading-relaxed">
                  <span><span className="text-primary font-medium">Clutch:</span> {g.clutch}</span>
                  <span><span className="text-primary font-medium">Nest:</span> {g.nest}</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-primary shrink-0" />
                    {g.grounds}
                  </span>
                  <span><span className="text-primary font-medium">Care:</span> {g.care}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}