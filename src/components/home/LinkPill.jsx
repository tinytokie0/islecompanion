import React from "react";
import { Link } from "react-router-dom";

// CGW-style compact feature pill: icon tile, title and one-line description.
export default function LinkPill({ icon: Icon, title, desc, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-border bg-card/70 px-4 py-3.5 hover:border-[rgba(230,184,76,0.65)] hover:shadow-[0_0_24px_rgba(230,184,76,0.18)] hover:-translate-y-0.5 transition-all"
    >
      <span className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block font-heading text-sm font-bold text-foreground leading-tight">{title}</span>
        <span className="block text-xs text-muted-foreground truncate">{desc}</span>
      </span>
    </Link>
  );
}