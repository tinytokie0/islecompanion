import React, { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { stageFor } from "@/lib/growthStages";
import { DINOS } from "@/lib/portalData";
import useHt from "@/hooks/useHt";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";

const RARITY_COLOR = { APEX: "#a78bfa", RARE: "#e6b84c", COMMON: "#94a3b8" };

export default function Trading() {
  const { balance, spend } = useHt();
  const [busy, setBusy] = useState(false);
  const [owned, setOwned] = useState([]);
  const [listed, setListed] = useState([]);
  const [offers, setOffers] = useState([]);

  const market = DINOS.filter((d) => !owned.includes(d.code));

  const buy = async (dino) => {
    if (busy || balance < dino.price) return;
    setBusy(true);
    try {
      await spend(dino.price, `Trading market: ${dino.name}`);
      setOwned((o) => [...o, dino.code]);
    } finally {
      setBusy(false);
    }
  };

  const toggleListed = (code) =>
    setListed((prev) => (listed.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));

  const acceptOffer = (offer) => {
    setOwned((o) => o.filter((c) => c !== offer.wants).concat(offer.code));
    setListed((l) => l.filter((c) => c !== offer.wants));
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
  };

  const ownedDinos = DINOS.filter((d) => owned.includes(d.code));

  return (
    <section className="px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Trading</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Buy dinos from the market, list your own and review incoming trade offers.
          </p>
        </div>

        {/* Market */}
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
          MARKET — {market.length} LISTINGS
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {market.map((dino) => {
            const { current } = stageFor(dino.growth);
            const afford = balance >= dino.price;
            return (
              <div key={dino.code} className="rounded-xl border border-border bg-card p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">{dino.code}</span>
                  <span
                    className="font-mono text-[8px] tracking-[0.2em] px-2 py-0.5 border rounded-sm"
                    style={{ color: RARITY_COLOR[dino.rarity], borderColor: `${RARITY_COLOR[dino.rarity]}55` }}
                  >
                    {dino.rarity}
                  </span>
                </div>
                <div className="font-heading text-lg tracking-[0.05em] text-foreground mb-1">
                  {dino.name.toUpperCase()}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mb-4">
                  {dino.growth}% — {current.name}
                </div>
                <div className="h-1 bg-secondary overflow-hidden rounded-sm mb-5">
                  <div className="h-full" style={{ width: `${dino.growth}%`, backgroundColor: dino.accent }} />
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-mono text-xs text-accent">{dino.price.toLocaleString()}</span>
                  <button
                    onClick={() => buy(dino)}
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
                <div key={d.code} className="flex justify-between items-center border-b border-border/60 pb-3">
                  <div>
                    <div className="font-mono text-xs text-foreground">{d.name.toUpperCase()}</div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">{d.code}</div>
                  </div>
                  <button
                    onClick={() => toggleListed(d.code)}
                    className={`font-mono text-[9px] tracking-[0.2em] px-3 py-1.5 border rounded-sm transition-colors ${
                      listed.includes(d.code)
                        ? "border-accent/60 text-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {listed.includes(d.code) ? "LISTED" : "LIST"}
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
                  const mine = DINOS.find((d) => d.code === offer.wants);
                  const theirs = DINOS.find((d) => d.code === offer.code);
                  return (
                    <div key={offer.id} className="border border-border rounded-md p-4">
                      <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-3">
                        FROM {offer.from}
                      </div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                          <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">THEY GIVE</div>
                          <div className="font-mono text-xs text-foreground">
                            {theirs?.name.toUpperCase()} ({offer.growth}%)
                          </div>
                        </div>
                        <div className="font-mono text-muted-foreground">⇄</div>
                        <div className="text-right">
                          <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">THEY WANT</div>
                          <div className="font-mono text-xs text-foreground">{mine?.name.toUpperCase()}</div>
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