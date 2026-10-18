import React from "react";
import { Image } from "@/components/ui/image";

const CREST = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d4ae5dc23_TheHaven_CrystalDinosaurCrest.png";

// A small faceted crystal shard, lit in copper and gold.
function Crystal({ className, style }) {
  return (
    <svg viewBox="0 0 24 44" className={className} style={style} aria-hidden="true">
      <polygon points="12,2 21,14 12,42 3,14" fill="#c98a5e" opacity="0.85" />
      <polygon points="12,2 21,14 12,20 3,14" fill="#e6b84c" opacity="0.9" />
      <polygon points="12,2 12,20 3,14" fill="#f3d9a4" opacity="0.55" />
    </svg>
  );
}

// Medieval hero plaque: crest, engraved title, ornament divider and a
// tagline, flanked by slowly drifting crystal islands.
export default function HeroBanner() {
  return (
    <div className="relative text-center pt-10 pb-12 md:pt-14 md:pb-14 overflow-visible">
      {/* Crystal shards */}
      <Crystal className="absolute left-[4%] top-2 w-6 md:w-8 animate-float-slow animate-crystal hidden sm:block" />
      <Crystal className="absolute left-[10%] top-16 w-4 md:w-5 animate-float-slow animate-crystal hidden sm:block" style={{ animationDelay: "-3s" }} />
      <Crystal className="absolute right-[4%] top-2 w-6 md:w-8 animate-float-slow animate-crystal hidden sm:block" style={{ animationDelay: "-2s" }} />
      <Crystal className="absolute right-[10%] top-16 w-4 md:w-5 animate-float-slow animate-crystal hidden sm:block" style={{ animationDelay: "-5s" }} />

      {/* Crest */}
      <Image
        src={CREST}
        alt=""
        className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 animate-float-slow"
        fittingType="fit"
      />

      {/* Small caps kicker */}
      <div className="font-mono text-[10px] tracking-[0.45em] text-muted-foreground mb-3">
        THE ISLE COMPANION
      </div>

      {/* Engraved gold title */}
      <h1 className="font-heading text-5xl md:text-7xl font-black tracking-[0.1em] bg-gradient-to-b from-[#f3d9a4] via-[#e6b84c] to-[#c98a5e] bg-clip-text text-transparent text-glow leading-tight">
        THE HAVEN
      </h1>

      {/* Ornamental divider: line, diamond, line */}
      <div className="flex items-center justify-center gap-3 my-5">
        <span className="h-px w-24 md:w-40 bg-gradient-to-r from-transparent to-[#c98a5e]" />
        <span className="w-2.5 h-2.5 rotate-45 bg-[#e6b84c] shadow-[0_0_10px_rgba(230,184,76,0.7)]" />
        <span className="h-px w-24 md:w-40 bg-gradient-to-l from-transparent to-[#c98a5e]" />
      </div>

      <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
        A waystation for the island's fiercest survivors — killfeed, bounties,
        quests and a treasury of Haven Tokens, kept beneath the crystal spires.
      </p>
    </div>
  );
}