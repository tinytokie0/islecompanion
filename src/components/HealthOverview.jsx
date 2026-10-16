import React from "react";
import { Link } from "react-router-dom";
import { Loader2, Dna } from "lucide-react";
import useMyDino from "@/hooks/useMyDino";
import { GROWTH_STAGES, stageFor } from "@/lib/growthStages";

export default function HealthOverview() {
  const { loading, linked, dino } = useMyDino();

  const growth = dino ? dino.growth ?? 0 : null;
  const { current, next } = stageFor(growth ?? 0);
  const fresh =
    dino &&
    dino.last_seen &&
    Date.now() - new Date(dino.last_seen).getTime() < 10 * 60 * 1000;

  return (
    <section id="vitals" className="relative py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary mb-3 block">
              04 — VITALITY RUNES
            </span>
            <h2 className="font-heading text-3xl md:text-5xl tracking-[0.08em] text-foreground">
              GROWTH TRACKING
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-md tracking-wide leading-relaxed">
            Your dinosaur's growth, recorded live from the island every five
            minutes.
          </p>
        </div>

        {loading ? (
          <div className="glass-panel p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> READING ISLAND DATA...
          </div>
        ) : !linked ? (
          <div className="glass-panel p-10 text-center">
            <Dna size={22} className="mx-auto mb-3 text-muted-foreground" />
            <div className="font-heading text-xl text-foreground mb-2">Link your Steam account</div>
            <p className="font-mono text-xs text-muted-foreground mb-5 leading-relaxed">
              Connect Steam from the home page so the site knows which dino is
              yours.
            </p>
            <Link
              to="/"
              className="font-mono text-[10px] tracking-[0.25em] border border-primary/40 text-primary px-6 py-3 rounded-sm hover:bg-primary/10 transition-colors inline-flex items-center gap-2"
            >
              <Dna size={13} /> GO TO STEAM LINKING
            </Link>
          </div>
        ) : !dino ? (
          <div className="glass-panel p-10 text-center">
            <div className="font-heading text-xl text-foreground mb-2">No dino detected yet</div>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              Spawn in on the island and your dino's growth appears here
              automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Growth summary */}
            <div className="glass-panel p-6 md:p-8 mb-6">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-2">
                    {(dino.species || "UNKNOWN SPECIES").toUpperCase()}
                    {dino.sex ? ` — ${dino.sex.toUpperCase()}` : ""}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-5xl text-primary text-glow">{growth}</span>
                    <span className="font-mono text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="font-mono text-[10px] tracking-[0.15em] flex items-center gap-2">
                  {fresh ? (
                    <span className="text-emerald-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ON THE ISLAND
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      LAST SEEN {new Date(dino.last_seen).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 bg-secondary overflow-hidden rounded-sm mt-4">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${growth}%`, backgroundColor: "#e6b84c" }}
                />
              </div>
            </div>

            {/* Growth stage tracker */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
                  GROWTH STAGE TRACKER — {current.name}
                </div>
                {next && (
                  <div className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
                    NEXT: <span className="text-foreground">{next.name}</span> AT {next.at}%
                  </div>
                )}
              </div>
              <div className="relative h-10">
                {/* Stage segments */}
                <div className="absolute inset-x-0 top-3 h-2 flex gap-1">
                  {GROWTH_STAGES.slice(0, -1).map((s, i) => {
                    const end = GROWTH_STAGES[i + 1].at;
                    const reached = growth >= end;
                    return (
                      <div
                        key={s.name}
                        className="h-full overflow-hidden bg-secondary"
                        style={{ width: `${end - s.at}%` }}
                      >
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width:
                              growth >= end
                                ? "100%"
                                : growth > s.at
                                ? `${((growth - s.at) / (end - s.at)) * 100}%`
                                : "0%",
                            backgroundColor: reached ? "#e6b84c" : "#a78bfa",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Position marker */}
                <div
                  className="absolute top-0 bottom-0 z-10"
                  style={{ left: `${growth}%`, transform: "translateX(-50%)" }}
                >
                  <div className="w-px h-full bg-accent" />
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-accent" />
                </div>
              </div>
              <div className="flex justify-between mt-3">
                {GROWTH_STAGES.map((s) => (
                  <span
                    key={s.name}
                    className={`font-mono text-[9px] tracking-[0.15em] ${
                      growth >= s.at ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.name}
                    <span className="ml-1 opacity-60">{s.at}%</span>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}