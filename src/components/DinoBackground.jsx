import React from "react";
import { Image } from "@/components/ui/image";

const SCENE_BG =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/046e1d3f5_79baba85-cefc-4a35-8c70-bc181598d114.png";

const PTEROS = [
  { top: "14%", size: 46, cls: "animate-fly-1", opacity: 0.5 },
  { top: "32%", size: 30, cls: "animate-fly-2", opacity: 0.35 },
  { top: "62%", size: 38, cls: "animate-fly-3", opacity: 0.4 },
];

const FIREFLIES = [
  { left: "12%", top: "70%", cls: "animate-firefly", delay: "0s" },
  { left: "30%", top: "55%", cls: "animate-firefly-slow", delay: "-2s" },
  { left: "55%", top: "78%", cls: "animate-firefly", delay: "-3s" },
  { left: "72%", top: "48%", cls: "animate-firefly-slow", delay: "-6s" },
  { left: "88%", top: "66%", cls: "animate-firefly", delay: "-1s" },
  { left: "44%", top: "35%", cls: "animate-firefly-slow", delay: "-5s" },
];

function Ptero({ top, size, cls, opacity }) {
  return (
    <div
      className={`absolute ${cls} pointer-events-none`}
      style={{ top, left: 0, opacity }}
    >
      <svg
        width={size}
        height={size * 0.45}
        viewBox="0 0 64 30"
        className="animate-flap"
        style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}
      >
        <path
          d="M2 16 C10 4, 22 2, 30 12 C34 5, 46 3, 56 13 C48 12, 40 15, 33 22 C26 15, 12 18, 2 16 Z M31 12 L33 24 L35 27 L34 21 Z"
          fill="#1b1430"
          stroke="#e6b84c"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

export default function DinoBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Dimmed prehistoric scene */}
      <Image
        src={SCENE_BG}
        alt=""
        className="absolute inset-0 w-full h-full animate-ken-burns"
        fittingType="fill"
      />
      <div className="absolute inset-0 bg-background/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

      {/* Flying pterodactyls */}
      {PTEROS.map((p, i) => (
        <Ptero key={i} {...p} />
      ))}

      {/* Drifting fireflies */}
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full ${f.cls}`}
          style={{
            left: f.left,
            top: f.top,
            animationDelay: f.delay,
            backgroundColor: "#e6b84c",
            boxShadow: "0 0 10px 3px rgba(230, 184, 76, 0.55)",
          }}
        />
      ))}
    </div>
  );
}