import React from "react";
import useServerLive from "@/hooks/useServerLive";

// Slim live strip under the navbar, fed by real Isle server data.
export default function StatusStrip() {
  const { online, players, maxPlayers, map, loading } = useServerLive();

  const shown = loading ? null : players;

  return (
    <div className="border-b border-border bg-[#0c0c0f]/90">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 h-10 flex items-center gap-3 sm:gap-6 font-mono text-[11px] overflow-hidden">
        <span className={`flex items-center gap-2 ${online ? "text-emerald-400" : "text-red-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-400" : "bg-red-400"}`} />
          {loading ? "…" : online ? "Online" : "Offline"}
        </span>
        <span className="text-muted-foreground truncate">
          {shown === null || shown === undefined ? "—" : shown}
          {maxPlayers ? ` / ${maxPlayers}` : ""}
          <span className="hidden sm:inline"> on the island</span>
        </span>
        <span className="hidden sm:flex items-center gap-2 text-muted-foreground">
          Map <span className="text-foreground">{map}</span>
        </span>
      </div>
    </div>
  );
}