export default function TradeBoard({ offers, listedSpecs, onAccept, onDecline, onWithdraw }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Your listings */}
      <div className="glass-panel p-6">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">
          YOUR TRADE LISTINGS
        </div>
        {listedSpecs.length === 0 ? (
          <div className="font-mono text-xs text-muted-foreground tracking-wide py-6 text-center border border-dashed border-border">
            NO SPECIMENS LISTED — SELECT ONE AND LIST FOR TRADE
          </div>
        ) : (
          <div className="space-y-3">
            {listedSpecs.map((spec) => (
              <div
                key={spec.code}
                className="glass-panel-light p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: spec.accent }} />
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-foreground tracking-wide truncate">
                      {spec.name} — {spec.code}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-wide">
                      GROWTH {spec.growth}% — PRIME {spec.prime}%
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onWithdraw(spec.code)}
                  className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground border border-border px-3 py-2 hover:text-destructive hover:border-destructive/50 transition-colors flex-shrink-0"
                >
                  WITHDRAW
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming offers */}
      <div className="glass-panel p-6">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">
          INCOMING OFFERS
        </div>
        {offers.length === 0 ? (
          <div className="font-mono text-xs text-muted-foreground tracking-wide py-6 text-center border border-dashed border-border">
            NO OPEN OFFERS
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <div key={offer.id} className="glass-panel-light p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-primary">
                    FROM: {offer.from}
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.15em] text-accent">
                    WANTS: {offer.wants}
                  </span>
                </div>
                <div className="font-mono text-sm text-foreground tracking-wide mb-1">
                  {offer.name} — {offer.code}
                </div>
                <div className="font-mono text-[9px] text-muted-foreground tracking-wide mb-4">
                  GROWTH {offer.growth}%
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAccept(offer.id)}
                    className="flex-1 font-mono text-[9px] tracking-[0.2em] border border-accent/50 text-accent px-4 py-2 hover:bg-accent/10 transition-colors"
                  >
                    ACCEPT TRADE
                  </button>
                  <button
                    onClick={() => onDecline(offer.id)}
                    className="flex-1 font-mono text-[9px] tracking-[0.2em] border border-border text-muted-foreground px-4 py-2 hover:text-destructive hover:border-destructive/50 transition-colors"
                  >
                    DECLINE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}