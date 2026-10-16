import React, { useState } from "react";
import { Coins, Crown, Lock, Check } from "lucide-react";
import PageShell from "@/components/portal/PageShell";
import useWallet from "@/hooks/useWallet";

const XP_MAX = 500;

const TIERS = Array.from({ length: 10 }, (_, i) => {
  const tier = i + 1;
  return {
    tier,
    free: ["500 HT", "Mossback Skin", "Teleport Voucher", "750 HT", "Ember Stripe", "Reward Pack", "1,000 HT", "Gilded Scales", "Carcass Beacon", "Mythic Pack"][i],
    premium: ["1,000 HT", "Amethyst Veil", "2x XP Weekend", "1,500 HT", "Abyss Watcher", "Apex Pack", "2,500 HT", "Blood Moon", "Prismatic", "Legendary Dino"][i],
  };
});

export default function Battlepass() {
  // Level and XP now come from the real wallet: XP is earned by claiming quests.
  const { wallet } = useWallet(60000);
  const totalXp = wallet?.xp || 0;
  const LEVEL = Math.floor(totalXp / XP_MAX) + 1;
  const XP = totalXp % XP_MAX;
  const [claimedFree, setClaimedFree] = useState([1, 2]);
  const [claimedPremium, setClaimedPremium] = useState([2]);

  const claimFree = (tier) => {
    if (LEVEL < tier || claimedFree.includes(tier)) return;
    setClaimedFree((prev) => [...prev, tier]);
  };
  const claimPremium = (tier) => {
    if (LEVEL < tier || claimedPremium.includes(tier)) return;
    setClaimedPremium((prev) => [...prev, tier]);
  };

  return (
    <PageShell
      kicker="SEASON 3 — EMBERFALL"
      title="BATTLEPASS"
      sub="Level the season pass and claim free and premium rewards."
      right={
        <div className="glass-panel-light px-4 py-2 w-fit">
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">SEASON ENDS IN </span>
          <span className="font-mono text-xs text-accent">26D 11H</span>
        </div>
      }
    >
      {/* Level bar */}
      <div className="glass-panel rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center text-primary">
              <Crown size={18} />
            </span>
            <div>
              <div className="font-heading text-2xl text-foreground">LEVEL {LEVEL}</div>
              <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
                {XP} / {XP_MAX} XP TO LEVEL {LEVEL + 1}
              </div>
            </div>
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] text-accent">PREMIUM ACTIVE</span>
        </div>
        <div className="h-2 bg-secondary overflow-hidden rounded-sm">
          <div className="h-full bg-primary transition-all" style={{ width: `${(XP / XP_MAX) * 100}%` }} />
        </div>
      </div>

      {/* Tiers */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {TIERS.map(({ tier, free, premium }) => {
          const reached = LEVEL >= tier;
          const freeDone = claimedFree.includes(tier);
          const premDone = claimedPremium.includes(tier);
          return (
            <div key={tier} className={`glass-panel rounded-lg p-4 ${tier === LEVEL ? "border-primary/50" : ""}`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`font-mono text-[10px] tracking-[0.2em] ${reached ? "text-primary" : "text-muted-foreground"}`}>
                  TIER {tier}
                </span>
                {!reached && <Lock size={11} className="text-muted-foreground/50" />}
              </div>
              {/* Free reward */}
              <button
                onClick={() => claimFree(tier)}
                disabled={!reached || freeDone}
                className={`w-full text-left border rounded-sm p-3 mb-2 transition-colors ${
                  freeDone
                    ? "border-accent/60 bg-accent/5"
                    : reached
                      ? "border-border hover:border-primary/40"
                      : "border-border/60 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="font-mono text-[8px] tracking-[0.2em] text-muted-foreground mb-1">FREE</div>
                <div className="font-mono text-[11px] text-foreground flex items-center justify-between gap-2">
                  {free}
                  {freeDone && <Check size={12} className="text-accent shrink-0" />}
                </div>
              </button>
              {/* Premium reward */}
              <button
                onClick={() => claimPremium(tier)}
                disabled={!reached || premDone}
                className={`w-full text-left border rounded-sm p-3 transition-colors ${
                  premDone
                    ? "border-primary/60 bg-primary/5"
                    : reached
                      ? "border-primary/30 hover:border-primary/60"
                      : "border-border/60 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="font-mono text-[8px] tracking-[0.2em] text-primary mb-1">PREMIUM</div>
                <div className="font-mono text-[11px] text-foreground flex items-center justify-between gap-2">
                  {premium}
                  {premDone && <Check size={12} className="text-primary shrink-0" />}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}