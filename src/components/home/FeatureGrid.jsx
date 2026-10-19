import React from "react";
import {
  Skull, Trophy, Target, Dices, ListChecks,
  Coins, Store, Gift, LifeBuoy,
} from "lucide-react";
import BannerCard from "@/components/home/BannerCard";

// Portal features grouped into sections, each hung as a heraldic banner
// carrying its own dinosaur artwork.
const SECTIONS = [
  {
    title: "Play & Compete",
    cols: "xl:grid-cols-4",
    items: [
      { icon: Skull, title: "Killfeed", desc: "Every kill from the last 24 hours.", to: "/killfeed", species: "Allosaurus" },
      { icon: Trophy, title: "Leaderboard", desc: "Kills, K/D and top players.", to: "/leaderboard", species: "Omniraptor" },
      { icon: Target, title: "Bounties", desc: "Put a price on a player's head.", to: "/bounties", species: "Carnotaurus" },
      { icon: Dices, title: "Casino", desc: "Slots and blackjack with Haven Tokens.", to: "/casino", species: "Dilophosaurus" },
    ],
  },
  {
    title: "Grow & Earn",
    cols: "xl:grid-cols-3",
    items: [
      { icon: ListChecks, title: "Quests", desc: "Daily, weekly and monthly quests.", to: "/quests", species: "Ceratosaurus" },
      { icon: Coins, title: "Wallet", desc: "Your Haven Tokens and full history.", to: "/wallet", species: "Deinosuchus" },
      { icon: Store, title: "Token shop", desc: "Titles, badges and rewards.", to: "/store", species: "Stegosaurus" },
    ],
  },
  {
    title: "Community",
    cols: "xl:grid-cols-2",
    items: [
      { icon: Gift, title: "Giveaways", desc: "Join draws and see past winners.", to: "/giveaways", species: "Pteranodon" },
      { icon: LifeBuoy, title: "Support", desc: "Reports, appeals and staff help.", to: "/tickets", species: "Maiasaura" },
    ],
  },
];

export default function FeatureGrid() {
  let banner = 0;
  return (
    <div className="space-y-8 mb-6">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          {/* Section header: divider with engraved label */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c98a5e]/50 to-transparent" />
            <h2 className="font-heading text-base font-bold text-foreground uppercase tracking-[0.3em] whitespace-nowrap">
              {section.title}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c98a5e]/50 to-transparent" />
          </div>
          <div className={`grid sm:grid-cols-2 ${section.cols} gap-5`}>
            {section.items.map((item) => (
              <BannerCard key={item.to} {...item} swayDelay={-(banner++) * 1.1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}