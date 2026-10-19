import React from "react";
import DiscordIcon from "@/components/DiscordIcon";

const INVITE = "https://discord.gg/4EMZ62VyD";
const TAGS = ["Events", "Giveaways", "Server news", "Support"];

// CGW-style community banner: icon tile, heading, tag pills and a join button.
export default function DiscordBanner() {
  return (
    <div className="relative glass-panel rounded-xl overflow-hidden mb-5 border-primary/30 hover:border-primary/60 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-r from-[#c98a5e]/10 via-transparent to-[#5865F2]/10 pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center gap-5 p-5 md:p-6">
        <div className="w-12 h-12 rounded-lg bg-[#5865F2] flex items-center justify-center shrink-0">
          <DiscordIcon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-xl font-bold text-foreground mb-1">Join our Discord</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            The Haven community lives there: events, giveaways, server news and help from staff.
          </p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span key={tag} className="font-mono text-[10px] text-muted-foreground border border-border bg-secondary/50 rounded px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <a
          href={INVITE}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center justify-center gap-2 bg-[#5865F2] text-white text-sm font-semibold px-5 py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          <DiscordIcon className="w-4 h-4" /> Join our Discord
        </a>
      </div>
    </div>
  );
}