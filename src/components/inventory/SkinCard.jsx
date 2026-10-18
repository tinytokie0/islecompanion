import React from "react";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";

const SYNC_LABEL = {
  queued: "SYNCING",
  sent: "SYNCING",
  applied: "APPLIED IN-GAME",
  failed: "SYNC FAILED",
};

const SYNC_STYLES = {
  queued: "text-amber-400 border-amber-400/40",
  sent: "text-sky-400 border-sky-400/40",
  applied: "text-emerald-400 border-emerald-400/40",
  failed: "text-destructive border-destructive/50",
};

// One shop skin the player owns, with an equip action.
export default function SkinCard({ skin, busy, onEquip }) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden border bg-card p-4 transition-all duration-300 ${
        skin.equipped
          ? "border-primary/60 shadow-[0_0_24px_rgba(255,46,123,0.18)]"
          : "border-border hover:border-[rgba(230,184,76,0.65)]"
      }`}
    >
      {skin.equipped && (
        <span className="absolute top-3 right-3 font-mono text-[8px] tracking-[0.2em] border border-primary/60 text-primary rounded px-2 py-0.5 flex items-center gap-1">
          <Sparkles size={9} /> EQUIPPED
        </span>
      )}

      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-9 h-9 rounded-lg border border-white/20 shrink-0"
          style={{ background: skin.color, boxShadow: `0 0 14px ${skin.color}55` }}
        />
        <div className="min-w-0">
          <div className="font-heading text-sm font-bold text-foreground truncate">
            {skin.name}
          </div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
            {(skin.pattern || "").toUpperCase()}
          </div>
        </div>
      </div>

      <span
        className={`inline-block font-mono text-[8px] tracking-[0.2em] border rounded px-2 py-0.5 mb-3 ${
          SYNC_STYLES[skin.server_status] || SYNC_STYLES.queued
        }`}
      >
        {SYNC_LABEL[skin.server_status] || "SYNCING"}
      </span>
      {skin.server_status === "failed" && skin.server_error && (
        <div className="font-mono text-[9px] text-destructive mb-3 truncate">{skin.server_error}</div>
      )}

      {skin.equipped ? (
        <div className="w-full text-center font-mono text-[9px] tracking-[0.2em] text-emerald-400 border border-emerald-400/40 rounded px-3 py-2 flex items-center justify-center gap-1.5">
          <CheckCircle2 size={11} /> ACTIVE ON YOUR DINO
        </div>
      ) : (
        <button
          onClick={() => onEquip(skin)}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.2em] bg-primary text-primary-foreground rounded px-3 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : null}
          {busy ? "EQUIPPING..." : "EQUIP"}
        </button>
      )}
    </div>
  );
}