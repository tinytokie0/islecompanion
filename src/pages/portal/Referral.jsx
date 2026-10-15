import React, { useState } from "react";
import { UserPlus, Copy, Check, Coins } from "lucide-react";
import PageShell from "@/components/portal/PageShell";

const FRIENDS = [
  { name: "GRAVELORD", joined: "3d ago", reward: "+750 shards" },
  { name: "PALEHIDE", joined: "1w ago", reward: "+750 shards" },
  { name: "TINY-22", joined: "2w ago", reward: "+750 shards" },
];

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/register?ref=HAVEN-7F3K`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* clipboard unavailable — ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell
      kicker="GROW THE PACK"
      title="INVITE FRIENDS"
      sub="Bring a new player to The Haven and you both get a reward when they register."
    >
      {/* Referral link */}
      <div className="glass-panel rounded-lg p-6 mb-6">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
          YOUR REFERRAL LINK
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-secondary border border-border rounded-sm px-4 py-3 font-mono text-[11px] text-foreground truncate">
            {link}
          </div>
          <button
            onClick={copy}
            className="font-mono text-[10px] tracking-[0.25em] bg-primary text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "COPIED" : "COPY LINK"}
          </button>
        </div>
        <div className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground mt-3">
          CODE: <span className="text-accent">HAVEN-7F3K</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "FRIENDS INVITED", value: FRIENDS.length },
          { label: "SHARDS EARNED", value: "2,250" },
          { label: "STREAK", value: "3/3" },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-lg px-5 py-4">
            <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1">{s.label}</div>
            <div className="font-mono text-xl text-primary">{s.value}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="glass-panel rounded-lg p-6 mb-6">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">HOW IT WORKS</div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            "Share your link with a friend who has never played here.",
            "They register on The Haven and join the server.",
            "You both receive 750 shards the moment they spawn.",
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-mono text-xs text-primary shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-mono text-[11px] text-muted-foreground leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invited friends */}
      <div className="glass-panel rounded-lg divide-y divide-border/60">
        <div className="p-5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground flex items-center gap-2">
          <UserPlus size={13} className="text-primary" /> YOUR INVITED FRIENDS
        </div>
        {FRIENDS.map((f) => (
          <div key={f.name} className="p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="font-mono text-xs text-foreground">{f.name}</span>
              <span className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">JOINED {f.joined.toUpperCase()}</span>
            </div>
            <span className="font-mono text-[10px] text-accent flex items-center gap-1.5">
              <Coins size={12} /> {f.reward}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}