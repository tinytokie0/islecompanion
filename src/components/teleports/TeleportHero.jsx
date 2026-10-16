import React from "react";
import { MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";

const KEY_ART = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/9f0ddaf0f_79baba85-cefc-4a35-8c70-bc181598d114.png";

// Full-bleed cinematic hero for the Teleports page, styled after the
// Cretaceous Gone Wild teleport page: tall jungle banner, centered icon tile,
// title and sub.
export default function TeleportHero({ sub, right }) {
  return (
    <section className="relative h-[420px] md:h-[480px] overflow-hidden border-b border-border">
      <Image src={KEY_ART} alt="" className="absolute inset-0 w-full h-full" fittingType="fill" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/25 to-background" />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <span className="w-14 h-14 rounded-xl bg-primary/15 backdrop-blur-sm border border-primary/30 text-primary flex items-center justify-center mb-4">
          <MapPin size={22} />
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2.5">
          Teleports
        </h1>
        {sub && (
          <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed mb-5">
            {sub}
          </p>
        )}
        {right}
      </div>
    </section>
  );
}