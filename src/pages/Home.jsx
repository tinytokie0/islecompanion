import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import SteamLinkCard from "@/components/SteamLinkCard";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-12 md:py-20">
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto">
        <div className="font-mono text-[10px] tracking-[0.3em] text-primary mb-4">
          THE ISLE COMPANION
        </div>
        <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground tracking-wide mb-4">
          Welcome to The Haven
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
          Your companion for The Isle. Link your Steam account to get started,
          then track your life on the island as features come online.
        </p>
        {!isAuthenticated && (
          <Button asChild className="font-mono text-xs font-bold tracking-[0.2em] uppercase">
            <Link to="/login">Sign in to begin</Link>
          </Button>
        )}
      </section>

      {/* Steam account */}
      <section className="mt-12 md:mt-16 glass-panel rounded-lg p-6 md:p-8">
        <SteamLinkCard />
      </section>
    </div>
  );
}