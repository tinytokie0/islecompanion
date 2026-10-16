import React, { useState, useEffect } from "react";

const DINOS = [
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/3b098226a_generated_image.png", // raptor
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/5bb64b0e0_generated_image.png", // t-rex
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0d11f57e0_generated_image.png", // carnotaurus
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/b547f70ea_generated_image.png", // spinosaurus
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/b4308e1c5_generated_image.png", // allosaurus
];

// Fade every edge of the photo so the rectangle melts into the dark page
const EDGE_FADE = {
  maskImage: "radial-gradient(ellipse 62% 58% at 42% 50%, black 35%, transparent 72%)",
  WebkitMaskImage: "radial-gradient(ellipse 62% 58% at 42% 50%, black 35%, transparent 72%)",
};

const SLOTS = [
  { side: "left", top: "26%", size: "w-48 md:w-72", anim: "side-dino-peek-1", tilt: "-rotate-3" },
  { side: "left", top: "58%", size: "w-40 md:w-60", anim: "side-dino-lunge-l", tilt: "rotate-2" },
  { side: "right", top: "18%", size: "w-44 md:w-64", anim: "side-dino-peek-r", tilt: "rotate-3" },
  { side: "right", top: "54%", size: "w-48 md:w-72", anim: "side-dino-peek-r2", tilt: "-rotate-2" },
];

// Longest lurker cycle, so image swaps happen while the dino is off-screen
const RESHUFFLE_MS = 35000;

function shuffled() {
  return [...DINOS].sort(() => Math.random() - 0.5);
}

export default function SideDinos() {
  // Random dino per slot on load, reshuffled periodically
  const [deck, setDeck] = useState(shuffled);
  useEffect(() => {
    const t = setInterval(() => setDeck(shuffled()), RESHUFFLE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {SLOTS.map(({ side, top, size, anim, tilt }, i) => (
        <div
          key={i}
          className={`absolute ${side === "left" ? "left-0" : "right-0"} ${anim}`}
          style={{ top }}
        >
          <div className={`${tilt} animate-dino-bob`}>
            <img
              key={deck[i]}
              src={deck[i]}
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