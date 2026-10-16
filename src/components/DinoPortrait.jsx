import React from "react";
import { Image } from "@/components/ui/image";
import { dinoArtFor } from "@/lib/dinoArt";

// Realistic dino key art for display cards: fills its container and reacts
// when hovered — the dino lunges forward with a quick scale-up and a pink glow.
export default function DinoPortrait({ species, className = "" }) {
  return (
    <div className={`dino-group ${className}`}>
      <Image
        src={dinoArtFor(species)}
        fittingType="fill"
        className="w-full h-full dino-react"
        alt={species || "Dinosaur"}
      />
    </div>
  );
}