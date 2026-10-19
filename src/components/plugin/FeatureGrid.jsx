import React from "react";
import { Package, Palette, Map, Terminal, Users, ShieldAlert, ArrowUpRight } from "lucide-react";

const DOCS = "https://arkanis.gg/docs/isle-plugin";

const FEATURES = [
  {
    icon: Package,
    title: "Garage",
    text: "Bank a dino and take it back exactly as it was. Growth, vitals, nutrients, mutations, prime objectives and paint, onto whatever they are playing.",
    href: DOCS + "/garage",
  },
  {
    icon: Palette,
    title: "Skin Studio",
    text: "Paint the game's own 3D model across ten regions, from 147 presets or your own colours, then apply it to a player who is in-game.",
    href: DOCS + "/skin-studio",
  },
  {
    icon: Map,
    title: "Live Map",
    text: "Gateway in 3D, every player placed once a second. Real server clock and weather, so the rain and the night you watch are the ones players are in.",
    href: DOCS + "/live-map",
  },
  {
    icon: Terminal,
    title: "Chat commands",
    text: "Players type !store, !restore and !slay in game chat. The reply lands in game and the detail lands in their Discord DMs.",
    href: DOCS + "/chat-commands",
  },
  {
    icon: Users,
    title: "Population",
    text: "Cap a species by headcount or by share of the server. At its cap it leaves the spawn menu and comes back when a place frees up.",
    href: DOCS + "/population",
  },
  {
    icon: ShieldAlert,
    title: "Group limits",
    text: "Too many of one species standing together get one in-game message, and staff see the crowd. Off until you turn it on per server.",
    href: DOCS + "/population#group-warnings",
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-10 md:py-14">
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
        What the plugin does
      </h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-xl">
        Six modules, all managed from your Arkanis dashboard. Nothing is
        installed on players' machines.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, text, href }) => (
          <a
            key={title}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group glass-panel rounded-lg p-5 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Icon size={16} className="text-primary" />
              </div>
              <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-heading font-bold text-foreground mb-1.5">{title}</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">{text}</p>
          </a>
        ))}
      </div>
    </section>
  );
}