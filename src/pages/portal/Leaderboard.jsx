import React, { useState } from "react";
import { Loader2, Trophy, Egg, MapPin } from "lucide-react";
import useLiveDinos from "@/hooks/useLiveDinos";
import { NESTING_GUIDE } from "@/lib/portalData";
import { stageFor } from "@/lib/growthStages";

export default function Leaderboard() {
  // Real board: every dino seen on the island in the last 24 hours, ranked by growth
  const { dinos, loading } = useLiveDinos({
    windowMinutes: 24 * 60,
    refreshMs: 60000,
    sort: "-growth",
  });
  const rows = dinos || [];
  const [species, setSpecies] = useState("All");
  const speciesList = ["All", ...Array.from(new Set(rows.map((r) => r.species).filter(Boolean)))];
  const filtered = species === "All" ? rows : rows.filter((r) => r.species === species);

  return (
    <section className="px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Growth standings across the server, updated every five minutes.
          </p>
        </div>

        {/* Species filter pills */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {speciesList.map((s) => (
              <button
                key={s}
                onClick={() => setSpecies(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  s === species
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "All" ? "All dinos" : s}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-10 flex items-center justify-center gap-3 text-sm text-muted-foreground mb-6">
            <Loader2 size={14} className="animate-spin" /> Reading island data...
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
              <div className="font-heading text-2xl font-bold text-foreground">Growth</div>
              <div className="text-sm text-muted-foreground mb-4">
                Highest growth on the island right now.
              </div>
              <div className="font-heading text-5xl font-bold text-primary">
                {Math.round(filtered[0]?.growth ?? 0)}%
                <span className="text-sm text-muted-foreground font-medium ml-2">counted</span>
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
                    <span className="font-mono text-sm text-primary font-semibold shrink-0">
                      {Math.round(row.growth ?? 0)}
                      <span className="text-[9px] text-muted-foreground ml-1">GROWTH</span>
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