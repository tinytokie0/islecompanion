import React from "react";
import { Activity, Loader2 } from "lucide-react";
import useLiveDinos from "@/hooks/useLiveDinos";
import DinoPortrait from "@/components/DinoPortrait";

// Real island data: dinos currently on the island, straight from the live
// server feed. Used on pages that have no fake demo records.
export default function LiveIslandStrip() {
  const { dinos, loading } = useLiveDinos({ windowMinutes: 15, refreshMs: 30000, limit: 12 });

  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4 flex items-center gap-2">
        <Activity size={13} className="text-primary" /> LIVE ON THE ISLAND
      </div>
      {loading ? (
        <div className="py-4 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> READING ISLAND DATA...
        </div>
      ) : !dinos || dinos.length === 0 ? (
        <div className="py-4 font-mono text-[11px] text-muted-foreground text-center">
          No dinos on the island right now.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {dinos.map((d) => (
            <div key={d.steam_id} className="flex-shrink-0 w-36 glass-panel-light p-3">
              <div className="relative aspect-video rounded-sm overflow-hidden mb-2">
                <DinoPortrait species={d.species} className="absolute inset-0" />
              </div>
              <div className="font-mono text-[10px] text-foreground truncate">
                {d.species || "Unknown"}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground truncate">
                {d.player_name || "Unknown"} — {d.growth ?? 0}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}