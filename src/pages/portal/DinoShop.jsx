import React, { useState } from "react";
import { ShoppingBag, Search } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { stageFor } from "@/lib/growthStages";
import { DINOS } from "@/lib/portalData";
import DinoPortrait from "@/components/DinoPortrait";
import useHt from "@/hooks/useHt";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

export default function DinoShop() {
  const { balance, spend } = useHt();
  const [busy, setBusy] = useState(false);
  const [owned, setOwned] = useState([]);
  const [query, setQuery] = useState("");

  const buy = async (dino) => {
    if (busy || balance < dino.price) return;
    setBusy(true);
    try {
      await spend(dino.price, `Dino shop: ${dino.name}`);
      setOwned((o) => [...o, dino.code]);
    } finally {
      setBusy(false);
    }
  };

  const shown = DINOS.filter((d) =>
    query.trim() ? d.name.toLowerCase().includes(query.trim().toLowerCase()) : true
  );

  return (
    <PageShell
      icon={ShoppingBag}
      title="Dino shop"
      sub="Buy a dino with Haven Tokens — every purchase is delivered straight to your garage."
    >
      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by species"
          className="w-full rounded-lg bg-secondary/70 border border-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {shown.map((dino) => {
          const { current } = stageFor(dino.growth);
          const isOwned = owned.includes(dino.code);
          const afford = balance >= dino.price;
          return (
            <div key={dino.code} className="rounded-xl border border-border bg-card p-6 flex flex-col">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                <DinoPortrait species={dino.name} className="absolute inset-0" />
              </div>
              <div className="font-heading text-xl font-bold text-foreground mb-1">{dino.name}</div>
              <div className="text-xs text-muted-foreground mb-3">
                {dino.growth}% growth · {current.name}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] text-muted-foreground">
                  {dino.rarity}
                </span>
              </div>
              <div className="font-heading text-xl font-bold text-foreground mb-4">
                {dino.price.toLocaleString()}
                <span className="text-xs text-muted-foreground font-medium ml-1.5">HT</span>
              </div>
              {isOwned ? (
                <span className="mt-auto rounded-md bg-secondary text-muted-foreground text-sm font-medium px-4 py-2 text-center">
                  Owned
                </span>
              ) : (
                <button
                  onClick={() => buy(dino)}
                  disabled={!afford}
                  className={`mt-auto rounded-md text-sm font-semibold px-4 py-2 transition-opacity ${
                    afford
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-primary/40 text-primary-foreground/70 cursor-not-allowed"
                  }`}
                >
                  {afford ? "Buy now" : "Not enough HT"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {shown.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground mb-6">
          No dinos match "{query}".
        </div>
      )}

      <div className="mt-8">
        <LiveIslandStrip />
      </div>
    </PageShell>
  );
}