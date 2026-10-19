import React from "react";
import { Server, Users, Map as MapIcon, ShieldAlert, Loader2 } from "lucide-react";
import useArkaniStatus from "@/hooks/useArkaniStatus";

// Live server status card for the map page, pulled from the Arkanis API
// (signed-in members only): online state, player count and who is on.
// Species names come from the game's BP asset path, e.g.
// "/Game/.../Tyrannosaurus/BP_Tyrannosaurus.BP_Tyrannosaurus_C".
function speciesFromPath(path) {
  const m = String(path || "").match(/\/Dinosaurs\/([A-Za-z]+)\//);
  return m ? m[1] : null;
}

export default function ServerStatusCard() {
  const { data, loading, authed } = useArkaniStatus(60000);
  const details = data && data.configured ? data.status || {} : null;
  const playerList = (details?.playerList || []).slice(0, 8);

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
      ) : !details ? (
        <div className="py-6 flex items-start justify-center gap-2 font-mono text-xs text-destructive text-center leading-relaxed">
          <ShieldAlert size={14} className="shrink-0 mt-0.5" /> Server status unavailable.
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-sm text-foreground truncate">
              {data.server?.name || "The Haven"}
            </div>
            <span
              className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest shrink-0 ${
                details.online ? "text-emerald-400" : "text-red-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  details.online ? "bg-emerald-400" : "bg-red-400"
                }`}
              />{" "}
              {details.online ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          {/* Player count */}
          <div className="mb-5">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users size={12} /> PLAYERS
              </span>
              <span className="text-foreground">{details.players ?? 0} on the island</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 font-mono text-[11px]">
            <div className="glass-panel-light rounded-md px-3 py-2">
              <div className="text-[9px] tracking-[0.2em] text-muted-foreground mb-1 flex items-center gap-1.5">
                <MapIcon size={10} /> MAP
              </div>
              <div className="text-foreground">Gateway (Evrima)</div>
            </div>
          </div>

          {/* Who is online right now */}
          {playerList.length > 0 && (
            <div className="mt-4">
              <div className="text-[9px] tracking-[0.2em] text-muted-foreground mb-2">
                ON THE ISLAND
              </div>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto hide-scrollbar pr-1">
                {playerList.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-foreground truncate text-[11px]">{p.name}</span>
                    <span className="text-muted-foreground text-[10px] shrink-0">
                      {speciesFromPath(p.dinosaur) || "—"}
                      {p.growth ? ` · ${p.growth}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}