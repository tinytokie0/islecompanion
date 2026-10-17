// Dino shop pricing catalog: real Isle species with their shop price, rarity
// and accent color. No fake growth or codes here — live growth and island
// counts come from the live feed at render time.
export const SPECIES_PRICING = {
  Tyrannosaurus: { price: 2500, rarity: "APEX", accent: "#dc2626" },
  Deinosuchus: { price: 2500, rarity: "APEX", accent: "#3b82f6" },
  Triceratops: { price: 2500, rarity: "APEX", accent: "#fb7185" },
  Allosaurus: { price: 2000, rarity: "RARE", accent: "#ef4444" },
  Carnotaurus: { price: 1800, rarity: "RARE", accent: "#f59e0b" },
  Austroraptor: { price: 1800, rarity: "RARE", accent: "#60a5fa" },
  Pteranodon: { price: 1600, rarity: "RARE", accent: "#e6b84c" },
  Gallimimus: { price: 1600, rarity: "RARE", accent: "#c4b5fd" },
  Stegosaurus: { price: 1500, rarity: "COMMON", accent: "#84cc16" },
  Ceratosaurus: { price: 1400, rarity: "COMMON", accent: "#e879f9" },
  Maiasaura: { price: 1400, rarity: "COMMON", accent: "#fbbf24" },
  Tenontosaurus: { price: 1300, rarity: "COMMON", accent: "#4ade80" },
  Kentrosaurus: { price: 1300, rarity: "COMMON", accent: "#a3e635" },
  Omniraptor: { price: 1200, rarity: "COMMON", accent: "#22c55e" },
  Dilophosaurus: { price: 1200, rarity: "COMMON", accent: "#34d399" },
  Pachycephalosaurus: { price: 1200, rarity: "COMMON", accent: "#38bdf8" },
  Herrerasaurus: { price: 1100, rarity: "COMMON", accent: "#fb923c" },
  Diabloceratops: { price: 1100, rarity: "COMMON", accent: "#a78bfa" },
  Beipiaosaurus: { price: 1100, rarity: "COMMON", accent: "#fdba74" },
  Troodon: { price: 1000, rarity: "COMMON", accent: "#a5b4fc" },
  Dryosaurus: { price: 1000, rarity: "COMMON", accent: "#86efac" },
  Hypsilophodon: { price: 1000, rarity: "COMMON", accent: "#34d399" },
};

// Lookup with a safe default for any species missing from the catalog
export function speciesInfo(name) {
  return { name, ...(SPECIES_PRICING[name] || { price: 1500, rarity: "COMMON", accent: "#94a3b8" }) };
}