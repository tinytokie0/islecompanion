import React from "react";
import { Outlet, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import StatusStrip from "@/components/portal/StatusStrip";
import DiscordIcon from "@/components/DiscordIcon";

const LOGO = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d4ae5dc23_TheHaven_CrystalDinosaurCrest.png";
const JUNGLE_BG = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d7754492b_generated_image.png";

const NAV_GROUPS = [
  {
    label: "Play",
    items: [
      { label: "Live map", to: "/map" },
      { label: "Killfeed", to: "/killfeed" },
      { label: "Leaderboard", to: "/leaderboard" },
      { label: "Bounties", to: "/bounties" },
      { label: "Teleports", to: "/teleport" },
    ],
  },
  {
    label: "My Dino",
    items: [
      { label: "Overview", to: "/me" },
      { label: "Garage", to: "/garage" },
      { label: "Skin editor", to: "/skin" },
      { label: "Skin shop", to: "/skinshop" },
      { label: "Growth", to: "/growth" },
      { label: "Carcass drop", to: "/carcass" },
    ],
  },
  {
    label: "Rewards",
    items: [
      { label: "Reward packs", to: "/claim" },
      { label: "Battlepass", to: "/battlepass" },
      { label: "Quests", to: "/quests" },
      { label: "Dino packs", to: "/packs" },
      { label: "Invite friends", to: "/referral" },
      { label: "Giveaways", to: "/giveaways" },
    ],
  },
  {
    label: "Market",
    items: [
      { label: "Dino shop", to: "/shop" },
      { label: "Trading", to: "/trading" },
      { label: "Casino", to: "/casino" },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Support tickets", to: "/tickets" },
      { label: "Staff applications", to: "/apply" },
    ],
  },
];

function Navbar() {
  const { isAuthenticated } = useAuth();
  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-[#0c0c0f]/95 backdrop-blur-md border-b border-border">
      <div className="max-w-[1500px] mx-auto flex items-center gap-3 px-4 md:px-6 h-14">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <Image src={LOGO} alt="The Haven" className="w-7 h-7" fittingType="fit" />
          <span className="font-heading font-bold text-[15px] text-foreground hidden sm:block">
            The Haven
          </span>
        </Link>
        <nav className="flex-1 flex items-center gap-0.5 overflow-x-auto hide-scrollbar min-w-0">
          {NAV_GROUPS.map((group) => (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary data-[state=open]:text-foreground data-[state=open]:bg-secondary whitespace-nowrap">
                {group.label}
                <ChevronDown size={14} className="opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 border-border bg-popover">
                {group.items.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Join our Discord"
            className="w-9 h-9 rounded-md bg-[#5865F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          >
            <DiscordIcon className="w-4 h-4" />
          </a>
          <Link
            to={isAuthenticated ? "/me" : "/login"}
            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {isAuthenticated ? "My dino" : "Sign in"}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const cols = [
    {
      title: "Play",
      links: [
        { label: "Live Map", to: "/map" },
        { label: "Killfeed", to: "/killfeed" },
        { label: "Leaderboard", to: "/leaderboard" },
        { label: "Bounties", to: "/bounties" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Support Tickets", to: "/tickets" },
        { label: "Staff Applications", to: "/apply" },
        { label: "Giveaways", to: "/giveaways" },
        { label: "Invite Friends", to: "/referral" },
      ],
    },
  ];
  return (
    <footer className="border-t border-border mt-10 relative z-10 bg-[#0c0c0f]/70">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-12 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Image src={LOGO} alt="The Haven" className="w-9 h-9" fittingType="fit" />
            <span className="font-heading font-bold text-foreground">THE HAVEN</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Live map, specimen vaults, skins and rewards for the Haven community,
            all in one place.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
              {col.title.toUpperCase()}
            </div>
            <div className="flex flex-col gap-2">
              {col.links.map((l) => (
                <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row justify-between gap-2">
          <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
            © 2026 THE HAVEN — FAN COMPANION, NOT AFFILIATED WITH THE ISLE
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed jungle backdrop */}
      <div className="fixed inset-0 z-0">
        <Image src={JUNGLE_BG} alt="" className="w-full h-full" fittingType="fill" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      <Navbar />
      <StatusStrip />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}