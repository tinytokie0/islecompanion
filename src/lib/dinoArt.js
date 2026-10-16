// Realistic 3D dino key art per species, shown in the dino display cards.
const ART = {
  tyrannosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/f174a4913_generated_image.png",
  carnotaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/c96f29461_generated_image.png",
  dakotaraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/5d6a407e9_generated_image.png",
  stegosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/5fa797263_generated_image.png",
  acrocanthosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/65a5ed948_generated_image.png",
  diabloceratops: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/f383979e5_generated_image.png",
  utahraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/96e1ec3a2_generated_image.png",
  pteranodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/75743c42f_generated_image.png",
  deinosuchus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/18a903088_generated_image.png",
  hypsilophodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/a5bf73f71_generated_image.png",
};

const FALLBACK = ART.tyrannosaurus;

// Match a live species string ("Tyrannosaurus", "carno-014"...) to its art.
export function dinoArtFor(species) {
  const s = String(species || "").toLowerCase();
  for (const key of Object.keys(ART)) {
    if (s.includes(key.slice(0, 5))) return ART[key];
  }
  return FALLBACK;
}