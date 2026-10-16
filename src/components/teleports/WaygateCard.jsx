import React, { useState } from "react";
import { Zap, MapPin, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import useWallet from "@/hooks/useWallet";

// One waygate card: destination, region, coordinates and the HT price, with
// the pay-and-teleport action hitting the secure backend function.
export default function WaygateCard({ gate, onUsed }) {
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
      const res = await base44.functions.invoke("waygateUse", { waygate_id: gate.id });
      setDone(true);
      refresh();
      onUsed?.(res.data);
    } catch (e) {
      setError(e.message || "Teleport failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Zap size={17} />
        </span>
        {gate.region && (
          <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] text-muted-foreground">
            {gate.region}
          </span>
        )}
      </div>
      <div className="font-heading text-xl font-bold text-foreground mb-1">{gate.name}</div>
      {gate.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{gate.description}</p>
      )}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
        <MapPin size={12} />
        <span className="font-mono">
          {Number.isFinite(gate.pos_x)
            ? `${Math.round(gate.pos_x)}, ${Math.round(gate.pos_y)}, ${Math.round(gate.pos_z)}`
            : "Coordinates hidden"}
        </span>
      </div>

      <div className="font-heading text-xl font-bold text-foreground mb-4">
        {gate.price.toLocaleString()}
        <span className="text-xs text-muted-foreground font-medium ml-1.5">HT</span>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {done ? (
        <span className="mt-auto rounded-md bg-secondary text-muted-foreground text-sm font-medium px-4 py-2 text-center">
          Request queued for delivery
        </span>
      ) : (
        <button
          onClick={teleport}
          disabled={busy || !afford}
          className={`mt-auto rounded-md text-sm font-semibold px-4 py-2 transition-opacity ${
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
            "Teleport here"
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Lock size={12} /> Not enough HT
            </span>
          )}
        </button>
      )}
    </div>
  );
}