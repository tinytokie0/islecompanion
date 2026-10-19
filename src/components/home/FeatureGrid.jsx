import React from "react";
import {
  Skull, Trophy, Target, Dices, ListChecks,
  Coins, Store, Gift, LifeBuoy,
} from "lucide-react";
import LinkPill from "@/components/home/LinkPill";

// Portal features grouped CGW-style: a small caps section label above a grid
// of compact link pills.
const SECTIONS = [
  {
    title: "Play",
    items: [
      { icon: Skull, title: "Killfeed", desc: "Every kill from the last 24 hours.", to: "/killfeed" },
      { icon: Trophy, title: "Leaderboard", desc: "Kills, K/D and top players.", to: "/leaderboard" },
      { icon: Target, title: "Bounties", desc: "Put a price on a player's head.", to: "/bounties" },
    ],
  },
  {
    title: "Rewards",
    items: [
      { icon: ListChecks, title: "Quests", desc: "Daily, weekly and monthly quests.", to: "/quests" },
      { icon: Dices, title: "Casino", desc: "Slots and blackjack with Haven Tokens.", to: "/casino" },
      { icon: Coins, title: "Wallet", desc: "Your Haven Tokens and full history.", to: "/wallet" },
      { icon: Store, title: "Token shop", desc: "Titles, badges and rewards.", to: "/store" },
    ],
  },
  {
    title: "Community",
    items: [
      { icon: Gift, title: "Giveaways", desc: "Join draws and see past winners.", to: "/giveaways" },
      { icon: LifeBuoy, title: "Support", desc: "Reports, appeals and staff help.", to: "/tickets" },
    ],
  },
];

export default function FeatureGrid() {
  return (
    <div className="space-y-8 mb-6">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground uppercase mb-3">
            {section.title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {section.items.map((item) => (
              <LinkPill key={item.to} {...item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}