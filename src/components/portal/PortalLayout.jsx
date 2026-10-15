import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home, Gift, UserPlus, MapPin, Map as MapIcon, Skull, Trophy, Target,
  LifeBuoy, FileText, Package, PackageOpen, Bone, Sprout, ArrowLeftRight, LogIn,
} from "lucide-react";
import { Image } from "@/components/ui/image";

const LOGO = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/30f2f6cc9_logo.png";

const LINKS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Giveaways", to: "/giveaways", icon: Gift },
  { label: "Invite Friends", to: "/referral", icon: UserPlus },
  { label: "Teleports", to: "/teleport", icon: MapPin },
  { label: "Live Map", to: "/map", icon: MapIcon },
  { label: "Killfeed", to: "/killfeed", icon: Skull },
  { label: "Leaderboard", to: "/leaderboard", icon: Trophy },
  { label: "Bounties", to: "/bounties", icon: Target },
  { label: "Support", to: "/tickets", icon: LifeBuoy },
  { label: "Apply", to: "/apply", icon: FileText },
  { label: "Dino Packs", to: "/packs", icon: Package },
  { label: "Reward Packs", to: "/claim", icon: PackageOpen },
  { label: "Carcass Drop", to: "/carcass", icon: Bone },
  { label: "Growth", to: "/growth", icon: Sprout },
  { label: "Trading", to: "/trading", icon: ArrowLeftRight },
];

function Navbar() {
  const { pathname } = useLocation();
  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center h-14">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 px-4 md:px-6 shrink-0">
          <Image src={LOGO} alt="The Haven" className="w-7 h-7" fittingType="fit" />
          <span className="font-heading text-sm tracking-[0.15em] text-foreground hidden sm:block">
            THE HAVEN
          </span>
        </Link>
        {/* Links */}
        <nav className="flex-1 flex items-center gap-1 overflow-x-auto hide-scrollbar px-2">
          {LINKS.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] px-3 py-2 rounded-sm whitespace-nowrap transition-colors ${
                isActive(to)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={13} />
              {label.toUpperCase()}
            </Link>
          ))}
        </nav>
        {/* Sign in */}
        <Link
          to="/login"
          className="shrink-0 flex items-center gap-2 mx-4 font-mono text-[10px] tracking-[0.15em] bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:opacity-90 transition-opacity"
        >
          <LogIn size={13} />
          SIGN IN
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  const cols = [
    {
      title: "MODULES",
      links: [
        { label: "Live Map", to: "/map" },
        { label: "Leaderboard", to: "/leaderboard" },
        { label: "Trading", to: "/trading" },
        { label: "Growth", to: "/growth" },
      ],
    },
    {
      title: "COMMUNITY",
      links: [
        { label: "Giveaways", to: "/giveaways" },
        { label: "Bounties", to: "/bounties" },
        { label: "Support", to: "/tickets" },
        { label: "Apply", to: "/apply" },
      ],
    },
  ];
  return (
    <footer className="border-t border-border mt-8">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-12 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src={LOGO} alt="The Haven" className="w-8 h-8" fittingType="fit" />
            <span className="font-heading text-lg tracking-[0.12em] text-foreground">THE HAVEN</span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground leading-relaxed max-w-xs">
            Realm telemetry, specimen vaults and crystal ateliers for the Isle
            community, all in one place.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <div className="font-mono text-[10px] tracking-[0.25em] text-primary mb-4">{col.title}</div>
            <div className="flex flex-col gap-2">
              {col.links.map((l) => (
                <Link key={l.to} to={l.to} className="font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors w-fit">
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
          <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
            POWERED BY CRYSTAL VAULTS
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />
      <main className="pt-14">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}