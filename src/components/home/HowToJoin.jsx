import React from "react";

const STEPS = [
  { title: "Sign in with Steam", body: "This site knows who you are from your Steam account." },
  { title: "Join our Discord and link it", body: "The community, events and staff support live there." },
  { title: "Find us in the game", body: "In The Isle: Evrima, open the server browser and search for the Haven's server." },
  { title: "Spawn in", body: "Your dino appears on the live map as soon as you are in the game." },
];

// CGW-style "how to join" checklist with numbered copper steps.
export default function HowToJoin() {
  return (
    <div className="glass-panel rounded-xl p-6 h-full">
      <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">HOW TO JOIN</div>
      <ol className="space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/15 text-primary font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="font-heading text-sm font-bold text-foreground">{step.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}