import React, { useState } from "react";

const PATTERNS = [
  { id: "default", name: "Wild Type", desc: "Natural camouflage" },
  { id: "brindle", name: "Brindle", desc: "Striped patterning" },
  { id: "melanistic", name: "Melanistic", desc: "Dark pigment excess" },
  { id: "albino", name: "Albino", desc: "Absence of pigment" },
  { id: "leucistic", name: "Leucistic", desc: "Partial pigment loss" },
  { id: "erythristic", name: "Erythristic", desc: "Reddish hue" },
  { id: "crystal", name: "Crystalline", desc: "Prismatic shards" },
];

const SWATCHES = [
  "#6b4423", "#8b5e3c", "#3d5a3d", "#2c4a2c", "#7a6a4a",
  "#c4956a", "#1a2b1a", "#5c3d2e", "#94815a", "#4a5d4a",
];

export default function SkinEditor() {
  const [pattern, setPattern] = useState("default");
  const [color, setColor] = useState(SWATCHES[0]);
  const [hexText, setHexText] = useState(SWATCHES[0]);

  // Accepts any 6-digit hex (with or without #)
  const applyHex = (value) => {
    setHexText(value);
    const v = value.trim().replace("#", "");
    if (/^[0-9a-fA-F]{6}$/.test(v)) setColor("#" + v.toLowerCase());
  };

  // The picked color always drives the render — patterns shape markings, not pigment
  const getRenderColor = () => color;

  // Derive a contrast stripe accent from the chosen base color
  const getAccentColor = () => {
    const num = parseInt(color.replace("#", ""), 16);
    const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const amt = lum > 128 ? -60 : 60;
    const clamp = (v) => Math.max(0, Math.min(255, v + amt));
    return (
      "#" +
      [clamp(r), clamp(g), clamp(b)]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
    );
  };

  return (
    <section id="skins" className="relative py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary mb-3 block">
              03 — CRYSTAL ATELIER
            </span>
            <h2 className="font-heading text-3xl md:text-5xl tracking-[0.08em] text-foreground">
              SKIN EDITOR
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-md tracking-wide leading-relaxed">
            Engineer your evolutionary identity. Toggle genetic patterns and
            chromatic base layers with zero friction.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Render viewport */}
          <div className="glass-panel aspect-square lg:aspect-auto relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div
              className="absolute w-2/3 h-2/3 rounded-full blur-3xl opacity-25 transition-colors duration-700"
              style={{ backgroundColor: getRenderColor() }}
            />
            {/* Dino silhouette */}
            <svg viewBox="0 0 200 200" className="relative w-4/5 h-4/5">
              <defs>
                <pattern id="brindlePattern" patternUnits="userSpaceOnUse" width="8" height="8">
                  <rect width="8" height="8" fill={getRenderColor()} />
                  <rect width="3" height="8" fill={getAccentColor()} opacity="0.5" />
                </pattern>
              </defs>
              <path
                d="M 30 120 Q 40 100 60 95 L 80 85 Q 100 75 120 80 L 140 70 Q 160 65 170 75 L 165 90 Q 155 95 145 100 L 135 110 Q 130 125 120 130 L 110 135 Q 95 140 80 138 L 65 145 Q 45 150 35 140 Z"
                fill={pattern === "brindle" ? "url(#brindlePattern)" : getRenderColor()}
                className="animate-breathe transition-all duration-500"
              />
              <circle cx="155" cy="80" r="3" fill="#0A0F0D" />
              {[...Array(5)].map((_, i) => (
                <path
                  key={i}
                  d={`M ${75 + i * 18} ${85 - i * 1} L ${80 + i * 18} ${75 - i * 1} L ${85 + i * 18} ${85 - i * 1}`}
                  fill={getAccentColor()}
                  opacity="0.7"
                />
              ))}
              {/* Belly stripe */}
              <path
                d="M 50 135 Q 80 145 120 138 L 115 142 Q 80 148 55 142 Z"
                fill={getAccentColor()}
                opacity="0.3"
              />
              {/* Crystal shards */}
              {pattern === "crystal" && (
                <g>
                  <polygon points="100,55 108,72 92,72" fill="#e6b84c" className="animate-crystal" />
                  <polygon points="68,95 76,112 60,112" fill="#c98a5e" className="animate-crystal" style={{ animationDelay: "1s" }} />
                  <polygon points="132,100 140,117 124,117" fill="#c4b5fd" className="animate-crystal" style={{ animationDelay: "2s" }} />
                  <polygon points="40,110 47,126 33,126" fill="#f0d49a" className="animate-crystal" style={{ animationDelay: "0.5s" }} />
                </g>
              )}
            </svg>

            {/* Scan line */}
            <div className="absolute left-0 right-0 h-20 scanline animate-scan pointer-events-none" />

            {/* Info overlay */}
            <div className="absolute top-4 left-4">
              <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                PATTERN: <span className="text-primary">{PATTERNS.find((p) => p.id === pattern)?.name.toUpperCase()}</span>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="w-4 h-4 border border-foreground/30" style={{ backgroundColor: color }} />
              <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
                {color.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Controls panel */}
          <div className="flex flex-col gap-6">
            {/* Pattern selection */}
            <div className="glass-panel p-6">
              <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
                GENETIC PATTERN
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPattern(p.id)}
                    className={`p-4 text-left border transition-all duration-300 ${
                      pattern === p.id
                        ? "border-primary/60 bg-primary/10"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="font-mono text-xs text-foreground tracking-wide mb-1">
                      {p.name}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground tracking-wide">
                      {p.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color palette */}
            <div className="glass-panel p-6">
              <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
                CHROMATIC BASE
              </div>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {SWATCHES.map((sw) => (
                  <button
                    key={sw}
                    onClick={() => { setColor(sw); setHexText(sw); }}
                    className={`aspect-square border-2 transition-all duration-200 hover:scale-110 ${
                      color === sw ? "border-primary scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: sw }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => { setColor(e.target.value); setHexText(e.target.value); }}
                  className="w-14 h-14 bg-transparent border border-border cursor-pointer p-1"
                />
                <div className="flex-1">
                  <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1">
                    ANY HEX CODE
                  </div>
                  <input
                    type="text"
                    value={hexText}
                    onChange={(e) => applyHex(e.target.value)}
                    placeholder="#6b4423"
                    className="w-full bg-secondary border border-border font-mono text-xs text-foreground px-3 py-2 outline-none focus:border-primary/60"
                  />
                </div>
              </div>
            </div>

            {/* Apply button */}
            <button className="font-mono text-[10px] tracking-[0.25em] bg-primary text-primary-foreground px-6 py-4 hover:scale-[1.02] transition-transform">
              APPLY SKIN TO SPECIMEN
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}