import React from "react";
import { Skull } from "lucide-react";
import PageShell from "@/components/portal/PageShell";

export default function Killfeed() {
  return (
    <PageShell
      kicker="REALM NEWS"
      title="KILLFEED"
      sub="Every death on the island, as it happens. Fresh kills at the top."
    >
      <div className="glass-panel rounded-lg p-10 text-center">
        <Skull size={22} className="mx-auto mb-3 text-muted-foreground" />
        <div className="font-heading text-xl text-foreground mb-2">No kills recorded yet</div>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          The island feed does not report kills yet. As soon as the server
          starts sending kill events, they appear here in real time.
        </p>
      </div>
    </PageShell>
  );
}