import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NAV_ITEMS = [
  { label: "MAP", target: "map" },
  { label: "GARAGE", target: "garage" },
  { label: "SKINS", target: "skins" },
  { label: "VITALS", target: "vitals" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-panel py-3" : "py-5"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8" viewBox="0 0 40 40">
            <defs>
              <linearGradient id="navCrys" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7e0a8" />
                <stop offset="100%" stopColor="#e6b84c" />
              </linearGradient>
            </defs>
            <polygon points="20,3 33,14 27,37 13,37 7,14" fill="url(#navCrys)" className="animate-crystal" />
          </svg>
          <span className="font-heading text-sm md:text-base tracking-[0.25em] text-foreground">
            THE HAVEN
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className="font-mono text-xs tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">LIVE</span>
          </div>
          <button className="font-mono text-[10px] tracking-[0.2em] border border-primary/40 text-primary px-4 py-2 hover:bg-primary/10 transition-colors">
            CONNECT
          </button>
        </div>
      </div>
    </nav>
  );
}