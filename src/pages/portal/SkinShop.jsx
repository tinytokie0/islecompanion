import React, { useState } from "react";
import { Coins, Palette, Check } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { SKINS, START_SHARDS } from "@/lib/portalData";

export default function SkinShop() {
  const [shards, setShards] = useState(START_SHARDS);
  const [owned, setOwned] = useState(["ember"]);
  const [equipped, setEquipped] = useState("ember");

  const buy = (skin) => {
    if (shards < skin.price) return;
    setShards((s) => s - skin.price);
    setOwned((o) => [...o, skin.id]);
    setEquipped(skin.id);
  };

  return (
    <PageShell
      kicker="CRYSTAL ATELIER STORE"
      title="SKIN SHOP"
      sub="Buy skins with your shards and equip them — applied to your dino in-game."
      right={
        <div className="glass-panel-light px-4 py-2 flex items-center gap-2 w-fit">
          <Coins size={14} className="text-accent" />
          <span className="font-mono text-xs text-foreground">{shards.toLocaleString()}</span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">SHARDS</span>
        </div>
      }
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SKINS.map((skin) => {
          const isOwned = owned.includes(skin.id);
          const isEquipped = equipped === skin.id;
          const afford = shards >= skin.price;
          return (
            <div
              key={skin.id}
              className={`glass-panel rounded-lg p-5 flex flex-col transition-colors ${
                isEquipped ? "border-primary/60" : ""
              }`}
            >
              <div
                className="relative aspect-video rounded-sm mb-4 overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: skin.hex }}
              >
                <span className="absolute font-mono text-[9px] tracking-[0.25em] text-black/60 bottom-2 right-2">
                  {skin.hex.toUpperCase()}
                </span>
              </div>
              <div className="font-heading text-lg tracking-[0.05em] text-foreground mb-1">
                {skin.name.toUpperCase()}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mb-5">{skin.pattern}</div>
              <div className="flex justify-between items-center mt-auto">
                <span className="font-mono text-sm text-accent">{skin.price.toLocaleString()}</span>
                {isEquipped ? (
                  <span className="font-mono text-[9px] tracking-[0.2em] text-primary flex items-center gap-1.5">
                    <Check size={12} /> EQUIPPED
                  </span>
                ) : isOwned ? (
                  <button
                    onClick={() => setEquipped(skin.id)}
                    className="font-mono text-[9px] tracking-[0.2em] border border-primary/40 text-primary px-3 py-1.5 rounded-sm hover:bg-primary/10 transition-colors"
                  >
                    EQUIP
                  </button>
                ) : (
                  <button
                    onClick={() => buy(skin)}
                    disabled={!afford}
                    className={`font-mono text-[9px] tracking-[0.2em] px-3 py-1.5 border rounded-sm transition-colors flex items-center gap-1.5 ${
                      afford
                        ? "border-primary/40 text-primary hover:bg-primary/10"
                        : "border-border text-muted-foreground/50 cursor-not-allowed"
                    }`}
                  >
                    <Palette size={11} />
                    {afford ? "BUY" : "TOO LOW"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}