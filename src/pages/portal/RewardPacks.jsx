import React, { useState } from "react";
import { Coins, PackageOpen, Check } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { REWARD_CODES, START_SHARDS } from "@/lib/portalData";

export default function RewardPacks() {
  const [shards, setShards] = useState(START_SHARDS);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [claimed, setClaimed] = useState([]);

  const redeem = (e) => {
    e.preventDefault();
    const key = code.trim().toUpperCase();
    if (!key) return setError("Enter a reward code.");
    if (claimed.includes(key)) return setError("You already claimed this code.");
    const amount = REWARD_CODES[key];
    if (!amount) return setError("That code is not valid or has expired.");
    setError(null);
    setClaimed((prev) => [...prev, key]);
    setShards((s) => s + amount);
    setCode("");
  };

  return (
    <PageShell
      kicker="COMMUNITY GIFTS"
      title="REWARD PACKS"
      sub="Redeem codes from streams, events and Discord drops."
      right={
        <div className="glass-panel-light px-4 py-2 flex items-center gap-2 w-fit">
          <Coins size={14} className="text-accent" />
          <span className="font-mono text-xs text-foreground">{shards.toLocaleString()}</span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">SHARDS</span>
        </div>
      }
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
            placeholder="ENTER CODE (E.G. HAVEN2026)"
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

      {/* Claimed */}
      <div className="glass-panel rounded-lg divide-y divide-border/60">
        <div className="p-5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
          CLAIMED CODES — {claimed.length}
        </div>
        {claimed.length === 0 ? (
          <div className="p-8 font-mono text-[11px] text-muted-foreground text-center">
            No codes redeemed yet. Watch for drops in Discord.
          </div>
        ) : (
          claimed.map((c) => (
            <div key={c} className="p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Check size={14} className="text-accent" />
                <span className="font-mono text-xs text-foreground tracking-wide">{c}</span>
              </div>
              <span className="font-mono text-[10px] text-accent">
                +{REWARD_CODES[c].toLocaleString()} SHARDS
              </span>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}