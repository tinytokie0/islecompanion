import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Live Game Host Bros panel status for signed-in members.
// shape: { authed, loading, data } where data is { configured, online, state, serverName, error? }
const POLL_MS = 30000;

export default function useGamehostStatus() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (!(await base44.auth.isAuthenticated())) {
          if (!cancelled) {
            setAuthed(false);
            setLoading(false);
          }
          return;
        }
        const res = await base44.functions.invoke("gamehostServerStatus", {});
        if (!cancelled) {
          setAuthed(true);
          setData(res.data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { authed, loading, data };
}