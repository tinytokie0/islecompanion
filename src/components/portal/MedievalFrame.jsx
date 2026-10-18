import React from "react";

const COPPER = "#c98a5e";
const GOLD = "#e6b84c";

// One ornate corner flourish, reused for all four corners via rotation
function CornerOrnament({ className, style }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`absolute w-16 h-16 md:w-24 md:h-24 ${className}`}
      style={style}
      fill="none"
      aria-hidden="true"
    >
      {/* curling filigree vine */}
      <path
        d="M4 4 h30 M4 4 v30 M4 4 c0 14 10 22 22 22 M4 4 c14 0 22 10 22 22"
        stroke={COPPER}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* inner scroll curls */}
      <path
        d="M14 14 c10 2 14 8 14 16 c-8 0 -14 -4 -16 -14 M14 14 c-2 10 -8 14 -16 14 c0 -8 4 -14 14 -16"
        stroke={GOLD}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* small leaf flourishes */}
      <path
        d="M30 8 c6 0 10 3 12 8 M8 30 c0 6 3 10 8 12"
        stroke={GOLD}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* corner gem */}
      <circle cx="6" cy="6" r="3.2" fill={GOLD} stroke={COPPER} strokeWidth="1" />
    </svg>
  );
}

export default function MedievalFrame() {
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none select-none" aria-hidden="true">
      {/* outer forged-metal line */}
      <div
        className="absolute inset-0"
        style={{
          border: `3px solid ${COPPER}`,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 0 24px rgba(201,138,94,0.12)",
        }}
      />
      {/* inner thin gold line */}
      <div
        className="absolute inset-2 md:inset-3"
        style={{
          border: `1px solid rgba(230,184,76,0.45)`,
        }}
      />
      {/* rivets along the edges */}
      {[
        "left-1/2 -translate-x-1/2 top-[2px]",
        "left-1/2 -translate-x-1/2 bottom-[2px]",
        "top-1/2 -translate-y-1/2 left-[2px]",
        "top-1/2 -translate-y-1/2 right-[2px]",
      ].map((pos, i) => (
        <div
          key={i}
          className={`absolute w-2.5 h-2.5 rounded-full ${pos}`}
          style={{
            background: GOLD,
            boxShadow: "0 0 6px rgba(230,184,76,0.7), inset 0 -1px 2px rgba(0,0,0,0.5)",
          }}
        />
      ))}
      {/* ornate corners */}
      <CornerOrnament className="top-1 left-1" />
      <CornerOrnament
        className="top-1 right-1"
        style={{ transform: "rotate(90deg)" }}
      />
      <CornerOrnament
        className="bottom-1 right-1"
        style={{ transform: "rotate(180deg)" }}
      />
      <CornerOrnament
        className="bottom-1 left-1"
        style={{ transform: "rotate(270deg)" }}
      />
    </div>
  );
}