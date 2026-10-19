import React from "react";
import { ExternalLink } from "lucide-react";
import PageShell from "@/components/portal/PageShell";

const ARKANIS_PANEL = "https://arkanis.gg/dashboard/405418368334561281/panels/isle";

const TOPICS = [
  { title: "In-game tickets", desc: "Player reports, staff requests and anything needing staff in-game." },
  { title: "Lost dinos", desc: "A dino missing after a crash or restart — open a ticket on the panel." },
  { title: "Ban appeals", desc: "Appeals are reviewed by the Arkanis staff team through the panel." },
];

// Support runs entirely through Arkanis: the server panel handles tickets.
export default function Tickets() {
  return (
    <PageShell
      kicker="KEEPER DESK"
      title="SUPPORT"
      sub="Support is handled on the Arkanis server panel. Open it to reach the staff team — average first response: under 12 hours."
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Arkanis panel card */}
        <a
          href={ARKANIS_PANEL}
          target="_blank"
          rel="noreferrer"
          className="group block glass-panel rounded-lg p-8 mb-8 hover:border-[rgba(230,184,76,0.65)] hover:shadow-[0_0_36px_rgba(230,184,76,0.22)] transition-all"
        >
          <span className="mx-auto mb-4 w-12 h-12 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/25">
            <ExternalLink size={20} />
          </span>
          <div className="font-heading text-xl font-bold text-foreground tracking-wide mb-1.5">
            Open the Arkanis panel
          </div>
          <div className="font-mono text-[11px] text-muted-foreground leading-relaxed mb-5">
            Tickets open through the Arkanis panel. It opens in a new tab.
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.25em] text-primary uppercase">
            Open panel <ExternalLink size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>

        {/* What the panel handles */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {TOPICS.map((t) => (
            <div key={t.title} className="glass-panel rounded-lg p-5 text-left">
              <div className="font-heading text-sm font-bold text-foreground mb-1.5 tracking-wide">{t.title}</div>
              <div className="font-mono text-[10px] text-muted-foreground leading-relaxed">{t.desc}</div>
            </div>
          ))}
        </div>

        <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          NEED THE COMMUNITY INSTEAD?{" "}
          <a
            href="https://discord.gg/4EMZ62VyD"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            JOIN THE DISCORD
          </a>
        </div>
      </div>
    </PageShell>
  );
}