import React from "react";
import { Image } from "@/components/ui/image";
import { dinoArtFor } from "@/lib/dinoArt";

// Living-portrait dino art for display cards: fills its container, drifts
// slowly even at rest, and on hover the dino lunges forward with a pink
// glow and a light sweep across the frame.
export default function DinoPortrait({ species, className = "" }) {
  return (
    <div className={`dino-group dino-live ${className}`}>
      <Image
        src={dinoArtFor(species)}
        fittingType="fill"
        className="w-full h-full dino-react"
        alt={species || "Dinosaur"}
      />
      <div className="dino-sheen" />
    </div>
  );
}