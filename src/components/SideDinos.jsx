import React from "react";

const RAPTOR = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/3b098226a_generated_image.png";

// Fade every edge of the photo so the rectangle melts into the dark page
const EDGE_FADE = {
  maskImage: "radial-gradient(ellipse 62% 58% at 42% 50%, black 35%, transparent 72%)",
  WebkitMaskImage: "radial-gradient(ellipse 62% 58% at 42% 50%, black 35%, transparent 72%)",
};

const LURKERS = [
  // Left side: slow peek
  { side: "left", top: "26%", size: "w-48 md:w-72", anim: "side-dino-peek-1", tilt: "-rotate-3" },
  // Left side: occasional quick dart (the little jumpscare)
  { side: "left", top: "58%", size: "w-40 md:w-60", anim: "side-dino-lunge-l", tilt: "rotate-2" },
  // Right side: mirrored
  { side: "right", top: "18%", size: "w-44 md:w-64", anim: "side-dino-peek-r", tilt: "rotate-3" },
  { side: "right", top: "54%", size: "w-48 md:w-72", anim: "side-dino-peek-r2", tilt: "-rotate-2" },
];

export default function SideDinos() {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {LURKERS.map(({ side, top, size, anim, tilt }, i) => (
        <div
          key={i}
          className={`absolute ${side === "left" ? "left-0" : "right-0"} ${anim}`}
          style={{ top }}
        >
          <div className={`${tilt} animate-dino-bob`}>
            <img
              src={RAPTOR}
              alt=""
              className={`${size} h-auto ${side === "right" ? "-scale-x-100" : ""}`}
              style={EDGE_FADE}
            />
          </div>
        </div>
      ))}
    </div>
  );
}