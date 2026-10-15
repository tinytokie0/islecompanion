import React, { useState } from "react";
import { ListChecks, Check } from "lucide-react";
import PageShell from "@/components/portal/PageShell";

const QUESTS = {
  daily: [
    { id: "d1", title: "Survive 30 minutes", progress: 30, target: 30, reward: "+150 XP" },
    { id: "d2", title: "Make 3 kills", progress: 1, target: 3, reward: "+250 XP" },
    { id: "d3", title: "Drink from 2 water sources", progress: 2, target: 2, reward: "+100 XP" },
    { id: "d4", title: "Growth: gain 5%", progress: 5, target: 5, reward: "+200 XP" },
  ],
  weekly: [
    { id: "w1", title: "Win 5 territorial fights", progress: 2, target: 5, reward: "+800 XP" },
    { id: "w2", title: "Reach sub-adult on any dino", progress: 1, target: 1, reward: "+500 XP" },
    { id: "w3", title: "Complete 10 daily quests", progress: 6, target: 10, reward: "+1,000 XP" },
  ],
  monthly: [
    { id: "m1", title: "Reach prime on any dino", progress: 0, target: 1, reward: "+3,000 XP" },
    { id: "m2", title: "Collect 20,000 shards", progress: 12400, target: 20000, reward: "+2,500 XP" },
    { id: "m3", title: "Win a bounty kill", progress: 1, target: 1, reward: "+1,500 XP" },
  ],
};

const TABS = [
  { id: "daily", label: "DAILY" },
  { id: "weekly", label: "WEEKLY" },
  { id: "monthly", label: "MONTHLY" },
];

export default function Quests() {
  const [tab, setTab] = useState("daily");
  const [claimed, setClaimed] = useState(["d1", "d3"]);
  const [xpData, setXpData] = useState({ daily: 0, weekly: 0, monthly: 0 });

  const quests = QUESTS[tab];

  const claim = (q) => {
    if (q.progress < q.target || claimed.includes(q.id)) return;
    setClaimed((prev) => [...prev, q.id]);
    setXpData((prev) => ({ ...prev, [tab]: prev[tab] + parseInt(q.reward.replace(/[^0-9]/g, ""), 10) }));
  };

  return (
    <PageShell
      kicker="HUNTING CONTRACTS"
      title="QUESTS"
      sub="Complete daily, weekly and monthly quests for XP and rewards."
      right={
        <div className="glass-panel-light px-4 py-2 w-fit">
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">XP EARNED </span>
          <span className="font-mono text-xs text-accent">
            {(xpData.daily + xpData.weekly + xpData.monthly).toLocaleString()}
          </span>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-mono text-[10px] tracking-[0.2em] px-5 py-2 rounded-sm border transition-colors ${
              tab === t.id
                ? "bg-primary text-primary-foreground border-primary"
                : "text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-lg divide-y divide-border/60">
        {quests.map((q) => {
          const done = q.progress >= q.target;
          const isClaimed = claimed.includes(q.id);
          return (
            <div key={q.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="w-9 h-9 rounded-md border border-primary/40 bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ListChecks size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-foreground tracking-wide mb-2">{q.title}</div>
                <div className="h-1.5 bg-secondary overflow-hidden rounded-sm max-w-md">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (q.progress / q.target) * 100)}%`,
                      backgroundColor: done ? "#e6b84c" : "#a78bfa",
                    }}
                  />
                </div>
                <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em] mt-1">
                  {q.progress.toLocaleString()} / {q.target.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-[10px] tracking-[0.15em] text-accent">{q.reward}</span>
                {isClaimed ? (
                  <span className="font-mono text-[9px] tracking-[0.2em] text-accent flex items-center gap-1.5">
                    <Check size={12} /> CLAIMED
                  </span>
                ) : (
                  <button
                    onClick={() => claim(q)}
                    disabled={!done}
                    className={`font-mono text-[9px] tracking-[0.2em] px-4 py-2 border rounded-sm transition-colors ${
                      done
                        ? "border-primary/40 text-primary hover:bg-primary/10"
                        : "border-border text-muted-foreground/50 cursor-not-allowed"
                    }`}
                  >
                    {done ? "CLAIM" : "LOCKED"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}