import React, { useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { stageFor } from "@/lib/growthStages";
import { speciesInfo } from "@/lib/speciesPricing";
import useHt from "@/hooks/useHt";
import useIslandSpecies from "@/hooks/useIslandSpecies";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

const RARITY_COLOR = { APEX: "#a78bfa", RARE: "#e6b84c", COMMON: "#94a3b8" };

export default function Trading() {
  const { balance, spend } = useHt();
  const [busy, setBusy] = useState(false);
  const [owned, setOwned] = useState([]);
  const [listed, setListed] = useState([]);
  const [offers, setOffers] = useState([]);
  const { species, loading } = useIslandSpecies();

  const market = species.filter((s) => !owned.includes(s.species));

  const buy = async (s) => {
    const info = speciesInfo(s.species);
    if (busy || balance < info.price) return;
    setBusy(true);
    try {
      await spend(info.price, `Trading market: ${s.species}`);
      setOwned((o) => [...o, s.species]);
    } finally {
      setBusy(false);
    }
  };

  const toggleListed = (name) =>
    setListed((prev) => (listed.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  const acceptOffer = (offer) => {
    setOwned((o) => o.filter((n) => n !== offer.wants).concat(offer.species));
    setListed((l) => l.filter((n) => n !== offer.wants));
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
  };

  const ownedDinos = species.filter((s) => owned.includes(s.species));

  return (
    <section className="px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Trading</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Buy dinos straight from the live island feed, list your own and review incoming trade offers.
          </p>
        </div>

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
                      disabled={!afford}
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
              <ArrowLeftRight size={13} className="text-primary" /> YOUR SPECIMENS — {ownedDinos.length}
            </div>
            <div className="space-y-3">
              {ownedDinos.length === 0 && (
                <div className="font-mono text-[11px] text-muted-foreground py-6 text-center">
                  You don't own any dinos yet. Buy one from the market above.
                </div>
              )}
              {ownedDinos.map((d) => (
                <div key={d.species} className="flex justify-between items-center border-b border-border/60 pb-3">
                  <div>
                    <div className="font-mono text-xs text-foreground">{d.species.toUpperCase()}</div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">
                      {d.count} on island
                    </div>
                  </div>
                  <button
                    onClick={() => toggleListed(d.species)}
                    className={`font-mono text-[9px] tracking-[0.2em] px-3 py-1.5 border rounded-sm transition-colors ${
                      listed.includes(d.species)
                        ? "border-accent/60 text-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {listed.includes(d.species) ? "LISTED" : "LIST"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Offers */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">
              INCOMING OFFERS — {offers.length}
            </div>
            {offers.length === 0 ? (
              <div className="font-mono text-[11px] text-muted-foreground py-8 text-center">
                No open offers right now.
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => {
                  const mine = species.find((s) => s.species === offer.wants);
                  const theirs = species.find((s) => s.species === offer.species);
                  return (
                    <div key={offer.id} className="border border-border rounded-md p-4">
                      <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-3">
                        FROM {offer.from}
                      </div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                          <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">THEY GIVE</div>
                          <div className="font-mono text-xs text-foreground">
                            {theirs?.species.toUpperCase()}
                          </div>
                        </div>
                        <div className="font-mono text-muted-foreground">⇄</div>
                        <div className="text-right">
                          <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">THEY WANT</div>
                          <div className="font-mono text-xs text-foreground">{mine?.species.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptOffer(offer)}
                          className="flex-1 font-heading text-xs font-bold tracking-wide border border-primary/40 text-primary px-3 py-2 rounded-md hover:bg-primary/10 transition-colors"
                        >
                          ACCEPT
                        </button>
                        <button
                          onClick={() => setOffers((prev) => prev.filter((o) => o.id !== offer.id))}
                          className="flex-1 font-heading text-xs font-bold tracking-wide border border-border text-muted-foreground px-3 py-2 rounded-md hover:text-foreground transition-colors"
                        >
                          DECLINE
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <LiveIslandStrip />
        </div>
      </div>
    </section>
  );
}