import React from "react";
import { ServerCog, BookOpen, ArrowUpRight } from "lucide-react";

export default function PanelLink() {
  return (
    <section className="py-10 md:py-14">
      <div className="glass-panel rounded-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <ServerCog size={13} className="text-primary" />
              <span className="font-mono text-[9px] tracking-[0.25em] text-primary">
                ARKANIS DASHBOARD
              </span>
            </div>
            <h2 className="font-heading text-lg md:text-xl font-bold text-foreground mb-1.5 tracking-wide">
              Your Isle panel
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
              The plugin is managed from your Arkanis dashboard: install it on
              your servers, check the running version and heartbeat, and manage
              stored dinos, population caps and the live map.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-2">
            <a
              href="https://arkanis.gg/dashboard/405418368334561281/panels/isle"
              target="_blank"
              rel="noreferrer"
              className="bg-primary text-primary-foreground font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-3 rounded-md hover:shadow-[0_0_22px_rgba(201,138,94,0.55)] transition-all flex items-center justify-center gap-2"
            >
              Open panel <ArrowUpRight size={13} />
            </a>
            <a
              href="https://arkanis.gg/docs/isle-plugin/overview"
              target="_blank"
              rel="noreferrer"
              className="border border-border text-foreground font-mono text-[10px] tracking-[0.2em] uppercase px-5 py-3 rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen size={13} /> Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}