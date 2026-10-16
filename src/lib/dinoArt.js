// Cinematic 3D game-render art per playable Evrima species, styled after the
// Haven key art (golden rim light, glowing jungle), shown in the dino cards.
const ART = {
  tyrannosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/3a8146a4a_generated_image.png",
  deinosuchus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/3568a8b47_generated_image.png",
  allosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/e6cecd1c1_generated_image.png",
  carnotaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/4efb0f04f_generated_image.png",
  austroraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/2f9a5779e_generated_image.png",
  pteranodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/b4d03a62d_generated_image.png",
  ceratosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0623691bb_generated_image.png",
  omniraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/7f8f0f4de_generated_image.png",
  dilophosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/e5f4688fa_generated_image.png",
  herrerasaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/a1739a432_generated_image.png",
  troodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0699b9a01_generated_image.png",
  triceratops: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/affa61ef3_generated_image.png",
  maiasaura: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/324919a15_generated_image.png",
  stegosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/5923243e0_generated_image.png",
  tenontosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/7ed209710_generated_image.png",
  pachycephalosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/7998530f0_generated_image.png",
  diabloceratops: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/2eae15277_generated_image.png",
  kentrosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d8cb45549_generated_image.png",
  dryosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/7833a1e3b_generated_image.png",
  hypsilophodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0699b9a01_generated_image.png",
  gallimimus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/1c8e8736e_generated_image.png",
  beipiaosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/703fdefea_generated_image.png",
};

const FALLBACK = ART.tyrannosaurus;

// In-game shorthand players and feeds use ("Tenonto", "Hypsi", "T-Rex"...).
const ALIASES = {
  trex: "tyrannosaurus",
  trike: "triceratops",
  tenonto: "tenontosaurus",
  hypsi: "hypsilophodon",
  dilo: "dilophosaurus",
  carno: "carnotaurus",
  pachy: "pachycephalosaurus",
  omni: "omniraptor",
};

// Match a live species string ("Tyrannosaurus", "TRIC-002", "Tenonto"...)
// to its art by full name, so "Triceratops" never grabs Ceratosaurus.
export function dinoArtFor(species) {
  const s = String(species || "").toLowerCase().replace(/[^a-z]/g, "");
  for (const [alias, key] of Object.entries(ALIASES)) {
    if (s.includes(alias)) return ART[key];
  }
  for (const key of Object.keys(ART)) {
    if (s.includes(key)) return ART[key];
  }
  return FALLBACK;
}