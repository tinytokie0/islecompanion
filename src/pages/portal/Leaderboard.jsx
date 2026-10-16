import React from "react";
import { Trophy, Crown, Medal, Award, Loader2 } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import useLiveDinos from "@/hooks/useLiveDinos";
import { NESTING_GUIDE } from "@/lib/portalData";
import { stageFor } from "@/lib/growthStages";
import { Egg, MapPin } from "lucide-react";

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["#e6b84c", "#c98a5e", "#a78bfa"];

export default function Leaderboard() {
  // Real board: every dino seen on the island in the last 24 hours, ranked by growth
  const { dinos, loading } = useLiveDinos({
    windowMinutes: 24 * 60,
    refreshMs: 60000,
    sort: "-growth",
  });
  const rows = dinos || [];

  return (
    <PageShell
      kicker="HALL OF FANGS"
      title="LEADERBOARD"
      sub="Growth standings from live island data, updated every five minutes."
    >
      {/* Podium */}
      {loading ? (
        <div className="glass-panel p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground mb-6">
          <Loader2 size={14} className="animate-spin" /> READING ISLAND DATA...
        </div>
      ) : rows.length === 0 ? (
        <div className="glass-panel p-10 text-center mb-6">
          <Trophy size={22} className="mx-auto mb-3 text-muted-foreground" />
          <div className="font-heading text-xl text-foreground mb-2">No dinos on the island</div>
          <p className="font-mono text-xs text-muted-foreground">
            Players appear here as soon as they spawn in.
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {rows.slice(0, 3).map((row, i) => {
              const Icon = RANK_ICONS[i];
              return (
                <div
                  key={row.steam_id}
                  className={`glass-panel rounded-lg p-6 text-center ${i === 0 ? "sm:order-2 border-accent/40" : i === 1 ? "sm:order-1" : "sm:order-3"}`}
                >
                  <Icon size={22} style={{ color: RANK_COLORS[i] }} className="mx-auto mb-3" />
                  <div className="font-heading text-xl tracking-[0.08em] text-foreground">
                    {row.player_name || "Unknown"}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] mb-2">
                    {(row.species || "UNKNOWN").toUpperCase()}
                  </div>
                  <div className="font-mono text-lg" style={{ color: RANK_COLORS[i] }}>
                    {row.growth ?? 0}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="glass-panel rounded-lg divide-y divide-border/60">
            {rows.map((row, i) => {
              const { current, next } = stageFor(row.growth || 0);
              return (
                <div key={row.steam_id} className="px-5 py-3.5 flex items-center gap-4">
                  <span
                    className={`font-mono text-xs w-8 ${i < 3 ? "" : "text-muted-foreground"}`}
                    style={i < 3 ? { color: RANK_COLORS[i] } : {}}
                  >
                    #{i + 1}
                  </span>
                  <span className="font-mono text-xs text-foreground flex-1 truncate">
                    {row.player_name || "Unknown"}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] hidden lg:block w-28">
                    {current.name}
                    {next ? ` → ${next.name}` : ""}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] hidden sm:block flex-1">
                    {(row.species || "Unknown").toUpperCase()}
                  </span>
                  <span
                    className={`font-mono text-xs w-24 text-right ${i < 3 ? "" : "text-muted-foreground"}`}
                    style={i < 3 ? { color: RANK_COLORS[i] } : {}}
                  >
                    {row.growth ?? 0}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Creature-type nesting guide */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Egg size={14} className="text-accent" />
          <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
            NESTING BY CREATURE TYPE
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NESTING_GUIDE.map((g) => (
            <div key={g.species} className="glass-panel rounded-lg p-5">
              <div className="font-heading text-base tracking-[0.05em] text-foreground mb-3">
                {g.species}
              </div>
              <div className="flex flex-col gap-1.5 font-mono text-[10px] text-muted-foreground leading-relaxed">
                <span><span className="text-accent">CLUTCH:</span> {g.clutch}</span>
                <span><span className="text-accent">NEST:</span> {g.nest}</span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={10} className="text-accent shrink-0" />
                  {g.grounds}
                </span>
                <span><span className="text-accent">CARE:</span> {g.care}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}