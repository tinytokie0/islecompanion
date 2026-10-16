import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Map as MapIcon, Skull, Trophy, Target, MapPin, Warehouse, Sprout, Bone, Brush,
  Palette, PackageOpen, Crown, ListChecks, Package, UserPlus, Gift,
  ShoppingBag, ArrowLeftRight, Dices, LifeBuoy, FileText, Dna, Coins, Store,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import DiscordIcon from "@/components/DiscordIcon";
import SteamLinkCard from "@/components/SteamLinkCard";
import useArkaniStatus from "@/hooks/useArkaniStatus";

const LOGO = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d4ae5dc23_TheHaven_CrystalDinosaurCrest.png";

const CATEGORIES = [
  {
    label: "Play",
    items: [
      { icon: MapIcon, title: "Live Map", desc: "Places, friends and live players", to: "/map" },
      { icon: Skull, title: "Killfeed", desc: "Every kill from the last 24 hours", to: "/killfeed" },
      { icon: Trophy, title: "Leaderboard", desc: "Kills, K/D and top players", to: "/leaderboard" },
      { icon: Target, title: "Bounties", desc: "Put a price on a player", to: "/bounties" },
      { icon: MapPin, title: "Teleports", desc: "Paid jumps and friend codes", to: "/teleport" },
    ],
  },
  {
    label: "My Dino",
    items: [
      { icon: Dna, title: "Overview", desc: "Your dino, stats and skin", to: "/me" },
      { icon: Warehouse, title: "Garage", desc: "Park, restore and swap dinos", to: "/garage" },
      { icon: Sprout, title: "Growth", desc: "Track your dino's growth", to: "/growth" },
      { icon: Bone, title: "Carcass drop", desc: "Drop food next to your dino", to: "/carcass" },
      { icon: Brush, title: "Skin editor", desc: "Recolor and pattern your skins", to: "/skin" },
      { icon: Palette, title: "Skin shop", desc: "Buy skins for your dino", to: "/skinshop" },
    ],
  },
  {
    label: "Rewards",
    items: [
      { icon: PackageOpen, title: "Reward packs", desc: "Unlocked by time played", to: "/claim" },
      { icon: Crown, title: "Battlepass", desc: "Season levels, free and premium", to: "/battlepass" },
      { icon: ListChecks, title: "Quests", desc: "Daily, weekly and monthly goals", to: "/quests" },
      { icon: Package, title: "Dino packs", desc: "Bronze, Silver and Gold pulls", to: "/packs" },
      { icon: UserPlus, title: "Invite friends", desc: "You both get a reward", to: "/referral" },
      { icon: Gift, title: "Giveaways", desc: "Join draws, see past winners", to: "/giveaways" },
    ],
  },
  {
    label: "Market",
    items: [
      { icon: Coins, title: "Wallet", desc: "Your Haven Tokens and history", to: "/wallet" },
      { icon: Store, title: "Token shop", desc: "Spend Haven Tokens on rewards", to: "/store" },
      { icon: ShoppingBag, title: "Dino Shop", desc: "Dinos, straight to your garage", to: "/shop" },
      { icon: ArrowLeftRight, title: "Trading", desc: "Swap dinos and skins", to: "/trading" },
      { icon: Dices, title: "Casino", desc: "Slots, coinflip and blackjack", to: "/casino" },
    ],
  },
  {
    label: "Community",
    items: [
      { icon: LifeBuoy, title: "Support tickets", desc: "Reports, appeals and help", to: "/tickets" },
      { icon: FileText, title: "Staff applications", desc: "Apply for Admin or Mod", to: "/apply" },
    ],
  },
];

const JOIN_STEPS = [
  { title: "Sign in with Steam", desc: "This site knows who you are from your Steam account." },
  { title: "Join our Discord and link it", desc: "Some features unlock by Discord role. Link it on My account." },
  { title: "Find us in the game", desc: "In The Isle: Evrima, open the server browser and search for \u201CThe Haven\u201D." },
  { title: "Spawn in", desc: "Your dino shows up under My Dino as soon as you are in the game." },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const arkani = useArkaniStatus();
  const [players, setPlayers] = useState(null);

  useEffect(() => {
    if (arkani.authed) return; // live Arkanis status wins when available
    const load = async () => {
      try {
        const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        setPlayers(await base44.entities.LiveDino.count({ last_seen: { $gte: since } }));
      } catch {
        setPlayers(null);
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [arkani.authed]);

  const useArkani = arkani.authed && arkani.data?.configured;
  const serverOnline = useArkani ? arkani.data.online === true : null;
  const shownPlayers = useArkani && arkani.data.players != null ? arkani.data.players : players;
  const serverName = useArkani && arkani.data.server?.name ? arkani.data.server.name : "The Haven";

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1500px] mx-auto">
      {/* Steam linking */}
      <SteamLinkCard />

      {/* Hero + server status */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="relative rounded-xl border border-border bg-card overflow-hidden">
          <Image src={LOGO} alt="" className="absolute right-4 top-1/2 -translate-y-1/2 w-44 h-44 opacity-[0.12] pointer-events-none" fittingType="fit" />
          <div className="relative p-7 md:p-9">
            <span className="inline-block font-mono text-[10px] tracking-[0.2em] text-primary border border-primary/50 rounded px-2.5 py-1 mb-5">
              THE ISLE: EVRIMA COMMUNITY SERVER
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-3">
              The Haven
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md mb-7">
              Your dino, your DNA and everything you can do with them, in one
              place. Pick a menu at the top or jump in below.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                to={isAuthenticated ? "/me" : "/login"}
                className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Dna size={16} /> My dino
              </Link>
              <Link
                to="/map"
                className="border border-border text-foreground text-sm font-medium px-4 py-2.5 rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <MapIcon size={16} /> Live map
              </Link>
              <Link
                to="/shop"
                className="border border-border text-foreground text-sm font-medium px-4 py-2.5 rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <ShoppingBag size={16} /> Dino shop
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-7 md:p-9">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-4">
            <span className={`flex items-center gap-2 ${serverOnline === false ? "text-red-400" : "text-emerald-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${serverOnline === false ? "bg-red-400" : "bg-emerald-400"}`} />
              SERVER
            </span>
            <span>{serverName}</span>
          </div>
          <div className={`font-heading text-3xl font-bold mb-6 ${serverOnline === false ? "text-red-400" : "text-emerald-400"}`}>
            {useArkani && arkani.loading ? "…" : serverOnline === false ? "Offline" : "Online"}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Players</dt>
            <dd className="text-foreground font-medium">{shownPlayers === null || shownPlayers === undefined ? "—" : shownPlayers} on the island</dd>
            <dt className="text-muted-foreground">Map</dt>
            <dd className="text-foreground font-medium">Gateway</dd>
            <dt className="text-muted-foreground">Checked</dt>
            <dd className="text-foreground font-medium">just now</dd>
            <dt className="text-muted-foreground">You</dt>
            <dd className="text-foreground font-medium">{isAuthenticated ? "Signed in" : "Not signed in"}</dd>
          </dl>
        </div>
      </div>

      {/* Discord banner */}
      <div className="rounded-xl border border-[#5865F2]/40 bg-[#101222] p-6 md:p-7 mb-5 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-14 h-14 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0">
          <DiscordIcon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-xl font-bold text-foreground mb-1">Join our Discord</h2>
          <p className="text-sm text-muted-foreground mb-3">
            The Haven community lives there: events, giveaways, server news and
            help from staff.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Events", "Giveaways", "Server news", "Support"].map((chip) => (
              <span key={chip} className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
                {chip}
              </span>
            ))}
          </div>
        </div>
        <a
          href="https://discord.gg/4EMZ62VyD"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 bg-[#5865F2] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <DiscordIcon className="w-4 h-4" /> Join our Discord
        </a>
      </div>

      {/* How to join + Daily claim */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="rounded-xl border border-border bg-card p-7 md:p-8">
          <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">HOW TO JOIN</div>
          <ol className="flex flex-col gap-5">
            {JOIN_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="w-7 h-7 rounded-full bg-secondary text-foreground text-sm font-medium flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{step.title}</div>
                  <div className="text-sm text-muted-foreground">{step.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-border bg-card p-7 md:p-8 flex flex-col">
          <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">DAILY CLAIM</div>
          <p className="text-sm text-muted-foreground mb-6">Free DNA once a day for signed-in players.</p>
          <Link
            to={isAuthenticated ? "/claim" : "/login"}
            className="mt-auto self-start border border-border text-foreground text-sm font-medium px-4 py-2.5 rounded-md hover:bg-secondary transition-colors"
          >
            {isAuthenticated ? "Claim" : "Sign in to claim"}
          </Link>
        </div>
      </div>

      {/* Category grids */}
      {CATEGORIES.map((cat) => (
        <div key={cat.label} className="mt-8">
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">
            {cat.label.toUpperCase()}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {cat.items.map(({ icon: Icon, title, desc, to }) => (
              <Link
                key={to}
                to={to}
                className="rounded-lg border border-border bg-card/80 p-4 flex items-start gap-3 hover:border-primary/60 hover:bg-card transition-colors"
              >
                <span className="w-8 h-8 rounded-md bg-secondary text-primary flex items-center justify-center shrink-0">
                  <Icon size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground truncate">{title}</span>
                  <span className="block text-xs text-muted-foreground truncate">{desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}