import React, { useState } from "react";
import { Swords, Percent, Skull, Egg } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import PodiumCard from "@/components/leaderboard/PodiumCard";
import LeaderRow from "@/components/leaderboard/LeaderRow";
import { ISLE_PLAYERS, ISLE_TOTALS } from "@/lib/leaderboardData";

const BOARDS = [
  {
    id: "kills",
    label: "Kills",
    icon: Swords,
    unit: "KILLS",
    desc: "Most confirmed kills on the server.",
    value: (p) => p.kills,
    fmt: (v) => `${v}`,
    chips: (p) => [[`${p.deaths}`, "D"], [p.kd.toFixed(2), "K/D"], [`${p.nests}`, "N"]],
    total: (t) => [`${t.kills}`, "kills counted"],
  },
  {
    id: "kd",
    label: "K/D",
    icon: Percent,
    unit: "K/D",
    desc: "Best kill to death ratio on the server.",
    value: (p) => p.kd,
    fmt: (v) => v.toFixed(2),
    chips: (p) => [[`${p.kills}`, "K"], [`${p.deaths}`, "D"], [`${p.nests}`, "N"]],
    total: (t) => [t.kd.toFixed(2), "server K/D"],
  },
  {
    id: "deaths",
    label: "Most Deaths",
    icon: Skull,
    unit: "DEATHS",
    desc: "Players who have fallen the most on the server.",
    value: (p) => p.deaths,
    fmt: (v) => `${v}`,
    chips: (p) => [[`${p.kills}`, "K"], [p.kd.toFixed(2), "K/D"], [`${p.nests}`, "N"]],
    total: (t) => [`${t.deaths}`, "deaths counted"],
  },
  {
    id: "nesting",
    label: "Nesting",
    icon: Egg,
    unit: "NESTS",
    desc: "Most nests hatched on the server.",
    value: (p) => p.nests,
    fmt: (v) => `${v}`,
    chips: (p) => [[`${p.kills}`, "K"], [`${p.deaths}`, "D"], [p.kd.toFixed(2), "K/D"]],
    total: (t) => [`${t.nests}`, "nests hatched"],
  },
];

export default function Leaderboard() {
  const [boardId, setBoardId] = useState("kills");
  const board = BOARDS.find((b) => b.id === boardId);
  const BoardIcon = board.icon;

  const rows = [...ISLE_PLAYERS].sort((a, b) => board.value(b) - board.value(a));
  const max = rows.length ? board.value(rows[0]) : 1;
  const [total, totalLabel] = board.total(ISLE_TOTALS);

  return (
    <PageShell
      kicker="HALL OF FANGS"
      title="LEADERBOARD"
      sub="Kills, K/D, deaths and nesting across the server."
    >
      {/* Board tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {BOARDS.map((b) => {
          const Icon = b.icon;
          return (
            <button
              key={b.id}
              onClick={() => setBoardId(b.id)}
              className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] px-4 py-2 rounded-sm border transition-colors ${
                b.id === boardId
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Icon size={13} />
              {b.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Summary banner */}
      <div className="glass-panel rounded-lg p-6 flex items-center gap-4 mb-6">
        <span className="w-11 h-11 rounded-md border border-primary/40 bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <BoardIcon size={20} />
        </span>
        <div>
          <div className="font-heading text-lg tracking-[0.08em] text-foreground">
            {board.label}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">{board.desc}</div>
        </div>
        <div className="ml-auto text-right">
          <span className="font-heading text-4xl text-accent text-glow">{total}</span>
          <span className="font-mono text-[10px] text-muted-foreground ml-2">{totalLabel}</span>
        </div>
      </div>

      {/* Podium */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {rows.slice(0, 3).map((p, i) => (
          <PodiumCard
            key={p.name}
            player={p}
            rank={i + 1}
            value={board.fmt(board.value(p))}
            unit={board.unit}
            max={max}
            chips={board.chips(p)}
          />
        ))}
      </div>

      {/* Full table */}
      <div className="glass-panel rounded-lg divide-y divide-border/60">
        {rows.slice(3).map((p, i) => (
          <LeaderRow
            key={p.name}
            player={p}
            rank={i + 4}
            value={board.fmt(board.value(p))}
            unit={board.unit}
            progress={Math.max(4, (board.value(p) / max) * 100)}
            chips={board.chips(p)}
          />
        ))}
      </div>
    </PageShell>
  );
}