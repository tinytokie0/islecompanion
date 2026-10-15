import React, { useState } from "react";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { BOARDS } from "@/lib/portalData";

const TABS = [
  { id: "growth", label: "GROWTH" },
  { id: "kills", label: "KILLS" },
  { id: "shards", label: "SHARDS" },
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
              </div>
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
            <span className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] hidden sm:block">
              {row.dino.toUpperCase()}
            </span>
            <span className={`font-mono text-xs w-24 text-right ${i < 3 ? "" : "text-muted-foreground"}`} style={i < 3 ? { color: RANK_COLORS[i] } : {}}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}