import React from "react";
import { Image } from "@/components/ui/image";

const RAPTOR =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/4916924f5_generated_image.png";
const REX =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0ebeb4c44_generated_image.png";
const SPINO =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/6d43fcb89_generated_image.png";

// Eight raptors peek out from behind the page cards in a wave, then dash off.
const RAPTORS = [
  { left: "4%",  anim: "side-raptor-1", size: 100 },
  { left: "16%", anim: "side-raptor-2", size: 90 },
  { left: "27%", anim: "side-raptor-3", size: 110 },
  { left: "39%", anim: "side-raptor-4", size: 95 },
  { left: "51%", anim: "side-raptor-5", size: 105 },
  { left: "62%", anim: "side-raptor-6", size: 90 },
  { left: "74%", anim: "side-raptor-7", size: 108 },
  { left: "86%", anim: "side-raptor-8", size: 96 },
];

/**
 * Choreographed edge dinosaurs for the portal, one full 90s cycle:
 * 1. A spinosaurus walks across the bottom, right to left.
 * 2. A T-rex follows, walking left to right.
 * 3. Eight raptors peek up from behind the page cards, then run off screen.
 * The walkers sit above the content; the raptors sit behind the cards so
 * they genuinely peek out from behind them.
 */
export default function SideDinos() {
  return (
    <>
      {/* Walkers: above the content */}
      <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
        <div
          className="absolute side-spino"
          style={{ left: "100%", bottom: 0, width: 300 }}
        >
          <Image
            src={SPINO}
            alt=""
            className="w-full walk-bob"
            fittingType="fit"
            style={{ mixBlendMode: "screen" }}
          />
        </div>
        <div
          className="absolute side-rex"
          style={{ left: -340, bottom: 0, width: 340 }}
        >
          <Image
            src={REX}
            alt=""
            className="w-full walk-bob-slow"
            fittingType="fit"
            style={{ transform: "scaleX(-1)", mixBlendMode: "screen" }}
          />
        </div>
      </div>

      {/* Raptors: behind the cards, peeking from the bottom edge */}
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        {RAPTORS.map((raptor, i) => (
          <div
            key={i}
            className={`absolute bottom-0 ${raptor.anim}`}
            style={{ left: raptor.left, width: raptor.size }}
          >
            <Image
              src={RAPTOR}
              alt=""
              className="w-full"
              fittingType="fit"
              style={{ mixBlendMode: "screen" }}
            />
          </div>
        ))}
      </div>
    </>
  );
}