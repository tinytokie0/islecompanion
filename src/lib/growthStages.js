// In-game growth stages mapped to overall growth %
export const GROWTH_STAGES = [
  { name: "HATCHLING", at: 0 },
  { name: "JUVENILE", at: 15 },
  { name: "ADOLESCENT", at: 35 },
  { name: "SUB-ADULT", at: 60 },
  { name: "PRIME", at: 100 },
];

// Returns { current, next } for a growth percentage
export function stageFor(growth) {
  let current = GROWTH_STAGES[0];
  let next = GROWTH_STAGES[1] || null;
  for (let i = 0; i < GROWTH_STAGES.length; i++) {
    if (growth >= GROWTH_STAGES[i].at) {
      current = GROWTH_STAGES[i];
      next = GROWTH_STAGES[i + 1] || null;
    }
  }
  return { current, next };
}