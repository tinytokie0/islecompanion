import React, { useEffect, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { stageFor } from "@/lib/growthStages";
import { speciesInfo } from "@/lib/speciesPricing";
import useHt from "@/hooks/useHt";
import useIslandSpecies from "@/hooks/useIslandSpecies";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

const RARITY_COLOR = { APEX: "#a78bfa", RARE: "#e6b84c", COMMON: "#94a3b8" };

export default function Trading() {
  const { balance, refresh, spend } = useHt();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [specimens, setSpecimens] = useState(null); // owned, from the database
  const { species, loading } = useIslandSpecies();

  const loadSpecimens = async () => {
    try {
      const page = await base44.entities.Specimen.filter({});
      setSpecimens(page.items);
    } catch {
      setSpecimens([]);
    }
  };
  useEffect(() => { loadSpecimens(); }, []);

  const ownedNames = new Set((specimens || []).map((s) => s.species));
  const market = species.filter((s) => !ownedNames.has(s.species));
  const onIsland = new Map(species.map((s) => [s.species, s.count]));

  const buy = async (s) => {
    const info = speciesInfo(s.species);
    if (busy || balance < info.price) return;
    setBusy(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("tradingBuy", { species: s.species });
      if (res.data?.ok) {
        await loadSpecimens();
        await refresh();
      } else {
        setError(res.data?.error || "Purchase failed.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleListed = async (spec) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await base44.entities.Specimen.update(spec.id, { listed: !spec.listed });
      await loadSpecimens();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const ownedDinos = specimens || [];

  return (
    <section className="px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Trading</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Buy dinos straight from the live island feed and manage your specimens.
          </p>
        </div>

        {error && (
          <div className="font-mono text-[11px] text-destructive mb-6 text-center">{error}</div>
        )}

        {/* Market */}
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
          MARKET — {loading ? "…" : `${market.length} LISTINGS`}
        </div>
        {loading ? (
          <div className="rounded-xl border border-border bg-card p-10 flex items-center justify-center gap-3 text-sm text-muted-foreground mb-10">
            <Loader2 size={14} className="animate-spin" /> Reading island data...
          </div>
        ) : market.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center mb-10">
            <div className="font-heading text-xl font-bold text-foreground mb-2">No dinos on the island</div>
            <p className="text-sm text-muted-foreground">
              Species appear here as soon as players spawn in with them.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {market.map((s) => {
              const info = speciesInfo(s.species);
              const { current } = stageFor(s.topGrowth);
              const afford = balance >= info.price;
              return (
                <div key={s.species} className="rounded-xl border border-border bg-card p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
                      {s.count} ON ISLAND
                    </span>
                    <span
                      className="font-mono text-[8px] tracking-[0.2em] px-2 py-0.5 border rounded-sm"
                      style={{ color: RARITY_COLOR[info.rarity], borderColor: `${RARITY_COLOR[info.rarity]}55` }}
                    >
                      {info.rarity}
                    </span>
                  </div>
                  <div className="font-heading text-lg tracking-[0.05em] text-foreground mb-1">
                    {s.species.toUpperCase()}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground mb-4">
                    top growth {Math.round(s.topGrowth)}% — {current.name}
                  </div>
                  <div className="h-1 bg-secondary overflow-hidden rounded-sm mb-5">
                    <div className="h-full" style={{ width: `${s.topGrowth}%`, backgroundColor: info.accent }} />
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-mono text-xs text-accent">{info.price.toLocaleString()}</span>
                    <button
                      onClick={() => buy(s)}
                      disabled={!afford || busy}
                      className={`font-heading text-xs font-bold tracking-wide px-4 py-1.5 rounded-md transition-colors ${
                        afford
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "border border-border text-muted-foreground/50 cursor-not-allowed"
                      }`}
                    >
                      {afford ? "BUY" : "TOO LOW"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Your specimens */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5 flex items-center gap-2">
              <ArrowLeftRight size={13} className="text-primary" /> YOUR SPECIMENS — {specimens ? ownedDinos.length : "…"}
            </div>
            {specimens === null ? (
              <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground py-6 justify-center">
                <Loader2 size={12} className="animate-spin" /> LOADING...
              </div>
            ) : ownedDinos.length === 0 ? (
              <div className="font-mono text-[11px] text-muted-foreground py-6 text-center">
                You don't own any dinos yet. Buy one from the market above.
              </div>
            ) : (
              <div className="space-y-3">
                {ownedDinos.map((d) => (
                  <div key={d.id} className="flex justify-between items-center border-b border-border/60 pb-3">
                    <div>
                      <div className="font-mono text-xs text-foreground">{d.species.toUpperCase()}</div>
                      <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">
                        {onIsland.get(d.species) || 0} on island now
                      </div>
                    </div>
                    <button
                      onClick={() => toggleListed(d)}
                      className={`font-mono text-[9px] tracking-[0.2em] px-3 py-1.5 border rounded-sm transition-colors ${
                        d.listed
                          ? "border-accent/60 text-accent"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d.listed ? "LISTED" : "LIST"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offers */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">
              INCOMING OFFERS
            </div>
            <div className="font-mono text-[11px] text-muted-foreground py-8 text-center">
              No open offers right now.
            </div>
          </div>
        </div>

        <div className="mt-8">
          <LiveIslandStrip />
        </div>
      </div>
    </section>
  );
}