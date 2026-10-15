import React, { useState } from "react";
import { Gift, Trophy, Users, Timer } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import { GIVEAWAYS, WINNERS } from "@/lib/portalData";

export default function Giveaways() {
  const [joined, setJoined] = useState([2]);
  const [counts, setCounts] = useState(Object.fromEntries(GIVEAWAYS.map((g) => [g.id, g.entries])));

  const toggleJoin = (g) => {
    const isIn = joined.includes(g.id);
    setJoined((prev) => (isIn ? prev.filter((id) => id !== g.id) : [...prev, g.id]));
    setCounts((prev) => ({ ...prev, [g.id]: prev[g.id] + (isIn ? -1 : 1) }));
  };

  return (
    <PageShell
      kicker="TRIBE FAVORS"
      title="GIVEAWAYS"
      sub="Enter active giveaways for dinos, skins and shards. Winners drawn live on Discord."
    >
      <div className="grid md:grid-cols-3 gap-5 mb-10">
        {GIVEAWAYS.map((g) => {
          const isIn = joined.includes(g.id);
          return (
            <div key={g.id} className="glass-panel rounded-lg p-6 flex flex-col">
              <span className="w-11 h-11 rounded-md border border-accent/40 bg-accent/10 flex items-center justify-center text-accent mb-5">
                <Gift size={19} />
              </span>
              <div className="font-heading text-lg tracking-[0.05em] text-foreground mb-2">{g.title}</div>
              <div className="font-mono text-[11px] text-muted-foreground mb-6 flex-1">
                PRIZE: <span className="text-accent">{g.prize}</span>
              </div>
              <div className="flex items-center gap-5 mb-5">
                <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                  <Users size={12} /> {counts[g.id].toLocaleString()} ENTRIES
                </span>
                <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                  <Timer size={12} /> ENDS IN {g.endsIn}
                </span>
              </div>
              <button
                onClick={() => toggleJoin(g)}
                className={`w-full font-mono text-[10px] tracking-[0.25em] py-3 rounded-sm border transition-colors ${
                  isIn
                    ? "border-accent/60 text-accent hover:bg-accent/10"
                    : "bg-primary text-primary-foreground border-primary hover:opacity-90"
                }`}
              >
                {isIn ? "ENTERED — WITHDRAW" : "ENTER GIVEAWAY"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Past winners */}
      <div className="glass-panel rounded-lg p-6">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5 flex items-center gap-2">
          <Trophy size={13} className="text-accent" /> PAST WINNERS
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {WINNERS.map((w, i) => (
            <div key={i} className="font-mono text-[11px] text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {w}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}