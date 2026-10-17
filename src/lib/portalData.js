// Shared sample data for the portal pages

// Full playable roster of The Isle: Evrima branch (patch 0.21.784).
export const DINOS = [
  // Carnivores
  { name: "Tyrannosaurus", code: "T-REX-001", growth: 92, price: 2500, rarity: "APEX", accent: "#dc2626" },
  { name: "Deinosuchus", code: "DEIN-002", growth: 88, price: 2500, rarity: "APEX", accent: "#3b82f6" },
  { name: "Allosaurus", code: "ALLO-004", growth: 75, price: 2000, rarity: "RARE", accent: "#ef4444" },
  { name: "Carnotaurus", code: "CARNO-014", growth: 78, price: 1800, rarity: "RARE", accent: "#f59e0b" },
  { name: "Austroraptor", code: "AUST-017", growth: 85, price: 1800, rarity: "RARE", accent: "#60a5fa" },
  { name: "Pteranodon", code: "PTER-011", growth: 70, price: 1600, rarity: "RARE", accent: "#e6b84c" },
  { name: "Ceratosaurus", code: "CERA-006", growth: 70, price: 1400, rarity: "COMMON", accent: "#e879f9" },
  { name: "Omniraptor", code: "OMNI-005", growth: 100, price: 1200, rarity: "COMMON", accent: "#22c55e" },
  { name: "Dilophosaurus", code: "DILO-012", growth: 62, price: 1200, rarity: "COMMON", accent: "#34d399" },
  { name: "Herrerasaurus", code: "HER-003", growth: 66, price: 1100, rarity: "COMMON", accent: "#fb923c" },
  { name: "Troodon", code: "TROO-019", growth: 55, price: 1000, rarity: "COMMON", accent: "#a5b4fc" },
  // Herbivores
  { name: "Triceratops", code: "TRIC-002", growth: 90, price: 2500, rarity: "APEX", accent: "#fb7185" },
  { name: "Maiasaura", code: "MAIA-013", growth: 80, price: 1400, rarity: "COMMON", accent: "#fbbf24" },
  { name: "Stegosaurus", code: "STEG-003", growth: 85, price: 1500, rarity: "COMMON", accent: "#84cc16" },
  { name: "Tenontosaurus", code: "TENO-007", growth: 74, price: 1300, rarity: "COMMON", accent: "#4ade80" },
  { name: "Pachycephalosaurus", code: "PACH-009", growth: 68, price: 1200, rarity: "COMMON", accent: "#38bdf8" },
  { name: "Diabloceratops", code: "DIAB-008", growth: 58, price: 1100, rarity: "COMMON", accent: "#a78bfa" },
  { name: "Kentrosaurus", code: "KENT-010", growth: 72, price: 1300, rarity: "COMMON", accent: "#a3e635" },
  { name: "Dryosaurus", code: "DRYO-016", growth: 50, price: 1000, rarity: "COMMON", accent: "#86efac" },
  { name: "Hypsilophodon", code: "HYP-045", growth: 40, price: 1000, rarity: "COMMON", accent: "#34d399" },
  // Omnivores
  { name: "Gallimimus", code: "GALL-018", growth: 76, price: 1600, rarity: "RARE", accent: "#c4b5fd" },
  { name: "Beipiaosaurus", code: "BEIP-020", growth: 60, price: 1100, rarity: "COMMON", accent: "#fdba74" },
];

export const SKINS = [
  { id: "ember", name: "Ember Stripe", pattern: "Brindle", hex: "#c98a5e", price: 560 },
  { id: "gilded", name: "Gilded Scales", pattern: "Wild Type", hex: "#e6b84c", price: 720 },
  { id: "amethyst", name: "Amethyst Veil", pattern: "Melanistic", hex: "#a78bfa", price: 880 },
  { id: "abyss", name: "Abyss Watcher", pattern: "Melanistic", hex: "#1e3a8a", price: 820 },
  { id: "bone", name: "Bleached Bone", pattern: "Leucistic", hex: "#e7e5e4", price: 640 },
  { id: "bloodmoon", name: "Blood Moon", pattern: "Erythristic", hex: "#dc2626", price: 900 },
  { id: "moss", name: "Mossback", pattern: "Wild Type", hex: "#3d5a3d", price: 500 },
  { id: "prism", name: "Prismatic", pattern: "Crystalline", hex: "#c4b5fd", price: 850 },
];

export const NESTING_GUIDE = [
  { species: "Tyrannosaurus", clutch: "4–6 eggs", nest: "Scraped ground nest", grounds: "Void Ridge", care: "High — guards until sub-adult" },
  { species: "Deinosuchus", clutch: "20–30 eggs", nest: "Buried sand mound", grounds: "Mire Delta", care: "None — eggs left to warm" },
  { species: "Carnotaurus", clutch: "1–2 eggs", nest: "Colonial ground nest", grounds: "Crystal Basin", care: "Moderate — rots nearby" },
  { species: "Allosaurus", clutch: "3–5 eggs", nest: "Vegetation mound", grounds: "Void Ridge", care: "High — defends the mound" },
  { species: "Stegosaurus", clutch: "6–10 eggs", nest: "Ditch nest", grounds: "Crystal Basin", care: "Low — checks daily" },
  { species: "Ceratosaurus", clutch: "4–6 eggs", nest: "Scraped ground nest", grounds: "South Plains", care: "Moderate — nearby guarding" },
  { species: "Diabloceratops", clutch: "2–4 eggs", nest: "Crater colonial nest", grounds: "Crystal Basin", care: "Herd — defended as a group" },
  { species: "Omniraptor", clutch: "5–7 eggs", nest: "Burrow nest", grounds: "Void Ridge", care: "Pack — shared guarding" },
  { species: "Pteranodon", clutch: "1–3 eggs", nest: "Cliff ledge scrape", grounds: "Skyshard Isles", care: "Moderate — rotated shifts" },
  { species: "Hypsilophodon", clutch: "8–12 eggs", nest: "Burrow nest", grounds: "South Plains", care: "Low — abandons at hatching" },
];

export const PACKS = [
  { name: "Starter Pack", price: 2500, tier: "COMMON", accent: "#84cc16", pool: ["Hypsilophodon", "Dryosaurus", "Omniraptor", "Diabloceratops"] },
  { name: "Apex Pack", price: 7500, tier: "RARE", accent: "#e6b84c", pool: ["Carnotaurus", "Pteranodon", "Allosaurus", "Ceratosaurus"] },
  { name: "Mythic Pack", price: 20000, tier: "APEX", accent: "#a78bfa", pool: ["Tyrannosaurus", "Deinosuchus", "Triceratops", "Maiasaura"] },
];