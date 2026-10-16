import React from "react";
import { Zap, MapPin, Check } from "lucide-react";

// One selectable waygate card: click to choose the destination; the teleport
// action itself lives in the bar at the bottom of the page.
export default function WaygateCard({ gate, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(gate)}
      className={`text-left rounded-xl border bg-card p-6 flex flex-col transition-all ${
        selected
          ? "border-primary ring-1 ring-primary/60 bg-primary/5"
          : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Zap size={17} />
        </span>
        <div className="flex items-center gap-2">
          {gate.region && (
            <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] text-muted-foreground">
              {gate.region}
            </span>
          )}
          {selected && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Check size={12} />
            </span>
          )}
        </div>
      </div>
      <div className="font-heading text-xl font-bold text-foreground mb-1">{gate.name}</div>
      {gate.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{gate.description}</p>
      )}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <MapPin size={12} />
        <span className="font-mono">
          {Number.isFinite(gate.pos_x)
            ? `${Math.round(gate.pos_x)}, ${Math.round(gate.pos_y)}, ${Math.round(gate.pos_z)}`
            : "Coordinates hidden"}
        </span>
      </div>
      <div className="mt-auto font-heading text-xl font-bold text-foreground">
        {gate.price.toLocaleString()}
        <span className="text-xs text-muted-foreground font-medium ml-1.5">HT</span>
      </div>
    </button>
  );
}