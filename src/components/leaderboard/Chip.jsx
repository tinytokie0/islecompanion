import React from "react";

export default function Chip({ children, highlight = false }) {
  if (highlight) {
    return (
      <span className="font-mono text-[10px] tracking-[0.1em] px-3 py-1 rounded-full bg-primary text-primary-foreground whitespace-nowrap">
        {children}
      </span>
    );
  }
  return (
    <span className="font-mono text-[10px] tracking-[0.1em] px-2.5 py-1 rounded-full border border-border text-muted-foreground whitespace-nowrap">
      {children}
    </span>
  );
}