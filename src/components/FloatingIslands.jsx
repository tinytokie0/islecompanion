import React from "react";

const ISLANDS = [
  { id: 1, top: "10%", left: "5%", w: 150, delay: "0s", dur: "9s" },
  { id: 2, top: "16%", right: "8%", w: 110, delay: "1.6s", dur: "11s" },
  { id: 3, top: "58%", left: "10%", w: 95, delay: "3.2s", dur: "10s" },
  { id: 4, top: "60%", right: "5%", w: 160, delay: "0.9s", dur: "12s" },
];

function Island({ w }) {
  return (
    <svg viewBox="0 0 100 120" style={{ width: w }} className="h-auto">
      <defs>
        <linearGradient id="rockGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b2d63" />
          <stop offset="100%" stopColor="#171233" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="crysGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      {/* Stalactite base */}
      <path d="M 50 22 L 14 55 L 28 100 L 42 82 L 52 110 L 64 88 L 86 55 Z" fill="url(#rockGrad)" />
      {/* Floating surface */}
      <ellipse cx="50" cy="22" rx="42" ry="10" fill="#2a2050" />
      <ellipse cx="50" cy="21" rx="42" ry="9" fill="#3f2f70" />
      {/* Crystals */}
      <polygon points="50,4 58,22 42,22" fill="url(#crysGrad)" className="animate-crystal" />
      <polygon points="68,12 74,24 62,24" fill="url(#crysGrad)" className="animate-crystal" style={{ animationDelay: "1s" }} />
      <polygon points="34,14 40,25 28,25" fill="url(#crysGrad)" className="animate-crystal" style={{ animationDelay: "2s" }} />
      {/* Glow base */}
      <ellipse cx="50" cy="60" rx="18" ry="30" fill="#67e8f9" opacity="0.06" />
    </svg>
  );
}

export default function FloatingIslands() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {ISLANDS.map((island) => (
        <div
          key={island.id}
          className="absolute animate-float-slow opacity-60"
          style={{
            top: island.top,
            left: island.left,
            right: island.right,
            animationDelay: island.delay,
            animationDuration: island.dur,
          }}
        >
          <Island w={island.w} />
        </div>
      ))}
    </div>
  );
}