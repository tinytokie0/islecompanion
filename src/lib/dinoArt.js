// Realistic 3D dino key art per species, shown in the dino display cards.
const ART = {
  tyrannosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/054e123a3_generated_image.png",
  carnotaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/21a00079a_generated_image.png",
  dakotaraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/7b398e566_generated_image.png",
  stegosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/3f05f8aaf_generated_image.png",
  acrocanthosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/684c3786b_generated_image.png",
  diabloceratops: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/2b3264fd6_generated_image.png",
  utahraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/6523f237f_generated_image.png",
  pteranodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/fdf02e7c3_generated_image.png",
  deinosuchus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/fa027704c_generated_image.png",
  hypsilophodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/82e3e5f66_generated_image.png",
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