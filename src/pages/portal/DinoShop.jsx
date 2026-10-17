import React, { useState } from "react";
import { ShoppingBag, Search, Loader2 } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { stageFor } from "@/lib/growthStages";
import { speciesInfo } from "@/lib/speciesPricing";
import DinoPortrait from "@/components/DinoPortrait";
import useHt from "@/hooks/useHt";
import useIslandSpecies from "@/hooks/useIslandSpecies";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

export default function DinoShop() {
  const { balance, spend } = useHt();
  const [busy, setBusy] = useState(false);
  const [owned, setOwned] = useState([]);
  const [query, setQuery] = useState("");
  const { species, loading } = useIslandSpecies();

  const buy = async (s) => {
    const info = speciesInfo(s.species);
    if (busy || balance < info.price) return;
    setBusy(true);
    try {
      await spend(info.price, `Dino shop: ${s.species}`);
      setOwned((o) => [...o, s.species]);
    } finally {
      setBusy(false);
    }
  };

  const shown = species.filter((s) =>
    query.trim() ? s.species.toLowerCase().includes(query.trim().toLowerCase()) : true
  );

  return (
    <PageShell
      icon={ShoppingBag}
      title="Dino shop"
      sub="Buy a dino with Haven Tokens — every purchase is delivered straight to your garage. Listings come straight from the live island feed."
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

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> Reading island data...
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <div className="font-heading text-xl font-bold text-foreground mb-2">No dinos on the island</div>
          <p className="text-sm text-muted-foreground">
            Species appear here as soon as players spawn in with them.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((s) => {
            const info = speciesInfo(s.species);
            const { current } = stageFor(s.topGrowth);
            const isOwned = owned.includes(s.species);
            const afford = balance >= info.price;
            return (
              <div key={s.species} className="rounded-xl border border-border bg-card p-6 flex flex-col">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <DinoPortrait species={s.species} className="absolute inset-0" />
                </div>
                <div className="font-heading text-xl font-bold text-foreground mb-1">{s.species}</div>
                <div className="text-xs text-muted-foreground mb-3">
                  {s.count} on island · top growth {Math.round(s.topGrowth)}% · {current.name}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] text-muted-foreground">
                    {info.rarity}
                  </span>
                </div>
                <div className="font-heading text-xl font-bold text-foreground mb-4">
                  {info.price.toLocaleString()}
                  <span className="text-xs text-muted-foreground font-medium ml-1.5">HT</span>
                </div>
                {isOwned ? (
                  <span className="mt-auto rounded-md bg-secondary text-muted-foreground text-sm font-medium px-4 py-2 text-center">
                    Owned
                  </span>
                ) : (
                  <button
                    onClick={() => buy(s)}
                    disabled={!afford}
                    className={`mt-auto rounded-md text-sm font-semibold px-4 py-2 transition-opacity ${
                      afford
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {afford ? "Buy" : "Not enough HT"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <LiveIslandStrip />
      </div>
    </PageShell>
  );
}