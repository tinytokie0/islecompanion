import React from "react";
import { Link } from "react-router-dom";
import { ListChecks, Skull, Store, Loader2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import useServerLive from "@/hooks/useServerLive";

const CREST = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d4ae5dc23_TheHaven_CrystalDinosaurCrest.png";

// CGW-style landing row: a wide hero card (badge, engraved title, tagline,
// action buttons and a crest watermark) beside a live server status card.
export default function HomeHero() {
  const { isAuthenticated } = useAuth();
  const { online, players, maxPlayers, map, loading } = useServerLive();

  const actions = [
    { label: "Quests", icon: ListChecks, to: "/quests", primary: true },
    { label: "Killfeed", icon: Skull, to: "/killfeed" },
    { label: "Token shop", icon: Store, to: "/store" },
  ];

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-5 mb-5">
      {/* Hero card */}
      <div className="relative glass-panel rounded-xl p-7 md:p-9 overflow-hidden">
        {/* Crest watermark */}
        <Image
          src={CREST}
          alt=""
          className="absolute right-0 top-0 h-full w-auto opacity-15 pointer-events-none"
          fittingType="fit"
        />
        <div className="relative">
          <span className="inline-block font-mono text-[10px] tracking-[0.25em] text-primary border border-primary/50 bg-primary/10 rounded px-2.5 py-1 mb-4">
            THE ISLE: EVRIMA COMMUNITY SERVER
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-[0.06em] bg-gradient-to-b from-[#f3d9a4] via-[#e6b84c] to-[#c98a5e] bg-clip-text text-transparent text-glow leading-tight mb-3">
            The Haven
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed mb-6">
            Your dino, your tokens and everything happening on the island, in one
            place. Pick a menu at the top or jump in below.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {actions.map(({ label, icon: Icon, to, primary }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-md transition-all ${
                  primary
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-secondary/60 text-foreground hover:border-primary/60 hover:text-primary"
                }`}
              >
                <Icon size={15} /> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Live server card */}
      <div className="glass-panel rounded-xl p-6 flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
            <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-400" : "bg-red-400"}`} />
            SERVER
          </div>
          <span className="font-mono text-xs text-foreground truncate">The Haven</span>
        </div>

        <div className={`font-heading text-2xl font-bold mb-4 ${online ? "text-emerald-400" : "text-red-400"}`}>
          {loading ? <Loader2 size={20} className="animate-spin text-muted-foreground" /> : online ? "Online" : "Offline"}
        </div>

        <div className="grid grid-cols-1 gap-2.5 font-mono text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Players</span>
            <span className="text-foreground">
              {players === null || players === undefined ? "—" : players}
              {maxPlayers ? ` / ${maxPlayers}` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Map</span>
            <span className="text-foreground">{map}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">You</span>
            <span className="text-foreground">{isAuthenticated ? "Signed in" : "Not signed in"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}