import React, { useState, useEffect } from "react";

const DINOS = [
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/3b098226a_generated_image.png", // raptor
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/5bb64b0e0_generated_image.png", // t-rex
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0d11f57e0_generated_image.png", // carnotaurus
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/b547f70ea_generated_image.png", // spinosaurus
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/b4308e1c5_generated_image.png", // allosaurus
];

// Screen blend drops the dark photo backdrop into the dark page, and a soft
// mask feathers the remaining edges so the dino melts out of the darkness
const EDGE_FADE = {
  mixBlendMode: "screen",
  maskImage: "radial-gradient(ellipse 68% 64% at 42% 50%, black 45%, transparent 85%)",
  WebkitMaskImage: "radial-gradient(ellipse 68% 64% at 42% 50%, black 45%, transparent 85%)",
};

const SLOTS = [
  { side: "left", top: "24%", size: "w-52 md:w-80", anim: "side-dino-creep-1", tilt: "-rotate-3" },
  { side: "left", top: "60%", size: "w-44 md:w-64", anim: "side-dino-creep-2", tilt: "rotate-2" },
  { side: "right", top: "18%", size: "w-48 md:w-72", anim: "side-dino-creep-3", tilt: "rotate-3" },
  { side: "right", top: "56%", size: "w-52 md:w-80", anim: "side-dino-creep-4", tilt: "-rotate-2" },
];

// Longest lurker cycle, so image swaps happen while the dino is off-screen
const RESHUFFLE_MS = 35000;

function freshDeck() {
  return [...DINOS].sort(() => Math.random() - 0.5);
}

function randomFlips() {
  return SLOTS.map(() => Math.random() < 0.5);
}

export default function SideDinos() {
  // Random dino + random flip per slot, re-rolled every app load and reshuffled periodically
  const [deck, setDeck] = useState(freshDeck);
  const [flips, setFlips] = useState(randomFlips);
  useEffect(() => {
    const t = setInterval(() => {
      setDeck(freshDeck());
      setFlips(randomFlips());
    }, RESHUFFLE_MS);
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
              key={deck[i] + String(flips[i])}
              src={deck[i]}
              alt=""
              className={`${size} h-auto ${flips[i] ? "-scale-x-100" : ""}`}
              style={EDGE_FADE}
            />
          </div>
        </div>
      ))}
    </div>
  );
}