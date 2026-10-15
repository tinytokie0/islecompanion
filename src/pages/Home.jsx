import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Warehouse, Crown, ListChecks, Dices, ShoppingBag, Palette, Brush,
  Zap, Map as MapIcon, UserPlus, Target, Megaphone, X, ArrowRight, LogIn,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import HeroDino from "@/components/HeroDino";

const HERO_BG =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/046e1d3f5_79baba85-cefc-4a35-8c70-bc181598d114.png";

const RAPTOR_STRIP =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/834bf9921_generated_image.png";

const FEATURES = [
  { icon: Sparkles, title: "Your dino", desc: "See your current dinosaur with skin, stats and prime status.", to: "/me" },
  { icon: Warehouse, title: "Your garage", desc: "View and manage your parked dinos.", to: "/garage" },
  { icon: Crown, title: "Battlepass", desc: "Level the season pass and claim free and premium rewards.", to: "/battlepass" },
  { icon: ListChecks, title: "Quests", desc: "Complete daily, weekly and monthly quests for XP and rewards.", to: "/quests" },
  { icon: Dices, title: "Casino", desc: "Slots, all-or-nothing and blackjack with your shards.", to: "/casino" },
  { icon: ShoppingBag, title: "Dino shop", desc: "Buy dinos with your shards, sent to your garage.", to: "/shop" },
  { icon: Palette, title: "Skin shop", desc: "Buy skins and apply them to your dino in-game.", to: "/skinshop" },
  { icon: Brush, title: "Skin editor", desc: "Recolor regions, pick patterns and apply skins in-game.", to: "/skin" },
  { icon: Zap, title: "Teleports", desc: "Teleport to locations set up by the admins, or to a friend.", to: "/teleport" },
  { icon: MapIcon, title: "Live map", desc: "See live player positions, your friends and named places.", to: "/map" },
  { icon: UserPlus, title: "Invite friends", desc: "Bring a new player and you both get a reward.", to: "/referral" },
  { icon: Target, title: "Bounties", desc: "Put a price on a player's head. Kill the target to collect.", to: "/bounties" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [bannerOpen, setBannerOpen] = useState(true);

  return (
    <div className="relative z-10 px-6 md:px-10 py-10 md:py-14 max-w-[1500px] mx-auto">
      {/* Hero card */}
      <div className="relative rounded-lg overflow-hidden glass-panel mb-6">
        <div className="absolute inset-0">
          <Image src={HERO_BG} alt="" className="w-full h-full animate-ken-burns" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/10" />
        </div>
        <div className="relative p-8 md:p-14 max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.3em] text-accent mb-4 block">
            THE HAVEN
          </span>
          <h1 className="font-heading text-3xl md:text-5xl tracking-[0.05em] text-foreground text-glow mb-4">
            Manage your dinos and skins
          </h1>
          <p className="font-mono text-xs md:text-sm text-muted-foreground tracking-wide leading-relaxed mb-8">
            View your garage, design custom dino skins and apply them in-game,
            all from one place.
          </p>
          <Link
            to={isAuthenticated ? "/garage" : "/login"}
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] bg-primary text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            <LogIn size={14} />
            {isAuthenticated ? "OPEN GARAGE" : "SIGN IN"}
          </Link>
        </div>
        {/* Bobbing T-rex illustration */}
        <HeroDino />
      </div>

      {/* Raptor pack illustration strip */}
      <div className="relative rounded-lg overflow-hidden glass-panel mb-6 h-40 md:h-56">
        <Image
          src={RAPTOR_STRIP}
          alt="A pack of realistic velociraptors in the misty jungle"
          className="absolute inset-0 w-full h-full"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-4 left-6 font-mono text-[10px] tracking-[0.3em] text-accent">
          THE VALLEY PACK ROAMS
        </div>
      </div>

      {/* Discord banner */}
      {bannerOpen && (
        <div className="glass-panel rounded-lg p-5 mb-6 flex items-start gap-4">
          <span className="text-2xl shrink-0">📢</span>
          <div className="flex-1">
            <div className="font-mono text-xs tracking-[0.15em] text-foreground mb-1">
              JOIN OUR DISCORD
            </div>
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              Join the community for events, giveaways, server updates and
              support!{" "}
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                discord.com
              </a>
            </p>
          </div>
          <button
            onClick={() => setBannerOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Feature grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc, to }) => (
          <Link
            key={to}
            to={to}
            className="glass-panel rounded-lg p-6 flex flex-col hover:border-primary/40 transition-colors group"
          >
            <span className="w-11 h-11 rounded-md border border-primary/40 bg-primary/10 flex items-center justify-center text-primary mb-5">
              <Icon size={20} />
            </span>
            <span className="font-heading text-lg tracking-[0.05em] text-foreground mb-2">
              {title}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground leading-relaxed mb-5 flex-1">
              {desc}
            </span>
            <span className="font-mono text-[11px] tracking-[0.15em] text-accent flex items-center gap-2">
              OPEN
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}