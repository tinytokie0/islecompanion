import React from "react";

export default function Footer() {
  return (
    <footer className="relative border-t border-border py-12 px-6 md:px-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8" viewBox="0 0 40 40">
                <polygon points="20,3 33,14 27,37 13,37 7,14" fill="#67e8f9" className="animate-crystal" />
              </svg>
              <span className="font-heading text-sm tracking-[0.25em] text-foreground">
                THE HAVEN
              </span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground tracking-wide leading-relaxed max-w-xs">
              The Haven. A living bridge between you and the realm.
              Unofficial companion interface.
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
              MODULES
            </div>
            <div className="flex flex-col gap-2">
              {["Live Map", "Garage", "Skin Editor", "Health Overview"].map((l) => (
                <button
                  key={l}
                  onClick={() => document.getElementById(l.toLowerCase().replace(" ", ""))?.scrollIntoView({ behavior: "smooth" })}
                  className="font-mono text-[10px] tracking-wide text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
              SERVER STATUS
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[10px] tracking-wide text-foreground">ALL SYSTEMS NOMINAL</span>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground tracking-wide">
              UPTIME: 99.8% — PING: 24ms
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
            © 2026 THE HAVEN — UNOFFICIAL FAN PROJECT
          </div>
          <div className="flex gap-6">
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              PRIVACY
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              TERMS
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              SUPPORT
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}