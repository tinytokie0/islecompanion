import React, { useState } from "react";
import { CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STATUS_STYLE = {
  pending: { icon: Hourglass, cls: "text-muted-foreground", label: "Awaiting delivery" },
  delivered: { icon: CheckCircle2, cls: "text-emerald-400", label: "Delivered" },
  cancelled: { icon: XCircle, cls: "text-destructive", label: "Cancelled" },
};

// The player's recent teleport requests with live delivery status.
export default function WaygateHistory({ requests }) {
  if (!requests.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-bold text-foreground mb-4">My teleports</h2>
      <div className="space-y-3">
        {requests.map((r) => {
          const s = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
          const Icon = s.icon;
          return (
            <div
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-lg bg-secondary/50 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{r.waygate_name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {new Date(r.created_date).toLocaleString()}
                  {r.species ? ` · ${r.species}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-muted-foreground">
                  -{r.price.toLocaleString()} HT
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.cls}`}>
                  <Icon size={13} /> {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}