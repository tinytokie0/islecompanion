import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DailyClaimCard from "@/components/wallet/DailyClaimCard";

// CGW-style daily claim card for the home page: guests get a sign-in prompt,
// signed-in players get the real claim card with countdown and claim button.
export default function HomeDailyClaim() {
  const [authed, setAuthed] = useState(null); // null = checking

  useEffect(() => {
    let alive = true;
    base44.auth.isAuthenticated().then((ok) => { if (alive) setAuthed(ok); }).catch(() => { if (alive) setAuthed(false); });
    return () => { alive = false; };
  }, []);

  if (authed === null) {
    return <div className="glass-panel rounded-xl p-6 h-full animate-pulse" />;
  }

  if (!authed) {
    return (
      <div className="glass-panel rounded-xl p-6 h-full flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-3">
            <CalendarCheck size={12} className="text-primary" /> DAILY CLAIM
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Free Haven Tokens once a day for signed-in players.
          </p>
        </div>
        <Link
          to="/login?returnTo=%2F"
          className="shrink-0 flex items-center justify-center gap-2 border border-border bg-secondary/60 text-foreground text-sm font-semibold px-5 py-3 rounded-md hover:border-primary/60 hover:text-primary transition-colors"
        >
          Sign in to claim
        </Link>
      </div>
    );
  }

  return <DailyClaimCard />;
}