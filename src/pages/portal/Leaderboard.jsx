import React, { useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import useLiveDinos from "@/hooks/useLiveDinos";
import { NESTING_GUIDE } from "@/lib/portalData";
import { stageFor } from "@/lib/growthStages";
import { Egg, MapPin } from "lucide-react";

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
    <PageShell
      icon={Trophy}
      title="Leaderboard"
      sub="Growth standings across the server, updated every five minutes."
    >
      {/* Species filter pills */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
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
          <p className="text-sm text-muted-foreground">
            Players appear here as soon as they spawn in.
          </p>
        </div>
      ) : (
        <>
          {/* Summary card */}
          <div className="rounded-xl border border-border bg-card flex items-center gap-4 p-5 mb-6">
            <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Trophy size={17} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-heading text-lg font-bold text-foreground">Growth standings</div>
              <div className="text-sm text-muted-foreground">Top growth on the island right now.</div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-heading text-4xl font-bold text-primary">
                {Math.round(filtered[0]?.growth ?? 0)}%
              </span>
              <span className="text-xs text-muted-foreground ml-2">top growth</span>
            </div>
          </div>

          {/* Podium */}
          <div className="grid sm:grid-cols-3 gap-5 mb-6">
            {filtered.slice(0, 3).map((row, i) => {
              const rankBg = ["#e6b84c", "#cbd5e1", "#c98a5e"][i];
              return (
                <div
                  key={row.steam_id}
                  className="rounded-xl border border-border bg-card p-7 text-center"
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md font-heading font-bold text-sm text-black mb-3"
                    style={{ backgroundColor: rankBg }}
                  >
                    {i + 1}
                  </span>
                  <div className="font-heading text-xl font-bold text-foreground mb-0.5">
                    {row.player_name || "Unknown"}
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">{row.species || "Unknown"}</div>
                  <div className="font-heading text-3xl font-bold text-primary mb-1">
                    {Math.round(row.growth ?? 0)}
                    <span className="text-sm text-muted-foreground font-semibold ml-1.5">GROWTH</span>
                  </div>
                  <div className="h-1 rounded-full bg-secondary overflow-hidden mb-4">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${row.growth ?? 0}%` }} />
                  </div>
                  <div className="flex justify-center gap-2 text-xs">
                    <span className="rounded-full bg-secondary/80 px-3 py-1 text-muted-foreground">
                      {stageFor(row.growth || 0).current.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full list */}
          <div className="rounded-xl border border-border bg-card divide-y divide-border/60 overflow-hidden">
            {filtered.map((row, i) => (
              <div key={row.steam_id} className="px-5 py-3.5 flex items-center gap-4">
                <span className="font-heading text-sm font-semibold w-8 text-muted-foreground">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {row.player_name || "Unknown"}
                  </div>
                  <div className="h-1 rounded-full bg-secondary mt-1.5 max-w-[220px] overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${row.growth ?? 0}%` }} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground hidden lg:block">
                  {row.species || "Unknown"}
                </span>
                <span className="rounded-full bg-primary/15 text-primary text-xs font-semibold px-3 py-1">
                  {Math.round(row.growth ?? 0)}% growth
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Nesting guide */}
      <div className="mt-10">
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
    </PageShell>
  );
}