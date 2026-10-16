import React, { useState } from "react";
import { Coins, ShoppingBag } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { stageFor } from "@/lib/growthStages";
import { DINOS } from "@/lib/portalData";
import DinoPortrait from "@/components/DinoPortrait";
import usePlayShards from "@/hooks/usePlayShards";
import EconomyChips from "@/components/portal/EconomyChips";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

const RARITY_COLOR = { APEX: "#a78bfa", RARE: "#e6b84c", COMMON: "#94a3b8" };

export default function DinoShop() {
  const [shards, setShards] = usePlayShards();
  const [owned, setOwned] = useState([]);

  const buy = (dino) => {
    if (shards < dino.price) return;
    setShards((s) => s - dino.price);
    setOwned((o) => [...o, dino.code]);
  };

  return (
    <PageShell
      kicker="THE VAULT STORE"
      title="DINO SHOP"
      sub="Buy dinos with your shards — every purchase is delivered straight to your garage."
      right={<EconomyChips shards={shards} />}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DINOS.map((dino) => {
          const { current, next } = stageFor(dino.growth);
          const isOwned = owned.includes(dino.code);
          const afford = shards >= dino.price;
          return (
            <div key={dino.code} className="glass-panel rounded-lg p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">{dino.code}</span>
                <span
                  className="font-mono text-[8px] tracking-[0.2em] px-2 py-0.5 border rounded-sm"
                  style={{ color: RARITY_COLOR[dino.rarity], borderColor: `${RARITY_COLOR[dino.rarity]}55` }}
                >
                  {dino.rarity}
                </span>
              </div>
              <div className="relative aspect-video glass-panel-light rounded-sm mb-4 overflow-hidden">
                <DinoPortrait species={dino.name} className="absolute inset-0" />
              </div>
              <div className="font-heading text-xl tracking-[0.05em] text-foreground mb-1">
                {dino.name.toUpperCase()}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mb-4">
                {dino.growth}% — {current.name}
                {next ? ` → ${next.name} AT ${next.at}%` : ""}
              </div>
              <div className="h-1 bg-secondary overflow-hidden rounded-sm mb-5">
                <div className="h-full" style={{ width: `${dino.growth}%`, backgroundColor: dino.accent }} />
              </div>
              <div className="flex justify-between items-center mt-auto">
                <span className="font-mono text-sm text-accent">{dino.price.toLocaleString()}</span>
                {isOwned ? (
                  <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground border border-border px-3 py-1.5 rounded-sm">
                    OWNED
                  </span>
                ) : (
                  <button
                    onClick={() => buy(dino)}
                    disabled={!afford}
                    className={`font-mono text-[9px] tracking-[0.2em] px-4 py-1.5 border rounded-sm transition-colors flex items-center gap-1.5 ${
                      afford
                        ? "border-primary/40 text-primary hover:bg-primary/10"
                        : "border-border text-muted-foreground/50 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingBag size={11} />
                    {afford ? "BUY" : "TOO LOW"}
                  </button>
                )}
              </div>
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