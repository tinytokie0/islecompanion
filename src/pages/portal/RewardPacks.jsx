import React, { useState } from "react";
import { PackageOpen } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

export default function RewardPacks() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);

  const redeem = (e) => {
    e.preventDefault();
    const key = code.trim().toUpperCase();
    if (!key) return setError("Enter a reward code.");
    setError("That code is not valid or has expired.");
  };

  return (
    <PageShell
      kicker="COMMUNITY GIFTS"
      title="REWARD PACKS"
      sub="Redeem codes from streams, events and Discord drops."
    >
      {/* Redeem */}
      <form onSubmit={redeem} className="glass-panel rounded-lg p-6 mb-8">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4 flex items-center gap-2">
          <PackageOpen size={13} className="text-primary" /> REDEEM A CODE
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ENTER CODE"
            className="flex-1 bg-secondary border border-border rounded-sm font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60 placeholder:text-muted-foreground/50 uppercase"
          />
          <button
            type="submit"
            className="font-mono text-[10px] tracking-[0.25em] bg-primary text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            REDEEM
          </button>
        </div>
        {error && <div className="font-mono text-[10px] text-destructive mt-3 tracking-wide">{error}</div>}
      </form>

      <LiveIslandStrip />
    </PageShell>
  );
}