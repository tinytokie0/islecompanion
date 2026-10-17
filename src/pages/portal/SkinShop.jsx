import React, { useState } from "react";
import { Coins, Palette, Check } from "lucide-react";
import { SKINS } from "@/lib/portalData";
import useHt from "@/hooks/useHt";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";
import { Image } from "@/components/ui/image";

const HERO_ART =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/df0eed8ea_generated_image.png";

export default function SkinShop() {
  const { balance, spend } = useHt();
  const [busy, setBusy] = useState(false);
  const [owned, setOwned] = useState([]);
  const [equipped, setEquipped] = useState(null);

  const buy = async (skin) => {
    if (busy || balance < skin.price) return;
    setBusy(true);
    try {
      await spend(skin.price, `Skin shop: ${skin.name}`);
      setOwned((o) => [...o, skin.id]);
      setEquipped(skin.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative">
      {/* Full-bleed cinematic art backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src={HERO_ART}
          alt=""
          fittingType="fill"
          className="w-full h-full animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/55 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
        <div className="absolute inset-0 grid-bg opacity-25" />
      </div>

      <div className="relative px-4 md:px-8 py-10">
        <div className="max-w-[1500px] mx-auto">
          {/* Header panel */}
          <div className="glass-panel rounded-xl px-8 py-10 mb-10 text-center">
            <span className="inline-flex w-14 h-14 rounded-xl bg-primary/15 text-primary items-center justify-center mb-5">
              <Palette size={24} />
            </span>
            <h1 className="font-heading text-4xl md:text-5xl tracking-[0.08em] text-foreground text-glow mb-3">
              SKIN GARAGE
            </h1>
            <p className="font-mono text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed tracking-wide">
              Buy skins with Haven Tokens and equip them — applied to your dino in-game.
            </p>
            <div className="inline-flex items-center gap-2 mt-6 glass-panel-light px-4 py-2 rounded-full">
              <Coins size={13} className="text-accent" />
              <span className="font-mono text-xs text-foreground tracking-widest">
                {balance.toLocaleString()} HT
              </span>
            </div>
          </div>

          {/* Skin grid over the art */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SKINS.map((skin) => {
              const isOwned = owned.includes(skin.id);
              const isEquipped = equipped === skin.id;
              const afford = balance >= skin.price;
              return (
                <div
                  key={skin.id}
                  className={`glass-panel rounded-lg p-5 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                    isEquipped ? "border-primary/60 ring-1 ring-primary/30" : ""
                  }`}
                >
                  <div className="relative aspect-video rounded-sm mb-4 overflow-hidden flex items-center justify-center">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 50% 60%, ${skin.hex} 0%, ${skin.hex}cc 45%, #0b0b12 100%)`,
                      }}
                    />
                    <div className="absolute inset-0 grid-bg opacity-40" />
                    <div
                      className="relative w-2/3 h-1/2 rounded-sm shadow-lg"
                      style={{ backgroundColor: skin.hex, boxShadow: `0 0 24px ${skin.hex}88` }}
                    />
                    <span className="absolute font-mono text-[9px] tracking-[0.25em] text-black/70 bottom-2 right-2">
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

          <div className="mt-10">
            <LiveIslandStrip />
          </div>
        </div>
      </div>
    </section>
  );
}