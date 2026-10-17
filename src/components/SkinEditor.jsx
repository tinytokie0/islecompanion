import React, { useEffect, useState } from "react";
import { Loader2, Save, Trash2, Palette } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DINOS } from "@/lib/portalData";
import { dinoArtFor } from "@/lib/dinoArt";
import { Image } from "@/components/ui/image";
import Dino3D from "@/components/Dino3D";

// Full-bleed moonlit jungle art matching the Cretaceous Gone Wild skin page
const BACKDROP =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/05e44146b_generated_image.png";

const PATTERNS = [
  { id: "default", name: "Wild Type", desc: "Natural camouflage" },
  { id: "brindle", name: "Brindle", desc: "Striped patterning" },
  { id: "melanistic", name: "Melanistic", desc: "Dark pigment excess" },
  { id: "albino", name: "Albino", desc: "Absence of pigment" },
  { id: "leucistic", name: "Leucistic", desc: "Partial pigment loss" },
  { id: "erythristic", name: "Erythristic", desc: "Reddish hue" },
  { id: "crystal", name: "Crystalline", desc: "Prismatic shards" },
];

// One labeled color zone: native picker + free hex text
function ColorZone({ label, value, hexText, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 bg-transparent border border-border cursor-pointer p-1 shrink-0"
      />
      <div className="flex-1">
        <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1">{label}</div>
        <input
          type="text"
          value={hexText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#6b4423"
          className="w-full bg-secondary border border-border font-mono text-xs text-foreground px-3 py-2 outline-none focus:border-primary/60"
        />
      </div>
    </div>
  );
}

export default function SkinEditor() {
  const [species, setSpecies] = useState(DINOS[0].name);
  const [pattern, setPattern] = useState("default");

  // Per-zone colors, each with its own free-text hex buffer
  const [bodyColor, setBodyColor] = useState("#6b4423");
  const [bodyHex, setBodyHex] = useState("#6b4423");
  const [bellyColor, setBellyColor] = useState("#c4956a");
  const [bellyHex, setBellyHex] = useState("#c4956a");
  const [hornColor, setHornColor] = useState("#e6b84c");
  const [hornHex, setHornHex] = useState("#e6b84c");

  const [savedSkins, setSavedSkins] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [view3d, setView3d] = useState(false);

  // Load the player's saved skins once
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const page = await base44.entities.DinoSkin.filter({}, { sort: "-updated_date", limit: 100 });
        if (alive) setSavedSkins(page.items);
      } catch {
        if (alive) setSavedSkins([]);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  // Zone setter: validates the 6-digit hex (with or without #) before applying
  const setZone = (apply, setHexText) => (value) => {
    setHexText(value);
    const v = value.trim().replace("#", "");
    if (/^[0-9a-fA-F]{6}$/.test(v)) apply("#" + v.toLowerCase());
  };

  // Derive a contrast stripe accent from the body color
  const getAccentColor = () => {
    const num = parseInt(bodyColor.replace("#", ""), 16);
    const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const amt = lum > 128 ? -60 : 60;
    const clamp = (v) => Math.max(0, Math.min(255, v + amt));
    return (
      "#" +
      [clamp(r), clamp(g), clamp(b)]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
    );
  };

  const loadSkin = (skin) => {
    setSpecies(skin.species);
    setPattern(skin.pattern || "default");
    setBodyColor(skin.color);
    setBodyHex(skin.color);
    setBellyColor(skin.belly_color || skin.color);
    setBellyHex(skin.belly_color || skin.color);
    setHornColor(skin.horn_color || skin.color);
    setHornHex(skin.horn_color || skin.color);
    setSavedMsg(`Loaded "${skin.species}" skin`);
    setTimeout(() => setSavedMsg(""), 2500);
  };

  // Save the current design for the selected species (update if one exists)
  const saveSkin = async () => {
    setSaving(true);
    setSavedMsg("");
    try {
      const data = {
        pattern,
        color: bodyColor,
        belly_color: bellyColor,
        horn_color: hornColor,
      };
      const existing = (savedSkins || []).find((s) => s.species === species);
      if (existing) {
        await base44.entities.DinoSkin.update(existing.id, data);
        setSavedSkins((skins) =>
          skins.map((s) => (s.id === existing.id ? { ...s, ...data } : s))
        );
      } else {
        const created = await base44.entities.DinoSkin.create({ species, ...data });
        setSavedSkins((skins) => [...(skins || []), created]);
      }
      setSavedMsg(`Skin saved for ${species}`);
      setTimeout(() => setSavedMsg(""), 2500);
    } finally {
      setSaving(false);
    }
  };

  const removeSkin = async (skin) => {
    setDeleteId(skin.id);
    try {
      await base44.entities.DinoSkin.delete(skin.id);
      setSavedSkins((skins) => skins.filter((s) => s.id !== skin.id));
      if (skin.species === species) setSavedMsg(`Removed ${skin.species} skin`);
      setTimeout(() => setSavedMsg(""), 2500);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <section id="skins" className="relative">
      {/* ============ Full-bleed moonlit jungle backdrop ============ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src={BACKDROP}
          alt=""
          fittingType="fill"
          className="w-full h-full animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/25 to-background" />
        <div className="absolute inset-0 grid-bg opacity-15" />
      </div>

      <div className="relative px-6 md:px-10 py-14 md:py-20">
        <div className="max-w-[1500px] mx-auto">
          {/* ============ Hero card floating over the art ============ */}
          <div className="flex justify-center items-center min-h-[70vh] mb-16">
            <div className="glass-panel rounded-2xl px-10 md:px-20 py-14 text-center max-w-xl w-full">
              <span className="inline-flex w-14 h-14 rounded-xl bg-primary/15 text-primary items-center justify-center mb-5">
                <Palette size={24} />
              </span>
              <h1 className="font-heading text-3xl md:text-4xl tracking-[0.06em] text-foreground text-glow mb-3">
                SKIN EDITOR
              </h1>
              <p className="font-mono text-xs md:text-sm text-muted-foreground leading-relaxed tracking-wide">
                Paint every zone of your dino — flank, belly, horns and claws — in any colors, then save it.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* ============ Render viewport ============ */}
            <div className="glass-panel rounded-xl aspect-square lg:aspect-auto relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div
                className="absolute w-2/3 h-2/3 rounded-full blur-3xl opacity-25 transition-colors duration-700"
                style={{ backgroundColor: bodyColor }}
              />
              {/* View toggle: 3D model or 2D blueprint */}
              <div className="absolute top-4 right-4 z-10 flex gap-1">
                {[
                  ["3D MODEL", true],
                  ["KEY ART", false],
                ].map(([label, val]) => (
                  <button
                    key={label}
                    onClick={() => setView3d(val)}
                    className={`px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] border transition-colors ${
                      view3d === val
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {view3d && (
                <Dino3D
                  species={species}
                  bodyColor={bodyColor}
                  bellyColor={bellyColor}
                  hornColor={hornColor}
                  pattern={pattern}
                  className="absolute inset-0"
                />
              )}

              {/* Realistic Evrima key art for the selected species, tinted
                  live with the chosen zone colors */}
              {!view3d && (
                <div className="absolute inset-0">
                  <Image
                    src={dinoArtFor(species)}
                    fittingType="fill"
                    className="w-full h-full"
                    alt={species}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: bodyColor, mixBlendMode: "soft-light", opacity: 0.6 }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(to top, ${bellyColor}55 0%, transparent 40%)`,
                      mixBlendMode: "soft-light",
                    }}
                  />
                  {pattern === "brindle" && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `repeating-linear-gradient(75deg, transparent 0px, transparent 26px, ${getAccentColor()}44 34px, transparent 48px)`,
                        mixBlendMode: "soft-light",
                      }}
                    />
                  )}
                </div>
              )}

              {/* Scan line */}
              <div className="absolute left-0 right-0 h-20 scanline animate-scan pointer-events-none" />

              {/* Info overlay */}
              <div className="absolute top-4 left-4">
                <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                  SPECIES: <span className="text-primary">{species.toUpperCase()}</span>
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mt-1">
                  PATTERN: <span className="text-primary">{PATTERNS.find((p) => p.id === pattern)?.name.toUpperCase()}</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                {[
                  ["FLANK", bodyColor],
                  ["BELLY", bellyColor],
                  ["HORN", hornColor],
                ].map(([label, hex]) => (
                  <span key={label} className="flex items-center gap-1">
                    <span className="w-4 h-4 border border-foreground/30" style={{ backgroundColor: hex }} />
                    <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground">{label}</span>
                  </span>
                ))}
              </div>
              {savedMsg && (
                <div className="absolute bottom-4 right-4 font-mono text-[10px] tracking-[0.15em] text-primary">
                  {savedMsg.toUpperCase()}
                </div>
              )}
            </div>

            {/* ============ Controls ============ */}
            <div className="flex flex-col gap-6">
              {/* Species selection */}
              <div className="glass-panel rounded-xl p-6">
                <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
                  SPECIMEN
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-44 overflow-y-auto hide-scrollbar pr-1">
                  {DINOS.map((d) => (
                    <button
                      key={d.code}
                      onClick={() => setSpecies(d.name)}
                      className={`px-3 py-2 font-mono text-[10px] tracking-wide border transition-all duration-200 ${
                        species === d.name
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pattern selection */}
              <div className="glass-panel rounded-xl p-6">
                <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
                  GENETIC PATTERN
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPattern(p.id)}
                      className={`p-4 text-left border transition-all duration-300 ${
                        pattern === p.id
                          ? "border-primary/60 bg-primary/10"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="font-mono text-xs text-foreground tracking-wide mb-1">
                        {p.name}
                      </div>
                      <div className="font-mono text-[9px] text-muted-foreground tracking-wide">
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Per-zone colors */}
              <div className="glass-panel rounded-xl p-6">
                <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
                  CHROMATIC ZONES
                </div>
                <div className="flex flex-col gap-4">
                  <ColorZone
                    label="BODY / FLANK"
                    value={bodyColor}
                    hexText={bodyHex}
                    onChange={setZone(setBodyColor, setBodyHex)}
                  />
                  <ColorZone
                    label="BELLY / UNDERSIDE"
                    value={bellyColor}
                    hexText={bellyHex}
                    onChange={setZone(setBellyColor, setBellyHex)}
                  />
                  <ColorZone
                    label="HORNS / CLAWS"
                    value={hornColor}
                    hexText={hornHex}
                    onChange={setZone(setHornColor, setHornHex)}
                  />
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={saveSkin}
                disabled={saving}
                className="font-mono text-[10px] tracking-[0.25em] bg-primary text-primary-foreground px-6 py-4 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><Loader2 size={13} className="animate-spin" /> SAVING...</>
                ) : (
                  <><Save size={13} /> SAVE SKIN FOR {species.toUpperCase()}</>
                )}
              </button>

              {/* Saved skins */}
              <div className="glass-panel rounded-xl p-6">
                <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
                  MY SAVED SKINS
                </div>
                {savedSkins === null ? (
                  <div className="py-3 flex items-center justify-center gap-2 font-mono text-[10px] text-muted-foreground">
                    <Loader2 size={12} className="animate-spin" /> LOADING...
                  </div>
                ) : savedSkins.length === 0 ? (
                  <div className="py-3 font-mono text-[10px] text-muted-foreground text-center">
                    No skins saved yet — design one above and save it.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {savedSkins.map((skin) => (
                      <div
                        key={skin.id}
                        className="flex items-center gap-3 border border-border px-3 py-2"
                      >
                        <span className="flex shrink-0">
                          <span className="w-6 h-6 border border-foreground/30" style={{ backgroundColor: skin.color }} />
                          <span className="w-6 h-6 border border-foreground/30 -ml-1" style={{ backgroundColor: skin.belly_color || skin.color }} />
                          <span className="w-6 h-6 border border-foreground/30 -ml-1" style={{ backgroundColor: skin.horn_color || skin.color }} />
                        </span>
                        <button
                          onClick={() => loadSkin(skin)}
                          className="flex-1 text-left font-mono text-[11px] text-foreground hover:text-primary transition-colors"
                        >
                          {skin.species}
                          <span className="text-muted-foreground ml-2">
                            {(PATTERNS.find((p) => p.id === skin.pattern)?.name || skin.pattern).toUpperCase()}
                          </span>
                        </button>
                        <button
                          onClick={() => removeSkin(skin)}
                          disabled={deleteId === skin.id}
                          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          aria-label={`Delete ${skin.species} skin`}
                        >
                          {deleteId === skin.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}