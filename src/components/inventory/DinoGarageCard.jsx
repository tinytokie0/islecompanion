import React from "react";
import { Archive, Loader2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { dinoArtFor } from "@/lib/dinoArt";

const STATUS_STYLES = {
  parked: "text-amber-400 border-amber-400/40",
  restored: "text-emerald-400 border-emerald-400/40",
  queued: "text-amber-400 border-amber-400/40",
  sent: "text-sky-400 border-sky-400/40",
  applied: "text-emerald-400 border-emerald-400/40",
  failed: "text-destructive border-destructive/50",
};

const STATUS_LABEL = {
  parked: "IN GARAGE",
  restored: "RESTORED",
  queued: "SYNCING",
  sent: "SYNCING",
  applied: "APPLIED",
  failed: "FAILED",
};

// One parked dinosaur in the specimen garage, with a restore action.
export default function DinoGarageCard({ dino, busy, onRestore }) {
  const parked = dino.status === "parked";
  const sync = dino.server_status || "queued";

  return (
    <div className="group relative rounded-xl overflow-hidden border border-border bg-card transition-all duration-300 hover:border-[rgba(230,184,76,0.65)] hover:shadow-[0_0_28px_rgba(230,184,76,0.18)]">
      <div className="h-36 relative overflow-hidden">
        <Image
          src={dinoArtFor(dino.species)}
          alt={dino.species}
          className="w-full h-full dino-live"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <span
          className={`absolute top-2.5 right-2.5 font-mono text-[8px] tracking-[0.2em] border rounded px-2 py-0.5 bg-black/60 ${
            STATUS_STYLES[dino.status] || ""
          }`}
        >
          {STATUS_LABEL[dino.status] || dino.status.toUpperCase()}
        </span>
      </div>

      <div className="p-4">
        <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground mb-1">
          {(dino.species || "UNKNOWN").toUpperCase()} · {(dino.sex || "—").toUpperCase()}
        </div>
        <div className="font-heading text-base font-bold text-foreground mb-3 truncate">
          {dino.player_name || "Specimen"}
        </div>

        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {[
            ["GROW", dino.growth],
            ["HP", dino.health],
            ["STA", dino.stamina],
            ["HUN", dino.hunger],
            ["THR", dino.thirst],
          ].map(([label, value]) => (
            <div key={label} className="rounded bg-secondary/60 px-1.5 py-1.5 text-center">
              <div className="font-mono text-[8px] tracking-widest text-muted-foreground">{label}</div>
              <div className="font-mono text-[11px] text-foreground">{Math.round(value ?? 0)}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground mb-3">
          <span className="truncate">{dino.server_name || "EVrima"}</span>
          <span>{dino.parked_date ? new Date(dino.parked_date).toLocaleDateString() : ""}</span>
        </div>

        {sync === "failed" && dino.server_error && (
          <div className="font-mono text-[9px] text-destructive mb-2 truncate">{dino.server_error}</div>
        )}

        {parked ? (
          <button
            onClick={() => onRestore(dino)}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.2em] bg-primary text-primary-foreground rounded px-3 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Archive size={12} />}
            {busy ? "RESTORING..." : "RESTORE TO ISLAND"}
          </button>
        ) : (
          <div className="w-full text-center font-mono text-[9px] tracking-[0.2em] text-muted-foreground border border-border rounded px-3 py-2">
            BACK ON THE ISLAND
          </div>
        )}
      </div>
    </div>
  );
}