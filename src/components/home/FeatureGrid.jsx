import React from "react";
import {
  Skull, Trophy, Target, Dices, ListChecks,
  Coins, Store, Gift, LifeBuoy,
} from "lucide-react";
import DinoFeatureCard from "@/components/home/DinoFeatureCard";

// Portal features grouped into sections; each card carries a different
// dinosaur artwork from the Haven key art set.
const SECTIONS = [
  {
    title: "Play & Compete",
    items: [
      { icon: Skull, title: "Killfeed", desc: "Every kill from the last 24 hours.", to: "/killfeed", species: "Allosaurus" },
      { icon: Trophy, title: "Leaderboard", desc: "Kills, K/D and top players.", to: "/leaderboard", species: "Omniraptor" },
      { icon: Target, title: "Bounties", desc: "Put a price on a player's head.", to: "/bounties", species: "Carnotaurus" },
      { icon: Dices, title: "Casino", desc: "Slots and blackjack with Haven Tokens.", to: "/casino", species: "Dilophosaurus" },
    ],
  },
  {
    title: "Grow & Earn",
    items: [
      { icon: ListChecks, title: "Quests", desc: "Daily, weekly and monthly quests.", to: "/quests", species: "Ceratosaurus" },
      { icon: Coins, title: "Wallet", desc: "Your Haven Tokens and full history.", to: "/wallet", species: "Deinosuchus" },
      { icon: Store, title: "Token shop", desc: "Titles, badges and rewards.", to: "/store", species: "Stegosaurus" },
    ],
  },
  {
    title: "Community",
    items: [
      { icon: Gift, title: "Giveaways", desc: "Join draws and see past winners.", to: "/giveaways", species: "Pteranodon" },
      { icon: LifeBuoy, title: "Support", desc: "Reports, appeals and staff help.", to: "/tickets", species: "Maiasaura" },
    ],
  },
];

export default function FeatureGrid() {
  return (
    <div className="space-y-10 mb-10">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-heading text-lg font-bold text-foreground uppercase tracking-[0.18em] whitespace-nowrap">
              {section.title}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent" />
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {section.items.map((item) => (
              <DinoFeatureCard key={item.to} {...item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}