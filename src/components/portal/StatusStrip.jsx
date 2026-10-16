import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import useArkaniStatus from "@/hooks/useArkaniStatus";
import useRconStatus from "@/hooks/useRconStatus";

// Slim live strip under the navbar, fed by real Isle server data:
// 1. Direct RCON server details (live players, map, name) when reachable
// 2. Arkanis server status when signed in
// 3. Fallback: dinos with a live snapshot in the last 10 minutes
export default function StatusStrip() {
  const rcon = useRconStatus();
  const { data, loading, authed } = useArkaniStatus();
  const [players, setPlayers] = useState(null);

  useEffect(() => {
    if (authed) return; // live status wins when available
    const load = async () => {
      try {
        const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        setPlayers(await base44.entities.LiveDino.count({ last_seen: { $gte: since } }));
      } catch {
        setPlayers(null);
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [authed]);

  const details = rcon.authed && rcon.data?.success ? rcon.data.serverDetails : null;
  const rconLive = details && details.currentPlayers !== null && details.currentPlayers !== undefined;

  const online = rconLive
    ? true
    : authed && data?.configured
      ? data.status?.online === true
      : true;
  const shown = rconLive
    ? details.currentPlayers
    : authed && data?.configured && data.status?.players != null
      ? data.status.players
      : players;
  const maxPlayers = rconLive ? details.maxPlayers : null;
  const map = details?.map || "Gateway";

  return (
    <div className="border-b border-border bg-[#0c0c0f]/90">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 h-10 flex items-center gap-6 font-mono text-[11px]">
        <span className={`flex items-center gap-2 ${online ? "text-emerald-400" : "text-red-400"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-400" : "bg-red-400"}`} />
          {loading && !rconLive ? "…" : online ? "Online" : "Offline"}
        </span>
        <span className="text-muted-foreground">
          {shown === null || shown === undefined ? "—" : shown}
          {maxPlayers ? ` / ${maxPlayers}` : ""} on the island
        </span>
        <span className="hidden sm:flex items-center gap-2 text-muted-foreground">
          Map <span className="text-foreground">{map}</span>
        </span>
        <Link to="/map" className="ml-auto text-primary hover:underline">
          Connection info
        </Link>
      </div>
    </div>
  );
}