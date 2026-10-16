// Cinematic 3D action art per playable Evrima species, shown in the dino
// display cards.
const ART = {
  tyrannosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/929816ced_generated_image.png",
  deinosuchus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/16d169adb_generated_image.png",
  allosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/c0ece7fe5_generated_image.png",
  carnotaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/74911410f_generated_image.png",
  austroraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/0fde14e71_generated_image.png",
  pteranodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/263a007f1_generated_image.png",
  ceratosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/2c9aa89f4_generated_image.png",
  omniraptor: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/576a0ef38_generated_image.png",
  dilophosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/567b630e2_generated_image.png",
  herrerasaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/1b5d402ce_generated_image.png",
  troodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/6d03e3c01_generated_image.png",
  triceratops: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/b6cc7abe4_generated_image.png",
  maiasaura: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/c9cfdcaae_generated_image.png",
  stegosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/5c3a0abc6_generated_image.png",
  tenontosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/a7bc20fdd_generated_image.png",
  pachycephalosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/1265ae20f_generated_image.png",
  diabloceratops: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/aeeb0cb58_generated_image.png",
  kentrosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/00953892a_generated_image.png",
  dryosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/037223ad4_generated_image.png",
  hypsilophodon: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/2bf329b93_generated_image.png",
  gallimimus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/3ef6f542a_generated_image.png",
  beipiaosaurus: "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/c60d8b6af_generated_image.png",
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