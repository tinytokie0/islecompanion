import React, { useState, useEffect } from "react";

const DINOS = [
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/3b098226a_generated_image.png", // raptor
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/5bb64b0e0_generated_image.png", // t-rex
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0d11f57e0_generated_image.png", // carnotaurus
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/b547f70ea_generated_image.png", // spinosaurus
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/b4308e1c5_generated_image.png", // allosaurus
];

// Each slot grips its edge and climbs in. Dinos always face inward: the
// source art faces left, so left-edge dinos are mirrored, right-edge aren't.
const SLOTS = [
  { side: "left", top: "24%", size: "w-52 md:w-80", anim: "side-dino-grip-1", tilt: "-rotate-3", mirror: true },
  { side: "left", top: "60%", size: "w-44 md:w-64", anim: "side-dino-grip-2", tilt: "rotate-2", mirror: true },
  { side: "right", top: "18%", size: "w-48 md:w-72", anim: "side-dino-grip-3", tilt: "rotate-3", mirror: false },
  { side: "right", top: "56%", size: "w-52 md:w-80", anim: "side-dino-grip-4", tilt: "-rotate-2", mirror: false },
];

// Longest climb cycle, so image swaps happen while the dino is off-screen
const RESHUFFLE_MS = 35000;

// Key out the dark photo backdrop: near-black pixels go fully transparent,
// with a short ramp so the creature keeps soft, shadowed edges
async function stripBackground(url) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const lum = Math.max(px[i], px[i + 1], px[i + 2]);
    if (lum <= 18) px[i + 3] = 0;
    else if (lum < 44) px[i + 3] = Math.round(((lum - 18) / 26) * 255);
  }
  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL("image/png");
}

function freshDeck() {
  return [...DINOS].sort(() => Math.random() - 0.5);
}

export default function SideDinos() {
  // Random dino per slot, re-rolled every app load and reshuffled periodically
  const [deck, setDeck] = useState(freshDeck);
  // Transparent versions of each dino, keyed once per URL
  const [cutouts, setCutouts] = useState({});

  useEffect(() => {
    const t = setInterval(() => setDeck(freshDeck()), RESHUFFLE_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;
    deck.forEach((url) => {
      if (cutouts[url]) return;
      stripBackground(url)
        .then((dataUrl) => {
          if (alive) setCutouts((prev) => ({ ...prev, [url]: dataUrl }));
        })
        .catch(() => {});
    });
    return () => {
      alive = false;
    };
  }, [deck]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {SLOTS.map(({ side, top, size, anim, tilt, mirror }, i) => (
        <div
          key={i}
          className={`absolute ${side === "left" ? "left-0" : "right-0"} ${anim}`}
          style={{ top }}
        >
          <div className={`${tilt} animate-dino-bob`}>
            <img
              key={deck[i]}
              src={cutouts[deck[i]] || deck[i]}
              alt=""
              className={`${size} h-auto ${mirror ? "-scale-x-100" : ""}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}