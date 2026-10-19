import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import useArkaniStatus from "./useArkaniStatus";
import useRconStatus from "./useRconStatus";
import useGamehostStatus from "./useGamehostStatus";

// Combined live Isle server status for any surface:
// 1. Direct RCON server details when reachable (signed-in members)
// 2. Game Host Bros panel status when signed in
// 3. Arkanis server status when signed in
// 4. Fallback: dinos with a live snapshot in the last 10 minutes (public)
export default function useServerLive() {
  const rcon = useRconStatus();
  const arkanis = useArkaniStatus();
  const gamehost = useGamehostStatus();
  const [fallbackPlayers, setFallbackPlayers] = useState(null);

  // The panel knows online/offline but not the player count; the live-dino
  // count stays the players source.
  const panelLive = gamehost.authed && gamehost.data?.configured;

  useEffect(() => {
    if (panelLive) return; // panel status wins; keep live-dino count for players
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
  }, [panelLive]);

  const details = rcon.authed && rcon.data?.success ? rcon.data.serverDetails : null;
  const rconLive = details && details.currentPlayers !== null && details.currentPlayers !== undefined;

  const online = rconLive
    ? true
    : panelLive
      ? gamehost.data?.online === true
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
  const serverName = details?.name || gamehost.data?.serverName || "The Haven";
  const loading = rcon.loading || arkanis.loading || gamehost.loading;

  return { online, players, maxPlayers, map, serverName, loading };
}