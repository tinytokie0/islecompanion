import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home as HomeIcon, Skull, Trophy, Target, Dices,
  ArrowLeftRight, Coins, ChevronDown, PackageOpen,
  Crown, ListChecks, Gift, Store, LifeBuoy
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import StatusStrip from "@/components/portal/StatusStrip";
import EconomyChips from "@/components/portal/EconomyChips";
import DiscordIcon from "@/components/DiscordIcon";

const LOGO = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d4ae5dc23_TheHaven_CrystalDinosaurCrest.png";
const JUNGLE_BG = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d8aef576a_generated_image.png";

const NAV_LINKS = [
  { label: "Home", to: "/", icon: HomeIcon },
  { label: "Killfeed", to: "/killfeed", icon: Skull },
  { label: "Leaderboard", to: "/leaderboard", icon: Trophy },
  { label: "Bounties", to: "/bounties", icon: Target },
  { label: "Battlepass", to: "/battlepass", icon: Crown },
  { label: "Quests", to: "/quests", icon: ListChecks },
  { label: "Casino", to: "/casino", icon: Dices },
  { label: "Trading", to: "/trading", icon: ArrowLeftRight },
  { label: "Wallet", to: "/wallet", icon: Coins },
];
const MORE_LINKS = [
  { label: "Giveaways", to: "/giveaways", icon: Gift },
  { label: "Token shop", to: "/store", icon: Store },
  { label: "Support", to: "/tickets", icon: LifeBuoy },
];

function NavPill({ to, icon: Icon, label }) {
  const { pathname } = useLocation();
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon size={12} /> {label}
    </Link>
  );
}

function Navbar() {
  const { isAuthenticated } = useAuth();
  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-[#0c0c0f]/95 backdrop-blur-md border-b border-border">
      <div className="max-w-[1500px] mx-auto flex items-center gap-2 px-4 md:px-6 py-2">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <Image src={LOGO} alt="The Haven" className="w-7 h-7" fittingType="fit" />
          <span className="font-heading font-bold text-[15px] uppercase text-foreground hidden sm:block">
            The Haven
          </span>
        </Link>
        <div className="flex-1 min-w-0" />
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <EconomyChips />
          <div className="flex items-center gap-0.5 rounded-lg glass-panel px-1.5 py-1 flex-wrap">
            {NAV_LINKS.map((item) => (
              <NavPill key={item.to} {...item} />
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-2.5 py-1.5 rounded-md font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground hover:bg-secondary data-[state=open]:text-foreground data-[state=open]:bg-secondary whitespace-nowrap">
                <PackageOpen size={12} /> More
                <ChevronDown size={12} className="opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 border-border bg-popover">
                {MORE_LINKS.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="w-px h-5 bg-border mx-1" />
            <a
              href="https://discord.gg/4EMZ62VyD"
              target="_blank"
              rel="noreferrer"
              aria-label="Join our Discord"
              className="w-8 h-8 rounded-md bg-[#5865F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            >
              <DiscordIcon className="w-3.5 h-3.5" />
            </a>
            <Link
              to="/"
              className="bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap ml-1"
            >
              {isAuthenticated ? "Enter" : "Sign in with Steam"}
            </Link>
          </div>
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
        { label: "Killfeed", to: "/killfeed" },
        { label: "Leaderboard", to: "/leaderboard" },
        { label: "Bounties", to: "/bounties" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Support Tickets", to: "/tickets" },
        { label: "Giveaways", to: "/giveaways" },
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
        <div className="absolute inset-0 bg-background/45" />
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