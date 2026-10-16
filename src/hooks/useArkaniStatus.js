import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Live server status from the Arkanis API (signed-in members only).
// Returns { data, loading, authed } where data is { online, players, name, error, configured } or null.
export default function useArkaniStatus(pollMs = 60000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!(await base44.auth.isAuthenticated())) {
          if (!cancelled) { setAuthed(false); setLoading(false); }
          return;
        }
        setAuthed(true);
        const res = await base44.functions.invoke("arkanisServerStatus", {});
        if (!cancelled) setData(res.data || null);
      } catch {
        if (!cancelled) setData(null);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    const timer = setInterval(load, pollMs);
    return () => { cancelled = true; clearInterval(timer); };
  }, [pollMs]);

  return { data, loading, authed };
}