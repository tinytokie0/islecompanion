import React from "react";
import { Server, Users, Map as MapIcon, Clock, ShieldAlert, Loader2 } from "lucide-react";
import useRconStatus from "@/hooks/useRconStatus";

// Live server status card for the map page: pulls the server details
// straight from the game server over RCON (signed-in members only).
export default function ServerStatusCard() {
  const { data, loading, authed } = useRconStatus(60000);
  const details = data && data.success ? data.serverDetails : null;
  const error = data && !data.success ? data.error : null;

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Server size={16} className="text-primary" />
        <h3 className="font-heading text-lg font-semibold tracking-wide text-foreground">
          SERVER STATUS
        </h3>
      </div>

      {loading ? (
        <div className="py-6 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> CONNECTING TO SERVER...
        </div>
      ) : !authed ? (
        <div className="py-6 font-mono text-xs text-muted-foreground text-center leading-relaxed">
          Sign in to see live server status.
        </div>
      ) : error ? (
        <div className="py-6 flex items-start justify-center gap-2 font-mono text-xs text-destructive text-center leading-relaxed">
          <ShieldAlert size={14} className="shrink-0 mt-0.5" /> {error}
        </div>
      ) : details ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-sm text-foreground truncate">
              {details.name || "The Haven"}
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
            </span>
          </div>

          {/* Player count gauge */}
          <div className="mb-5">
            <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users size={12} /> PLAYERS
              </span>
              <span className="text-foreground">
                {details.currentPlayers ?? 0} / {details.maxPlayers ?? "?"}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${
                    details.maxPlayers
                      ? Math.min(100, ((details.currentPlayers || 0) / details.maxPlayers) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="glass-panel-light rounded-md px-3 py-2">
              <div className="text-[9px] tracking-[0.2em] text-muted-foreground mb-1 flex items-center gap-1.5">
                <MapIcon size={10} /> MAP
              </div>
              <div className="text-foreground truncate">{details.map || "Gateway"}</div>
            </div>
            <div className="glass-panel-light rounded-md px-3 py-2">
              <div className="text-[9px] tracking-[0.2em] text-muted-foreground mb-1 flex items-center gap-1.5">
                <Clock size={10} /> DAY CYCLE
              </div>
              <div className="text-foreground">
                {details.dayLengthMinutes ? `${details.dayLengthMinutes}m day` : "—"}
                {details.nightLengthMinutes ? ` / ${details.nightLengthMinutes}m night` : ""}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {details.queueEnabled && (
              <span className="font-mono text-[9px] tracking-widest px-2 py-1 rounded bg-muted text-muted-foreground">
                QUEUE
              </span>
            )}
            {details.whitelist && (
              <span className="font-mono text-[9px] tracking-widest px-2 py-1 rounded bg-muted text-muted-foreground">
                WHITELIST
              </span>
            )}
            {details.enableMutations && (
              <span className="font-mono text-[9px] tracking-widest px-2 py-1 rounded bg-primary/10 text-primary">
                MUTATIONS
              </span>
            )}
            {details.spawnAI && (
              <span className="font-mono text-[9px] tracking-widest px-2 py-1 rounded bg-emerald-400/10 text-emerald-400">
                AI DINOS
              </span>
            )}
            {!details.enableGlobalChat && (
              <span className="font-mono text-[9px] tracking-widest px-2 py-1 rounded bg-muted text-muted-foreground">
                LOCAL CHAT
              </span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}