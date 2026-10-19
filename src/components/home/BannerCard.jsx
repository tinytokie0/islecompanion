import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { dinoArtFor } from "@/lib/dinoArt";

// One portal feature card hung as a heraldic banner: a copper rod with gold
// finials, a swallowtail cloth carrying the dino key art, and an engraved
// gold frame. Hover tips the banner and kindles a golden glow.
export default function BannerCard({ icon: Icon, title, desc, to, species, swayDelay = 0 }) {
  return (
    <Link to={to} className="group block">
      {/* Hanging rod */}
      <div className="relative z-10 mx-3 h-2 rounded-full bg-gradient-to-r from-[#5a3b22] via-[#c98a5e] to-[#5a3b22] shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#e6b84c] to-[#8a5a2e] border border-[#e6b84c]/50" />
        <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#e6b84c] to-[#8a5a2e] border border-[#e6b84c]/50" />
      </div>

      {/* Banner cloth with swallowtail bottom */}
      <div
        className="banner-sway relative -mt-px mx-1 transition-all duration-300 group-hover:rotate-[0.8deg] group-hover:drop-shadow-[0_0_18px_rgba(230,184,76,0.35)]"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), 50% 100%, 0 calc(100% - 20px))",
          animationDelay: `${swayDelay}s`,
          transformOrigin: "top center",
        }}
      >
        {/* Dino key art backdrop */}
        <div className="absolute inset-0">
          <Image
            src={dinoArtFor(species)}
            alt=""
            className="w-full h-full opacity-75 saturate-[0.9] transition-all duration-500 group-hover:opacity-100 group-hover:saturate-100"
            fittingType="fill"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090c] via-[#09090c]/55 to-transparent" />
        </div>

        {/* Engraved gold frame */}
        <div className="absolute inset-x-3 top-3 bottom-6 border border-[#e6b84c]/25 rounded-sm pointer-events-none" />

        {/* Content */}
        <div className="relative flex flex-col h-60 px-6 pt-6 pb-10">
          <span className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center backdrop-blur-sm border border-primary/25 shrink-0">
            <Icon size={18} />
          </span>
          <h3 className="font-heading text-lg font-bold text-foreground mb-1 mt-auto tracking-wide text-center">
            {title}
          </h3>
          <div className="mx-auto my-2 h-px w-14 bg-[#e6b84c]/60" />
          <p className="text-xs text-muted-foreground leading-relaxed text-center">{desc}</p>
          <span className="mt-2 inline-flex items-center justify-center gap-1.5 font-mono text-[10px] font-semibold text-[#e6b84c] uppercase tracking-[0.25em]">
            Enter <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}