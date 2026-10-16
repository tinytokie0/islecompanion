import React from "react";
import { Link } from "react-router-dom";
import { Coins, Loader2, Radio } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import TransactionTable from "@/components/wallet/TransactionTable";
import DailyClaimCard from "@/components/wallet/DailyClaimCard";
import useWallet from "@/hooks/useWallet";

export default function Wallet() {
  const { loading, wallet, config, earn, daily_claim, error, refresh } = useWallet();

  const interval = earn?.interval_minutes || 30;
  const progress =
    earn && earn.fresh && earn.next_in_minutes != null
      ? Math.max(0, Math.min(1, 1 - earn.next_in_minutes / interval))
      : 0;

  const earnStatus = () => {
    if (!earn) return null;
    if (!earn.enabled) {
      return { tone: "text-amber-400", text: "Playtime rewards are currently paused by staff." };
    }
    if (!earn.tracked) {
      return {
        tone: "text-muted-foreground",
        text: "Link your Steam account from the home page and spawn in on the server to start earning.",
      };
    }
    if (!earn.fresh) {
      return { tone: "text-amber-400", text: "Live feed is stale — earning is paused until fresh server data arrives." };
    }
    return {
      tone: "text-emerald-400",
      text:
        earn.next_in_minutes === 0
          ? `Next award is due on the next server sweep (every 5 minutes).`
          : `Next award in about ${earn.next_in_minutes} min.`,
    };
  };

  const status = earnStatus();

  return (
    <PageShell
      kicker="HAVEN TOKENS"
      title="WALLET"
      sub="Your Haven Tokens balance, earning progress and full transaction history."
      right={
        <Link
          to="/store"
          className="font-mono text-[10px] tracking-[0.2em] border border-primary/40 text-primary px-4 py-2 rounded-sm hover:bg-primary/10 transition-colors whitespace-nowrap"
        >
          SPEND HT
        </Link>
      }
    >
      {loading ? (
        <div className="glass-panel rounded-lg p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> OPENING WALLET...
        </div>
      ) : error ? (
        <div className="glass-panel rounded-lg p-10 text-center font-mono text-xs text-destructive">
          {error.toUpperCase()}
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            {/* Balance */}
            <div className="glass-panel rounded-lg p-6 md:p-8">
              <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
                AVAILABLE BALANCE
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Coins size={26} className="text-primary" />
                <span className="font-heading text-5xl font-bold text-foreground">
                  {wallet?.balance ?? 0}
                </span>
                <span className="font-mono text-xs tracking-[0.2em] text-primary">HT</span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed mt-4">
                HAVEN TOKENS. BALANCES ONLY CHANGE THROUGH VERIFIED SERVER-SIDE
                REWARDS, PURCHASES AND STAFF ADJUSTMENTS.
              </p>
            </div>

            {/* Earning */}
            <div className="glass-panel rounded-lg p-6 md:p-8 flex flex-col">
              <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
                EARNING RULE
              </div>
              <div className="flex items-center gap-2 font-heading text-xl text-foreground mb-4">
                <Radio size={16} className="text-primary" />
                {config?.coins_per_interval ?? 10} HT per {config?.interval_minutes ?? 30} min
              </div>
              <div className="h-1.5 bg-secondary rounded-sm overflow-hidden mb-3">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              {status && (
                <p className={`font-mono text-[11px] leading-relaxed ${status.tone}`}>
                  {status.text.toUpperCase()}
                </p>
              )}
            </div>
          </div>

          <DailyClaimCard dailyClaim={daily_claim} onClaimed={refresh} />

          <TransactionTable />
        </>
      )}
    </PageShell>
  );
}