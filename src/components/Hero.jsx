import React from "react";
import FloatingIslands from "@/components/FloatingIslands";

const VIDEO_URL = "https://media.base44.com/videos/public/user_699e79e1191555fa18956285/b1dafa1ed_lv__20261015084341.mp4";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Floating islands */}
      <FloatingIslands />

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-32 scanline animate-scan pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <div className="inline-flex items-center gap-2 mb-8 glass-panel-light px-4 py-2 rounded-full animate-flicker">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
            REALM STATUS — ONLINE
          </span>
        </div>

        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl tracking-[0.1em] text-foreground leading-none mb-6 animate-flicker">
          THE
          <br />
          <span className="text-primary text-glow">HAVEN</span>
        </h1>

        <p className="font-mono text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed tracking-wide">
          A living bridge between you and the realm. Track vitals,
          chart the floating isles, forge your skin, and channel
          growth to prime — all in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById("map")?.scrollIntoView({ behavior: "smooth" })}
            className="font-mono text-xs tracking-[0.25em] bg-primary text-primary-foreground px-8 py-4 hover:scale-105 transition-transform duration-300"
          >
            ENTER THE ISLE
          </button>
          <button
            onClick={() => document.getElementById("vitals")?.scrollIntoView({ behavior: "smooth" })}
            className="font-mono text-xs tracking-[0.25em] border border-foreground/20 text-foreground px-8 py-4 hover:border-primary/50 hover:text-primary transition-colors duration-300"
          >
            VIEW VITALS
          </button>
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 glass-panel">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "PLAYERS ONLINE", value: "847" },
            { label: "SERVER PING", value: "24ms" },
            { label: "DAY CYCLE", value: "14:32" },
            { label: "REALM", value: "SKYSHARD" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1">
                {stat.label}
              </span>
              <span className="font-mono text-sm md:text-base text-primary tracking-wide">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}