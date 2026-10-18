import React from "react";
import { Megaphone, ExternalLink } from "lucide-react";
import { Image } from "@/components/ui/image";
import SteamLinkCard from "@/components/SteamLinkCard";
import { dinoArtFor } from "@/lib/dinoArt";

// Single home-page box holding everything a player needs to connect:
// Steam linking, the Discord community and the Arkanis panel link.
export default function CommunityBox() {
  return (
    <div className="group relative rounded-xl overflow-hidden border border-border transition-all duration-300 hover:border-[rgba(230,184,76,0.65)] hover:shadow-[0_0_36px_rgba(230,184,76,0.22)]">
      {/* Cinematic backdrop: Deinosuchus key art behind a dark wash */}
      <div className="absolute inset-0">
        <Image
          src={dinoArtFor("Deinosuchus")}
          alt=""
          className="w-full h-full opacity-60 saturate-[0.9] transition-all duration-500 group-hover:opacity-80 group-hover:saturate-100"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090c]/95 via-[#09090c]/75 to-[#09090c]/35" />
      </div>

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-5 p-4 md:p-5">
        {/* Steam linking */}
        <div className="flex-1 min-w-0">
          <SteamLinkCard />
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px self-stretch bg-white/10" />
        <div className="lg:hidden h-px bg-white/10" />

        {/* Discord */}
        <div className="lg:w-56 shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Megaphone size={12} className="text-accent" />
            <span className="font-mono text-[9px] tracking-[0.25em] text-accent">COMMUNITY</span>
          </div>
          <h3 className="font-heading text-base font-bold text-foreground mb-1 tracking-wide">
            Join our Discord
          </h3>
          <a
            href="https://discord.gg/4EMZ62VyD"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary hover:underline"
          >
            discord.gg/4EMZ62VyD
          </a>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px self-stretch bg-white/10" />
        <div className="lg:hidden h-px bg-white/10" />

        {/* Arkanis */}
        <div className="lg:w-48 shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <ExternalLink size={12} className="text-accent" />
            <span className="font-mono text-[9px] tracking-[0.25em] text-accent">SERVER PANEL</span>
          </div>
          <a
            href="https://arkanis.gg/dashboard/405418368334561281/panels/isle"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 border border-white/15 bg-white/5 text-foreground text-xs font-semibold px-4 py-2.5 rounded-md hover:border-primary/60 hover:text-primary transition-colors whitespace-nowrap"
          >
            Arkanis panel
          </a>
        </div>
      </div>
    </div>
  );
}