import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

// Slim live strip under the navbar: island presence and map name.
// Player count = dinos with a live snapshot in the last 10 minutes.
export default function StatusStrip() {
  const [players, setPlayers] = useState(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="border-b border-border bg-[#0c0c0f]/90">
      <div className="max-w-[1500px] mx-auto px-4 md:px-6 h-10 flex items-center gap-6 font-mono text-[11px]">
        <span className="flex items-center gap-2 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Online
        </span>
        <span className="text-muted-foreground">
          {players === null ? "—" : players} on the island
        </span>
        <span className="hidden sm:flex items-center gap-2 text-muted-foreground">
          Map <span className="text-foreground">Gateway</span>
        </span>
        <Link to="/map" className="ml-auto text-primary hover:underline">
          Connection info
        </Link>
      </div>
    </div>
  );
}