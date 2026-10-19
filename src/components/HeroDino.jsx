import React from "react";
import { Image } from "@/components/ui/image";

const REX_ART =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/4e4830384_generated_image.png";

export default function HeroDino() {
  return (
    <div className="hidden lg:block absolute bottom-0 right-0 w-72 xl:w-80 pointer-events-none select-none">
      <div className="animate-dino-bob">
        <div
          className="rounded-tl-xl overflow-hidden border-l border-t border-accent/40"
          style={{ boxShadow: "-20px -10px 60px rgba(230,184,76,0.12)" }}
        >
          <Image
            src={REX_ART}
            alt="Realistic Tyrannosaurus rex"
            className="w-full aspect-square"
            fittingType="fill"
          />
        </div>
      </div>
    </div>
  );
}