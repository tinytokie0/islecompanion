import React from "react";
import { Image } from "@/components/ui/image";

const DINOS = [
  {
    src: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/4916924f5_generated_image.png",
    side: "left",
    top: "18%",
    size: 220,
    anim: "side-dino-grip-1",
  },
  {
    src: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0ebeb4c44_generated_image.png",
    side: "right",
    top: "38%",
    size: 280,
    anim: "side-dino-grip-2",
  },
  {
    src: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/87f968b9f_generated_image.png",
    side: "left",
    top: "58%",
    size: 200,
    anim: "side-dino-grip-3",
  },
  {
    src: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/6d43fcb89_generated_image.png",
    side: "right",
    top: "8%",
    size: 240,
    anim: "side-dino-grip-4",
  },
];

/**
 * Photorealistic dinosaurs that haul themselves over the edges of the page,
 * cling for a moment, lose their grip and drop back out of view. Rendered
 * above the site content, purely decorative and non-interactive.
 */
export default function SideDinos() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {DINOS.map((dino, i) => (
        <div
          key={i}
          className={`absolute ${dino.anim}`}
          style={{
            top: dino.top,
            [dino.side]: 0,
            width: dino.size,
          }}
        >
          <Image
            src={dino.src}
            alt=""
            className="w-full opacity-70"
            fittingType="fit"
            style={{
              transform: dino.side === "right" ? "scaleX(-1)" : undefined,
              mixBlendMode: "screen",
            }}
          />
        </div>
      ))}
    </div>
  );
}