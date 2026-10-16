// Cinematic 3D action art per playable Evrima species, shown in the dino
// display cards.
const ART = {
  tyrannosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/054e123a3_generated_image.png",
  carnotaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/21a00079a_generated_image.png",
  omniraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/7b398e566_generated_image.png",
  stegosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/3f05f8aaf_generated_image.png",
  diabloceratops: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/2b3264fd6_generated_image.png",
  pteranodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/fdf02e7c3_generated_image.png",
  deinosuchus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/fa027704c_generated_image.png",
  hypsilophodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/82e3e5f66_generated_image.png",
  ceratosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/6ca747bb1_generated_image.png",
  dilophosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/28ea97a69_generated_image.png",
  herrerasaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/df1c85f01_generated_image.png",
  troodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d0911ce29_generated_image.png",
  allosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0bd3d9fa1_generated_image.png",
  austroraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/19440a436_generated_image.png",
  dryosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0aa74a2c7_generated_image.png",
  tenontosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/c76517530_generated_image.png",
  pachycephalosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0b6731922_generated_image.png",
  maiasaura: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/c7744f4fd_generated_image.png",
  triceratops: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/b563ad9d4_generated_image.png",
  kentrosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/9cb4a6f36_generated_image.png",
  beipiaosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/039a2ff0a_generated_image.png",
  gallimimus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/5430becae_generated_image.png",
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