import React from "react";
import { ArrowRight, Dna } from "lucide-react";

export default function PluginHero() {
  return (
    <section className="text-center max-w-3xl mx-auto py-14 md:py-20">
      <div className="font-mono text-[10px] tracking-[0.3em] text-primary mb-4">
        ARKANIS — THE ISLE PLUGIN
      </div>
      <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground tracking-wide mb-5 leading-tight">
        The Isle Plugin, <span className="text-primary">for The Haven</span>
      </h1>
      <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
        A Rex is about thirty-five hours of growing. The Isle Plugin keeps those
        hours safe: bank a dino and take it back exactly as it was, paint it in
        a 3D studio, and watch the whole server move on a live map.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://arkanis.gg/dashboard/405418368334561281/panels/isle"
          target="_blank"
          rel="noreferrer"
          className="bg-primary text-primary-foreground font-mono text-[11px] font-bold tracking-[0.2em] uppercase px-6 py-3 rounded-md hover:shadow-[0_0_22px_rgba(201,138,94,0.55)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Dna size={14} /> Open the Isle panel <ArrowRight size={14} />
        </a>
        <a
          href="https://arkanis.gg/docs/isle-plugin/overview"
          target="_blank"
          rel="noreferrer"
          className="border border-border text-foreground font-mono text-[11px] tracking-[0.2em] uppercase px-6 py-3 rounded-md hover:bg-muted transition-colors"
        >
          Read the docs
        </a>
      </div>
    </section>
  );
}