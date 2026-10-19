import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import useArkaniStatus from "./useArkaniStatus";
import useRconStatus from "./useRconStatus";

// Combined live Isle server status for any surface:
// 1. Direct RCON server details when reachable (signed-in members)
// 2. Arkanis server status when signed in
// 3. Fallback: dinos with a live snapshot in the last 10 minutes (public)
export default function useServerLive() {
  const rcon = useRconStatus();
  const arkanis = useArkaniStatus();
  const [fallbackPlayers, setFallbackPlayers] = useState(null);

  useEffect(() => {
    if (arkanis.authed) return; // live status wins when available
    const load = async () => {
      try {
        const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        setFallbackPlayers(await base44.entities.LiveDino.count({ last_seen: { $gte: since } }));
      } catch {
        setFallbackPlayers(null);
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [arkanis.authed]);

  const details = rcon.authed && rcon.data?.success ? rcon.data.serverDetails : null;
  const rconLive = details && details.currentPlayers !== null && details.currentPlayers !== undefined;

  const online = rconLive
    ? true
    : arkanis.authed && arkanis.data?.configured
      ? arkanis.data.status?.online === true
      : true;
  const players = rconLive
    ? details.currentPlayers
    : arkanis.authed && arkanis.data?.configured && arkanis.data.status?.players != null
      ? arkanis.data.status.players
      : fallbackPlayers;
  const maxPlayers = rconLive ? details.maxPlayers : null;
  const map = details?.map || "Gateway";
  const serverName = details?.name || "The Haven";
  const loading = rcon.loading || arkanis.loading;

  return { online, players, maxPlayers, map, serverName, loading };
}