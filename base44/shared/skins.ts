// Shop skin catalog: the single server-side source the skinShop function
// validates purchases against. Keep the entries identical to the SKINS
// list in src/lib/portalData.js (the frontend's display copy).
export const SHOP_SKINS = [
  { id: "ember", name: "Ember Stripe", pattern: "Brindle", hex: "#c98a5e", price: 560 },
  { id: "gilded", name: "Gilded Scales", pattern: "Wild Type", hex: "#e6b84c", price: 720 },
  { id: "amethyst", name: "Amethyst Veil", pattern: "Melanistic", hex: "#a78bfa", price: 880 },
  { id: "abyss", name: "Abyss Watcher", pattern: "Melanistic", hex: "#1e3a8a", price: 820 },
  { id: "bone", name: "Bleached Bone", pattern: "Leucistic", hex: "#e7e5e4", price: 640 },
  { id: "bloodmoon", name: "Blood Moon", pattern: "Erythristic", hex: "#dc2626", price: 900 },
  { id: "moss", name: "Mossback", pattern: "Wild Type", hex: "#3d5a3d", price: 500 },
  { id: "prism", name: "Prismatic", pattern: "Crystalline", hex: "#c4b5fd", price: 850 },
];