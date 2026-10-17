import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Live dinos recorded from the island feed within the last `windowMinutes`.
export default function useLiveDinos({ windowMinutes = 15, refreshMs = 15000, sort = "-last_seen", limit = 50 } = {}) {
  const [dinos, setDinos] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
        const page = await base44.entities.LiveDino.filter({ last_seen: { $gte: since } }, { sort, limit });
        if (alive) setDinos(page.items);
      } catch {
        if (alive) setDinos([]);
      }
    };
    load();
    const timer = setInterval(load, refreshMs);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [windowMinutes, refreshMs, sort, limit]);

  return { dinos, loading: dinos === null };
}