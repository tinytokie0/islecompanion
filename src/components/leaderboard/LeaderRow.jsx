import React from "react";
import Chip from "./Chip";

export default function LeaderRow({ player, rank, value, unit, progress, chips }) {
  return (
    <div className="px-5 py-3 flex items-center gap-4">
      <span className="w-7 h-7 shrink-0 rounded-sm bg-muted font-mono text-[11px] flex items-center justify-center text-muted-foreground">
        {rank}
      </span>
      <img
        src={player.avatar}
        alt=""
        className="w-9 h-9 rounded-full object-cover border border-border shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-xs text-foreground truncate">{player.name}</div>
        <div className="h-1 rounded-full bg-muted mt-1.5 w-full max-w-[240px] overflow-hidden">
          <div className="h-full bg-primary/80" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2">
        {chips.map(([v, l]) => (
          <Chip key={l}>{v} {l}</Chip>
        ))}
      </div>
      <Chip highlight>
        {value} {unit}
      </Chip>
    </div>
  );
}