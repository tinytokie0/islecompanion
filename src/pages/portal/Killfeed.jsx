import React, { useEffect, useState } from "react";
import { Skull, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { base44 } from "@/api/base44Client";

// One side of a kill row: player name with Steam ID, then species and growth.
function PlayerSide({ name, steamId, species, growth, dimName }) {
  return (
    <div className="min-w-0 text-sm leading-snug">
      <span className={`font-bold text-foreground ${dimName ? "opacity-80" : ""}`}>
        {name || "Unknown"}
      </span>
      {steamId ? <span className="text-muted-foreground"> ({steamId})</span> : null}
      {species ? (
        <span className="text-muted-foreground">
          {" · "}
          {species}
          {growth != null ? ` · ${Math.round(growth)}%` : ""}
        </span>
      ) : null}
    </div>
  );
}

export default function Killfeed() {
  const [events, setEvents] = useState(null);
  const [count24, setCount24] = useState(0);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const [page, count] = await Promise.all([
        base44.entities.KillEvent.filter({}, { sort: "-killed_date", limit: 50 }),
        base44.entities.KillEvent.count({ killed_date: { $gte: since } }),
      ]);
      if (!alive) return;
      setEvents(page.items || []);
      setCount24(count);
      setNow(Date.now());
      setLoading(false);
    };
    load();
    const t = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <section className="px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Killfeed</h1>
          <p className="text-sm text-muted-foreground mt-2">Recent kills on the server.</p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Reading island data...
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-7 mb-8">
              <div className="pointer-events-none absolute inset-y-0 right-0 w-72 bg-gradient-to-l from-primary/25 via-primary/10 to-transparent" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <Skull size={20} />
                  </span>
                  <div>
                    <div className="font-heading text-xl font-bold text-foreground">Last 24 hours</div>
                    <div className="text-sm text-muted-foreground">Kills recorded across the island.</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-heading text-5xl font-bold text-primary">{count24}</span>
                  <span className="text-sm text-muted-foreground ml-2">kills</span>
                </div>
              </div>
            </div>

            {/* Feed list */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {(!events || events.length === 0) ? (
                <div className="p-10 text-center">
                  <Skull size={22} className="mx-auto mb-3 text-muted-foreground" />
                  <div className="font-heading text-xl font-bold text-foreground mb-2">No kills recorded yet</div>
                  <p className="text-sm text-muted-foreground">
                    Deaths appear here in real time as the island feed records them.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {events.map((ev) => {
                    const env = !ev.killer_steam_id;
                    return (
                      <div
                        key={ev.id}
                        className="px-5 py-4 flex items-center gap-3 md:gap-4 hover:bg-primary/5 transition-colors"
                      >
                        {/* Killer (or Environment) */}
                        <div className="w-40 md:w-72 shrink-0">
                          {env ? (
                            <span className="text-sm font-bold text-foreground">Environment</span>
                          ) : (
                            <PlayerSide
                              name={ev.killer_name}
                              steamId={ev.killer_steam_id}
                              species={ev.killer_species}
                              growth={ev.killer_growth}
                            />
                          )}
                        </div>

                        <Skull size={14} className="text-muted-foreground shrink-0" />

                        {/* Victim */}
                        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                          <PlayerSide
                            name={ev.victim_name}
                            steamId={ev.victim_steam_id}
                            species={ev.victim_species}
                            growth={ev.victim_growth}
                            dimName={env}
                          />
                          {env && (
                            <span className="text-[10px] font-heading font-semibold tracking-wide text-muted-foreground border border-border rounded-full px-2.5 py-0.5">
                              Environment
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(ev.killed_date), { addSuffix: true })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}