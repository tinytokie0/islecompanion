import { useMemo } from "react";
import useLiveDinos from "@/hooks/useLiveDinos";

// Real island data: the live feed grouped by species — how many of each
// species are currently on the island and the top growth seen for each.
export default function useIslandSpecies({ windowMinutes = 24 * 60, refreshMs = 30000 } = {}) {
  const { dinos, loading } = useLiveDinos({ windowMinutes, refreshMs, limit: 200 });

  const species = useMemo(() => {
    const map = new Map();
    for (const d of dinos || []) {
      const key = d.species || "Unknown";
      const cur = map.get(key) || { species: key, count: 0, topGrowth: 0 };
      cur.count += 1;
      cur.topGrowth = Math.max(cur.topGrowth, d.growth || 0);
      map.set(key, cur);
    }
    return [...map.values()].sort(
      (a, b) => b.count - a.count || b.topGrowth - a.topGrowth
    );
  }, [dinos]);

  return { species, loading };
}