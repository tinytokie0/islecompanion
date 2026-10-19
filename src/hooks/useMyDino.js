import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// The signed-in player's own dino, resolved via their linked Steam account.
// Returns { loading, linked, dino } — dino is null when unlinked or not in game.
export default function useMyDino(refreshMs = 30000) {
  const [state, setState] = useState({ loading: true, linked: false, dino: null });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!alive) return;
        if (!authed) {
          setState({ loading: false, linked: false, dino: null });
          return;
        }
        const links = await base44.entities.SteamLink.filter({});
        if (!alive) return;
        const link = links[0];
        if (!link) {
          setState({ loading: false, linked: false, dino: null });
          return;
        }
        const page = await base44.entities.LiveDino.filter(
          { steam_id: link.steam_id },
          { sort: "-last_seen", limit: 1 }
        );
        if (alive) setState({ loading: false, linked: true, dino: page.items[0] || null });
      } catch {
        if (alive) setState({ loading: false, linked: false, dino: null });
      }
    };
    load();
    const timer = setInterval(load, refreshMs);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [refreshMs]);

  return state;
}