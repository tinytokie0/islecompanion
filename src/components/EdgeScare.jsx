import React, { useState } from "react";
import { Image } from "@/components/ui/image";

const DINOS = [
  {
    img: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/4916924f5_generated_image.png",
    size: 250,
  },
  {
    img: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0ebeb4c44_generated_image.png",
    size: 310,
  },
  {
    img: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/6d43fcb89_generated_image.png",
    size: 270,
  },
];

// Randomized on every page load: which dino, which side, which way it faces,
// how big and how long before it lunges in.
function buildScares() {
  const pool = [...DINOS].sort(() => Math.random() - 0.5);
  const slots = [
    { side: "left", top: "20%" },
    { side: "right", top: "46%" },
    { side: Math.random() > 0.5 ? "left" : "right", top: "68%" },
  ];
  return slots.map((slot, i) => ({
    ...slot,
    ...pool[i],
    size: Math.round(pool[i].size + (Math.random() * 60 - 30)),
    flip: Math.random() > 0.5 ? -1 : 1,
    delay: 3 + i * 4 + Math.random() * 6,
    idle: 3 + Math.random() * 3,
  }));
}

/**
 * Side-of-screen jumpscare dinos. Randomized per load, each one lunges in
 * from the left or right edge after a short delay, overshoots slightly and
 * then idles with a subtle breathing bob. Screen blending plus a contrast
 * boost keeps the artwork solid and real-looking with no dark box behind it.
 */
export default function EdgeScare() {
  const [scares] = useState(buildScares);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {scares.map((scare, i) => (
        <div
          key={i}
          className={`absolute ${scare.side === "left" ? "left-0 scare-in-left" : "right-0 scare-in-right"}`}
          style={{ top: scare.top, width: scare.size, animationDelay: `${scare.delay}s` }}
        >
          <div style={{ transform: `scaleX(${scare.flip})` }}>
            <Image
              src={scare.img}
              alt=""
              className="w-full scare-idle"
              fittingType="fit"
              style={{
                mixBlendMode: "screen",
                filter: "contrast(1.3) saturate(1.2) brightness(1.05)",
                animationDuration: `${scare.idle}s`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}