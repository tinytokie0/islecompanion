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

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-4 p-4 md:p-5">
        {/* Steam linking */}
        <div className="flex-1 min-w-0">
          <SteamLinkCard />
        </div>

        <div className="hidden lg:block w-px self-stretch bg-white/10" />

        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-60">
          {/* Discord */}
          <div className="flex items-start gap-3 flex-1">
            <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Megaphone size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading text-sm font-bold text-foreground mb-0.5">Join our Discord</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                Events, giveaways, updates and support.
              </p>
              <a
                href="https://discord.gg/4EMZ62VyD"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                discord.gg/4EMZ62VyD
              </a>
            </div>
          </div>

          {/* Arkanis */}
          <a
            href="https://arkanis.gg/dashboard/405418368334561281/panels/isle"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground text-xs font-semibold px-4 py-2.5 rounded-md hover:border-primary/60 hover:text-primary transition-colors whitespace-nowrap"
          >
            Arkanis panel <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}