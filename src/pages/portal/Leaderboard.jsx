import React, { useState } from "react";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { BOARDS, NESTING_GUIDE } from "@/lib/portalData";
import { Egg, MapPin } from "lucide-react";

const TABS = [
  { id: "growth", label: "GROWTH" },
  { id: "kills", label: "KILLS" },
  { id: "shards", label: "SHARDS" },
  { id: "nesting", label: "NESTING" },
];

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["#e6b84c", "#c98a5e", "#a78bfa"];

export default function Leaderboard() {
  const [board, setBoard] = useState("growth");
  const rows = BOARDS[board];

  return (
    <PageShell
      kicker="HALL OF FANGS"
      title="LEADERBOARD"
      sub="The fiercest, fastest and wealthiest players on the island this season."
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setBoard(t.id)}
            className={`font-mono text-[10px] tracking-[0.2em] px-5 py-2 rounded-sm border transition-colors ${
              board === t.id
                ? "bg-primary text-primary-foreground border-primary"
                : "text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {rows.slice(0, 3).map((row, i) => {
          const Icon = RANK_ICONS[i];
          return (
            <div
              key={row.name}
              className={`glass-panel rounded-lg p-6 text-center ${i === 0 ? "sm:order-2 border-accent/40" : i === 1 ? "sm:order-1" : "sm:order-3"}`}
            >
              <Icon size={22} style={{ color: RANK_COLORS[i] }} className="mx-auto mb-3" />
              <div className="font-heading text-xl tracking-[0.08em] text-foreground">{row.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] mb-2">
                {row.dino.toUpperCase()}
              </div>
              <div className="font-mono text-lg" style={{ color: RANK_COLORS[i] }}>
                {row.value}
                {board === "nesting" && " NESTS"}
              </div>
              {board === "nesting" && row.nest && (
                <div className="font-mono text-[9px] text-muted-foreground tracking-[0.1em] mt-2 leading-relaxed">
                  {row.nest.toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="glass-panel rounded-lg divide-y divide-border/60">
        {rows.map((row, i) => (
          <div key={row.name} className="px-5 py-3.5 flex items-center gap-4">
            <span
              className={`font-mono text-xs w-8 ${i < 3 ? "" : "text-muted-foreground"}`}
              style={i < 3 ? { color: RANK_COLORS[i] } : {}}
            >
              #{i + 1}
            </span>
            <span className="font-mono text-xs text-foreground flex-1">{row.name}</span>
            {board === "nesting" && row.nest && (
              <span className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] flex-1 hidden lg:block">
                {row.nest.toUpperCase()}
              </span>
            )}
            <span className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] hidden sm:block">
              {row.dino.toUpperCase()}
            </span>
            <span className={`font-mono text-xs w-24 text-right ${i < 3 ? "" : "text-muted-foreground"}`} style={i < 3 ? { color: RANK_COLORS[i] } : {}}>
              {row.value}
              {board === "nesting" && " NESTS"}
            </span>
          </div>
        ))}
      </div>

      {/* Creature-type nesting guide */}
      {board === "nesting" && (
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
      )}
    </PageShell>
  );
}