import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { dinoArtFor } from "@/lib/dinoArt";

// One portal feature card with its own cinematic dino artwork as the
// backdrop. Hover brings the art to full brightness with a golden glow.
export default function DinoFeatureCard({ icon: Icon, title, desc, to, species }) {
  return (
    <Link
      to={to}
      className="group relative rounded-xl overflow-hidden border border-border transition-all duration-300 hover:border-[rgba(230,184,76,0.65)] hover:shadow-[0_0_30px_rgba(230,184,76,0.25)] hover:-translate-y-0.5"
    >
      <div className="absolute inset-0">
        <Image
          src={dinoArtFor(species)}
          alt=""
          className="w-full h-full opacity-75 saturate-[0.9] transition-all duration-500 group-hover:opacity-100 group-hover:saturate-100"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090c] via-[#09090c]/60 to-transparent" />
      </div>
      <div className="relative flex flex-col h-56 p-6">
        <span className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center backdrop-blur-sm border border-primary/25 shrink-0">
          <Icon size={18} />
        </span>
        <h3 className="font-heading text-lg font-bold text-foreground mb-1 mt-auto tracking-wide">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{desc}</p>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">
          Open <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}