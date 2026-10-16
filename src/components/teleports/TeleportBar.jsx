import React, { useState } from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useWallet from "@/hooks/useWallet";

// Sticky action bar for the selected waygate: shows the destination, the price
// and a single Teleport button that hits the secure backend function.
export default function TeleportBar({ gate, onUsed }) {
  const { wallet, refresh } = useWallet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const balance = wallet?.balance ?? 0;
  const afford = balance >= gate.price;

  const teleport = async () => {
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("waygateUse", { waygate_id: gate.id });
      setDone(true);
      refresh();
      onUsed?.();
    } catch (e) {
      setError(e.message || "Teleport failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sticky bottom-4 z-20 mt-8 flex justify-center">
      <div className="glass-panel rounded-xl px-5 py-3.5 flex flex-wrap items-center gap-4 shadow-lg shadow-black/40 max-w-full">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap size={16} />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Selected destination
            </div>
            <div className="font-heading text-base font-bold text-foreground truncate">
              {gate.name}
              <span className="text-xs text-muted-foreground font-medium ml-2">
                {gate.price.toLocaleString()} HT
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-1.5 text-xs text-destructive">
            {error}
          </div>
        )}

        {done ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-sm font-semibold px-4 py-2">
            <CheckCircle2 size={15} /> Request queued for delivery
          </span>
        ) : (
          <button
            onClick={teleport}
            disabled={busy || !afford}
            className={`rounded-md text-sm font-semibold px-5 py-2 transition-opacity ${
              afford && !busy
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-primary/40 text-primary-foreground/70 cursor-not-allowed"
            }`}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Charging...
              </span>
            ) : afford ? (
              "Teleport now"
            ) : (
              "Not enough HT"
            )}
          </button>
        )}
      </div>
    </div>
  );
}