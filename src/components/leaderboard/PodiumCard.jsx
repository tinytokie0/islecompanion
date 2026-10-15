import React from "react";
import Chip from "./Chip";

const BADGES = [
  "bg-accent text-accent-foreground",
  "bg-muted-foreground/50 text-foreground",
  "bg-primary text-primary-foreground",
];

export default function PodiumCard({ player, rank, value, unit, max, chips }) {
  return (
    <div className={`glass-panel rounded-lg p-6 text-center ${rank === 1 ? "border-accent/40" : ""}`}>
      <div
        className={`w-8 h-8 mx-auto mb-3 rounded-md font-mono text-sm font-bold flex items-center justify-center ${BADGES[rank - 1]}`}
      >
        {rank}
      </div>
      <img
        src={player.avatar}
        alt={player.name}
        className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-border"
      />
      <div className="font-heading text-lg tracking-[0.05em] text-foreground truncate" title={player.name}>
        {player.name}
      </div>
      <div className="mt-2 flex items-baseline justify-center gap-2">
        <span className="font-heading text-4xl text-accent">{value}</span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted mt-4 mb-4 overflow-hidden max-w-[220px] mx-auto">
        <div className="h-full bg-primary" style={{ width: `${Math.max(6, (value / max) * 100)}%` }} />
      </div>
      <div className="flex justify-center gap-2 flex-wrap">
        {chips.map(([v, l]) => (
          <Chip key={l}>{v} {l}</Chip>
        ))}
      </div>
    </div>
  );
}