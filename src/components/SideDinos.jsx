import React from "react";

// Stylized raptor silhouette (faces left; mirrored for the right side)
function DinoSilhouette({ className }) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <path
        d="M18 34 Q10 30 12 24 Q20 20 32 26 Q48 20 66 30 Q84 42 104 50
           Q130 52 160 40 Q178 32 192 34 Q180 44 168 48 Q140 62 118 66
           Q112 84 116 100 L124 124 L112 126 L102 100 Q90 96 78 98
           L74 124 L62 124 L64 98 Q52 90 48 76 Q36 70 26 60 Q16 48 18 34 Z"
        className="fill-[#0c1128]"
        style={{ filter: "drop-shadow(0 0 10px rgba(167, 139, 250, 0.25))" }}
      />
      <circle cx="26" cy="28" r="3" className="fill-accent animate-crystal" />
    </svg>
  );
}

const LURKERS = [
  // Left side: slow peek
  { side: "left", top: "30%", size: "w-32 md:w-44", anim: "side-dino-peek-1", tilt: "-rotate-3" },
  // Left side: occasional quick dart (the little jumpscare)
  { side: "left", top: "62%", size: "w-24 md:w-32", anim: "side-dino-lunge-l", tilt: "rotate-2" },
  // Right side: mirrored
  { side: "right", top: "22%", size: "w-28 md:w-40", anim: "side-dino-peek-r", tilt: "rotate-3" },
  { side: "right", top: "58%", size: "w-32 md:w-44", anim: "side-dino-peek-r2", tilt: "-rotate-2" },
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
            <DinoSilhouette className={`${size} h-auto ${side === "right" ? "-scale-x-100" : ""}`} />
          </div>
        </div>
      ))}
    </div>
  );
}