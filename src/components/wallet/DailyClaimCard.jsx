import React, { useEffect, useState } from "react";
import { CalendarCheck, Coins, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const pad = (n) => String(n).padStart(2, "0");

// Daily claim card: 3,000 HT once every 24 hours. Shows the next available
// claim time with a live countdown and keeps the button disabled until the
// player is eligible again.
export default function DailyClaimCard({ dailyClaim, onClaimed }) {
  const [info, setInfo] = useState(dailyClaim || null);
  const [claiming, setClaiming] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => setInfo(dailyClaim || null), [dailyClaim]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const amount = info?.amount ?? 3000;
  const nextAt = info?.next_available_at ? new Date(info.next_available_at).getTime() : 0;
  const eligible = info ? info.eligible : true;
  const remaining = Math.max(0, nextAt - now);
  const countdown = `${pad(Math.floor(remaining / 3600000))}:${pad(
    Math.floor((remaining % 3600000) / 60000)
  )}:${pad(Math.floor((remaining % 60000) / 1000))}`;

  const claim = async () => {
    setClaiming(true);
    setFeedback(null);
    try {
      const res = await base44.functions.invoke("economyClaimDaily", {});
      const data = res.data || {};
      setInfo({
        eligible: false,
        amount: data.amount ?? amount,
        next_available_at: data.next_available_at,
      });
      setFeedback({ ok: true, text: `+${data.amount ?? amount} HT CLAIMED — NEXT CLAIM IN 24 HOURS` });
      if (onClaimed) onClaimed();
    } catch (e) {
      const err = e?.response?.data || {};
      if (err.next_available_at) {
        setInfo({ eligible: false, amount, next_available_at: err.next_available_at });
      }
      setFeedback({ ok: false, text: err.error || e.message });
    }
    setClaiming(false);
  };

  return (
    <div className="glass-panel rounded-lg p-6 md:p-8 mb-6 flex flex-col md:flex-row md:items-center gap-6">
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-3">
          DAILY CLAIM
        </div>
        <div className="flex items-center gap-3 font-heading text-xl md:text-2xl text-foreground mb-3">
          <Coins size={20} className="text-primary" />
          {amount.toLocaleString()} HT every 24 hours
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
          {eligible
            ? "READY TO CLAIM — ONE CLAIM PER PLAYER EVERY 24 HOURS."
            : `NEXT CLAIM AVAILABLE IN ${countdown}.`}
        </p>
        {feedback && (
          <p className={`font-mono text-[10px] mt-2 leading-relaxed ${feedback.ok ? "text-emerald-400" : "text-destructive"}`}>
            {feedback.text.toUpperCase()}
          </p>
        )}
      </div>
      <button
        onClick={claim}
        disabled={!eligible || claiming || !info}
        className={`shrink-0 flex items-center justify-center gap-2 text-sm font-medium px-5 py-3 rounded-md transition-opacity ${
          eligible && !claiming
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-border text-muted-foreground cursor-not-allowed"
        }`}
      >
        {claiming ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
        {claiming ? "CLAIMING..." : eligible ? `CLAIM ${amount.toLocaleString()} HT` : "ALREADY CLAIMED"}
      </button>
    </div>
  );
}