import React, { useEffect, useState } from "react";
import { ListChecks, Check, Coins, Zap, Loader2, Link2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageShell from "@/components/portal/PageShell";

const TABS = [
  { id: "daily", label: "DAILY" },
  { id: "weekly", label: "WEEKLY" },
  { id: "monthly", label: "MONTHLY" },
];

export default function Quests() {
  const [tab, setTab] = useState("daily");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const [claimError, setClaimError] = useState(null);

  const load = async () => {
    try {
      const res = await base44.functions.invoke("questGetState", {});
      setData(res.data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const claim = async (q) => {
    setClaiming(q.id);
    setClaimError(null);
    try {
      const res = await base44.functions.invoke("questClaim", { quest_id: q.id });
      setData((prev) => prev && ({
        ...prev,
        wallet: res.data.wallet,
        quests: prev.quests.map((x) => (x.id === q.id ? { ...x, claimed: true, progress: res.data.quest.progress } : x)),
      }));
    } catch (e) {
      setClaimError(e.message);
    }
    setClaiming(null);
  };

  const quests = (data?.quests || []).filter((q) => q.cadence === tab);
  const wallet = data?.wallet;
  const totalXp = wallet?.xp || 0;

  return (
    <PageShell
      kicker="HUNTING CONTRACTS"
      title="QUESTS"
      sub="Progress comes from your live feed sightings on the island: time survived, growth gained and days played. Claim rewards in Haven Tokens and XP."
      right={
        <div className="flex gap-2">
          <div className="glass-panel-light px-4 py-2 w-fit">
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">BALANCE </span>
            <span className="font-mono text-xs text-primary">{(wallet?.balance ?? 0).toLocaleString()} HT</span>
          </div>
          <div className="glass-panel-light px-4 py-2 w-fit">
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">TOTAL XP </span>
            <span className="font-mono text-xs text-accent">{totalXp.toLocaleString()}</span>
          </div>
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
        <button
          onClick={load}
          disabled={loading}
          className="font-mono text-[10px] tracking-[0.2em] px-4 py-2 rounded-sm border border-border text-muted-foreground hover:text-foreground flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> REFRESH
        </button>
      </div>

      {loading ? (
        <div className="glass-panel rounded-lg p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> LOADING QUESTS...
        </div>
      ) : error ? (
        <div className="glass-panel rounded-lg p-10 text-center font-mono text-xs text-destructive">
          {error}
        </div>
      ) : !data.linked ? (
        <div className="glass-panel rounded-lg p-10 flex flex-col items-center gap-4 text-center">
          <Link2 size={24} className="text-primary" />
          <div>
            <div className="font-heading text-lg text-foreground mb-1">LINK STEAM TO TRACK QUESTS</div>
            <p className="font-mono text-[11px] text-muted-foreground max-w-md leading-relaxed">
              Quest progress is measured from your live in-game feed: time on the
              island, growth gained and days played. Link your Steam account to
              start earning.
            </p>
          </div>
          <Link
            to="/"
            className="font-mono text-[10px] tracking-[0.2em] border border-primary/40 text-primary px-4 py-2 rounded-sm hover:bg-primary/10 transition-colors"
          >
            LINK STEAM ON THE HOME PAGE
          </Link>
        </div>
      ) : (
        <div className="glass-panel rounded-lg divide-y divide-border/60">
          {quests.map((q) => {
            const done = q.progress >= q.target;
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
                    {Math.min(q.progress, q.target).toLocaleString()} / {q.target.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-[10px] tracking-[0.15em] flex items-center gap-2">
                    <span className="text-primary flex items-center gap-1"><Coins size={11} /> +{q.tokens} HT</span>
                    <span className="text-accent flex items-center gap-1"><Zap size={11} /> +{q.xp.toLocaleString()} XP</span>
                  </span>
                  {q.claimed ? (
                    <span className="font-mono text-[9px] tracking-[0.2em] text-accent flex items-center gap-1.5">
                      <Check size={12} /> CLAIMED
                    </span>
                  ) : claiming === q.id ? (
                    <Loader2 size={14} className="animate-spin text-muted-foreground" />
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
          {claimError && (
            <div className="p-4 font-mono text-[10px] text-destructive tracking-wide">{claimError}</div>
          )}
        </div>
      )}
    </PageShell>
  );
}