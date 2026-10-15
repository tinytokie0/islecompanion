// Shared sample data for the portal pages
export const START_SHARDS = 12500;

export const DINOS = [
  { name: "Tyrannosaurus", code: "T-REX-001", growth: 92, price: 24000, rarity: "APEX", accent: "#dc2626" },
  { name: "Carnotaurus", code: "CARNO-014", growth: 78, price: 9500, rarity: "RARE", accent: "#f59e0b" },
  { name: "Dakotaraptor", code: "RAPT-007", growth: 100, price: 12500, rarity: "RARE", accent: "#22c55e" },
  { name: "Stegosaurus", code: "STEG-003", growth: 85, price: 7000, rarity: "COMMON", accent: "#84cc16" },
  { name: "Acrocanthosaurus", code: "ACRO-009", growth: 64, price: 15000, rarity: "RARE", accent: "#ef4444" },
  { name: "Diabloceratops", code: "DIAB-008", growth: 58, price: 5200, rarity: "COMMON", accent: "#a78bfa" },
  { name: "Utahraptor", code: "UTAH-021", growth: 55, price: 4800, rarity: "COMMON", accent: "#c98a5e" },
  { name: "Pteranodon", code: "PTER-011", growth: 70, price: 8800, rarity: "RARE", accent: "#e6b84c" },
  { name: "Deinosuchus", code: "DEIN-002", growth: 88, price: 18000, rarity: "APEX", accent: "#3b82f6" },
  { name: "Hypsilophodon", code: "HYP-045", growth: 40, price: 1500, rarity: "COMMON", accent: "#34d399" },
];

export const SKINS = [
  { id: "ember", name: "Ember Stripe", pattern: "Brindle", hex: "#c98a5e", price: 3200 },
  { id: "gilded", name: "Gilded Scales", pattern: "Wild Type", hex: "#e6b84c", price: 4500 },
  { id: "amethyst", name: "Amethyst Veil", pattern: "Melanistic", hex: "#a78bfa", price: 6000 },
  { id: "abyss", name: "Abyss Watcher", pattern: "Melanistic", hex: "#1e3a8a", price: 5400 },
  { id: "bone", name: "Bleached Bone", pattern: "Leucistic", hex: "#e7e5e4", price: 3800 },
  { id: "bloodmoon", name: "Blood Moon", pattern: "Erythristic", hex: "#dc2626", price: 7200 },
  { id: "moss", name: "Mossback", pattern: "Wild Type", hex: "#3d5a3d", price: 2400 },
  { id: "prism", name: "Prismatic", pattern: "Crystalline", hex: "#c4b5fd", price: 9500 },
];

export const TELEPORTS = [
  { name: "Crystal Basin", biome: "Northern Highlands", cost: 250 },
  { name: "Volcano Overlook", biome: "Ash Reaches", cost: 400 },
  { name: "South Plains", biome: "Open Range", cost: 150 },
  { name: "Swamps Center", biome: "Mire Delta", cost: 300 },
  { name: "Skyshard Isles", biome: "Floating Reaches", cost: 550 },
  { name: "Void Ridge", biome: "Western Cliffs", cost: 350 },
];

export const KILLFEED = [
  { killer: "REDCLAW-77", dino: "Tyrannosaurus", victim: "MOSSBACK", vdino: "Hypsilophodon", region: "South Plains", ago: "2m", tier: "high" },
  { killer: "NIGHTFALL", dino: "Dakotaraptor", victim: "GRAVELORD", vdino: "Stegosaurus", region: "Swamps East", ago: "9m", tier: "medium" },
  { killer: "APEX-01", dino: "Deinosuchus", victim: "SANDSTRIDER", vdino: "Pteranodon", region: "North Lake", ago: "21m", tier: "critical" },
  { killer: "VOLT", dino: "Carnotaurus", victim: "HOLLOW-9", vdino: "Utahraptor", region: "West Rail Access", ago: "34m", tier: "medium" },
  { killer: "EMBERWING", dino: "Acrocanthosaurus", victim: "TINY-22", vdino: "Hypsilophodon", region: "East Plains", ago: "48m", tier: "low" },
  { killer: "GRAVEHOWL", dino: "Tyrannosaurus", victim: "PALEHIDE", vdino: "Diabloceratops", region: "Volcano", ago: "1h", tier: "high" },
];

export const BOARDS = {
  growth: [
    { name: "REDCLAW-77", dino: "Tyrannosaurus", value: "98%" },
    { name: "APEX-01", dino: "Deinosuchus", value: "95%" },
    { name: "GRAVEHOWL", dino: "Tyrannosaurus", value: "91%" },
    { name: "EMBERWING", dino: "Acrocanthosaurus", value: "87%" },
    { name: "NIGHTFALL", dino: "Dakotaraptor", value: "84%" },
    { name: "VOLT", dino: "Carnotaurus", value: "79%" },
    { name: "MOSSBACK", dino: "Stegosaurus", value: "71%" },
    { name: "PALEHIDE", dino: "Diabloceratops", value: "63%" },
  ],
  kills: [
    { name: "APEX-01", dino: "Deinosuchus", value: 142 },
    { name: "REDCLAW-77", dino: "Tyrannosaurus", value: 118 },
    { name: "NIGHTFALL", dino: "Dakotaraptor", value: 97 },
    { name: "GRAVEHOWL", dino: "Tyrannosaurus", value: 81 },
    { name: "VOLT", dino: "Carnotaurus", value: 64 },
    { name: "EMBERWING", dino: "Acrocanthosaurus", value: 52 },
    { name: "MOSSBACK", dino: "Stegosaurus", value: 30 },
    { name: "PALEHIDE", dino: "Diabloceratops", value: 18 },
  ],
  nesting: [
    { name: "APEX-01", dino: "Deinosuchus", value: "12", nest: "Mire Delta — 24-egg mound, unattended" },
    { name: "NIGHTFALL", dino: "Dakotaraptor", value: "8", nest: "Skyshard Isles — 7 eggs, brooding" },
    { name: "REDCLAW-77", dino: "Tyrannosaurus", value: "9", nest: "Void Ridge — 5 eggs, guarding" },
    { name: "MOSSBACK", dino: "Stegosaurus", value: "6", nest: "Crystal Basin — 8-egg ditch nest" },
    { name: "GRAVEHOWL", dino: "Tyrannosaurus", value: "7", nest: "Void Ridge — 4 eggs, guarding" },
    { name: "EMBERWING", dino: "Acrocanthosaurus", value: "5", nest: "Void Ridge — 3-egg mound" },
    { name: "VOLT", dino: "Carnotaurus", value: "4", nest: "Crystal Basin — 2 eggs, colonial" },
    { name: "PALEHIDE", dino: "Diabloceratops", value: "3", nest: "Crystal Basin — 3 eggs, herd nest" },
  ],
  shards: [
    { name: "REDCLAW-77", dino: "Trader", value: "48,200" },
    { name: "NIGHTFALL", dino: "Trader", value: "36,900" },
    { name: "APEX-01", dino: "Trader", value: "31,450" },
    { name: "VOLT", dino: "Trader", value: "22,100" },
    { name: "GRAVEHOWL", dino: "Trader", value: "18,750" },
    { name: "EMBERWING", dino: "Trader", value: "15,300" },
    { name: "PALEHIDE", dino: "Trader", value: "9,800" },
    { name: "MOSSBACK", dino: "Trader", value: "7,250" },
  ],
};

export const NESTING_GUIDE = [
  { species: "Tyrannosaurus", clutch: "4–6 eggs", nest: "Scraped ground nest", grounds: "Void Ridge", care: "High — guards until sub-adult" },
  { species: "Deinosuchus", clutch: "20–30 eggs", nest: "Buried sand mound", grounds: "Mire Delta", care: "None — eggs left to warm" },
  { species: "Carnotaurus", clutch: "1–2 eggs", nest: "Colonial ground nest", grounds: "Crystal Basin", care: "Moderate — rots nearby" },
  { species: "Dakotaraptor", clutch: "6–8 eggs", nest: "Brooded mound nest", grounds: "Skyshard Isles", care: "High — constant brooding" },
  { species: "Stegosaurus", clutch: "6–10 eggs", nest: "Ditch nest", grounds: "Crystal Basin", care: "Low — checks daily" },
  { species: "Acrocanthosaurus", clutch: "3–5 eggs", nest: "Vegetation mound", grounds: "Void Ridge", care: "High — defends the mound" },
  { species: "Diabloceratops", clutch: "2–4 eggs", nest: "Crater colonial nest", grounds: "Crystal Basin", care: "Herd — defended as a group" },
  { species: "Utahraptor", clutch: "5–7 eggs", nest: "Burrow nest", grounds: "Void Ridge", care: "Pack — shared guarding" },
  { species: "Pteranodon", clutch: "1–3 eggs", nest: "Cliff ledge scrape", grounds: "Skyshard Isles", care: "Moderate — rotated shifts" },
  { species: "Hypsilophodon", clutch: "8–12 eggs", nest: "Burrow nest", grounds: "South Plains", care: "Low — abandons at hatching" },
];

export const INITIAL_BOUNTIES = [
  { id: 1, target: "GRAVELORD", amount: 3000, placer: "REDCLAW-77" },
  { id: 2, target: "SANDSTRIDER", amount: 1200, placer: "NIGHTFALL" },
  { id: 3, target: "HOLLOW-9", amount: 2500, placer: "VOLT" },
];

export const GIVEAWAYS = [
  { id: 1, title: "Apex Starter Giveaway", prize: "Tyrannosaurus (Sub-Adult)", entries: 214, endsIn: "2d 4h" },
  { id: 2, title: "Shard Rain", prize: "5,000 Shards", entries: 389, endsIn: "18h" },
  { id: 3, title: "Skin Drop", prize: "Prismatic Skin", entries: 152, endsIn: "5d 9h" },
];

export const WINNERS = [
  "NIGHTFALL won the Goldenhour skin",
  "MOSSBACK won 2,500 shards",
  "VOLT won a Dakotaraptor",
  "PALEHIDE won the Gilded Scales skin",
];

export const PACKS = [
  { name: "Starter Pack", price: 2500, tier: "COMMON", accent: "#84cc16", pool: ["Hypsilophodon", "Stegosaurus", "Utahraptor", "Diabloceratops"] },
  { name: "Apex Pack", price: 7500, tier: "RARE", accent: "#e6b84c", pool: ["Carnotaurus", "Pteranodon", "Acrocanthosaurus", "Dakotaraptor"] },
  { name: "Mythic Pack", price: 20000, tier: "APEX", accent: "#a78bfa", pool: ["Tyrannosaurus", "Deinosuchus", "Tyrannosaurus", "Deinosuchus"] },
];

export const REWARD_CODES = { HAVEN2026: 500, CRYSTAL: 250, PRIME: 1000, GOLDENHOUR: 750 };

export const DROP_HISTORY = [
  { region: "Swamps Center", contents: "Prime Stegosaurus carcass", claimedBy: "APEX-01", ago: "2h" },
  { region: "East Plains", contents: "2,000 shard hoard", claimedBy: "NIGHTFALL", ago: "8h" },
  { region: "West Rail Access", contents: "Sub-Adult Utahraptor carcass", claimedBy: "VOLT", ago: "1d" },
];