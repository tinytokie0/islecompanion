import React, { useState } from "react";
import { Coins, Package, PackageOpen } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { stageFor } from "@/lib/growthStages";
import { PACKS } from "@/lib/portalData";
import useHt from "@/hooks/useHt";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

export default function DinoPacks() {
  const { balance, spend } = useHt();
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState(null); // {name, tier, accent, growth}

  const open = async (pack) => {
    if (busy || balance < pack.price) return;
    setBusy(true);
    try {
      await spend(pack.price, `Dino pack: ${pack.name}`);
      const name = pack.pool[Math.floor(Math.random() * pack.pool.length)];
      const growth = 30 + Math.floor(Math.random() * 60);
      setReveal({ name, tier: pack.tier, accent: pack.accent, growth });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      kicker="CRYSTAL EGG VAULT"
      title="DINO PACKS"
      sub="Open packs for a random dino, delivered straight to your garage."
    >
      {/* Reveal */}
      <div className="glass-panel rounded-lg p-8 mb-8 flex flex-col items-center text-center min-h-[220px] justify-center">
        {reveal ? (
          <div className="animate-flicker">
            <div
              className="font-mono text-[9px] tracking-[0.3em] mb-3"
              style={{ color: reveal.accent }}
            >
              {reveal.tier} PULL
            </div>
            <div className="font-heading text-4xl tracking-[0.08em] text-foreground mb-2">
              {reveal.name.toUpperCase()}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground tracking-[0.15em]">
              GROWTH: {reveal.growth}% — {stageFor(reveal.growth).current.name}
            </div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/70 mt-4">
              SENT TO YOUR GARAGE
            </div>
          </div>
        ) : (
          <div className="font-mono text-[11px] text-muted-foreground tracking-[0.2em] flex items-center gap-3">
            <Package size={16} className="text-primary" />
            OPEN A PACK TO REVEAL YOUR DINO
          </div>
        )}
      </div>

      {/* Packs */}
      <div className="grid md:grid-cols-3 gap-5">
        {PACKS.map((pack) => {
          const afford = balance >= pack.price;
          return (
            <div key={pack.name} className="glass-panel rounded-lg p-6 flex flex-col items-center text-center">
              <span
                className="w-16 h-16 rounded-md flex items-center justify-center mb-5"
                style={{ backgroundColor: `${pack.accent}14`, border: `1px solid ${pack.accent}55`, color: pack.accent }}
              >
                <PackageOpen size={26} />
              </span>
              <div className="font-heading text-xl tracking-[0.05em] text-foreground mb-1">
                {pack.name.toUpperCase()}
              </div>
              <div
                className="font-mono text-[9px] tracking-[0.25em] mb-4"
                style={{ color: pack.accent }}
              >
                {pack.tier} TIER
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mb-6 flex-1">
                {pack.pool.length} SPECIES IN POOL
              </div>
              <button
                onClick={() => open(pack)}
                disabled={!afford}
                className={`w-full font-mono text-[10px] tracking-[0.25em] py-3 rounded-sm border transition-colors ${
                  afford
                    ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                    : "border-border text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                OPEN — {pack.price.toLocaleString()} HT
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <LiveIslandStrip />
      </div>
    </PageShell>
  );
}