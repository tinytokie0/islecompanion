import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import SteamLinkCard from "@/components/SteamLinkCard";
import FeatureGrid from "@/components/home/FeatureGrid";
import { Image } from "@/components/ui/image";

const KEY_ART = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/9f0ddaf0f_79baba85-cefc-4a35-8c70-bc181598d114.png";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [showDiscord, setShowDiscord] = useState(true);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1500px] mx-auto">
      {/* Home backdrop: The Haven key art */}
      <div className="fixed inset-0 -z-10">
        <Image src={KEY_ART} alt="" className="w-full h-full" fittingType="fill" />
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background" />
      </div>

      {/* Hero */}
      <div className="rounded-xl border border-border bg-card/70 backdrop-blur-md p-8 md:p-12 mb-5">
        <span className="font-heading text-sm font-semibold tracking-[0.2em] text-primary uppercase mb-4 block">
          The Haven
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-3">
          Manage your dinos and skins
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mb-7">
          View your garage, design custom dino skins and apply them in-game, all
          from one place.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          {isAuthenticated ? "Enter the portal" : "Sign in"}
        </Link>
      </div>

      {/* Discord banner */}
      {showDiscord && (
        <div className="relative rounded-xl border border-border bg-card/70 backdrop-blur-md p-6 md:p-7 mb-8 flex items-start gap-5">
          <span className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Megaphone size={22} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-xl font-bold text-foreground mb-1">Join our Discord</h2>
            <p className="text-sm text-muted-foreground">
              Join the Haven community for events, giveaways, server updates and
              support!{" "}
              <a
                href="https://discord.gg/4EMZ62VyD"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                discord.gg/4EMZ62VyD
              </a>
            </p>
          </div>
          <button
            onClick={() => setShowDiscord(false)}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Feature grid */}
      <FeatureGrid />

      {/* Steam linking */}
      <div className="mb-6">
        <SteamLinkCard />
      </div>
    </div>
  );
}