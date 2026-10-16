import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

// The signed-in player's Haven Tokens wallet, the economy rules, live earning
// progress and daily claim status, resolved server-side. Returns
// { loading, wallet, config, earn, daily_claim, error, refresh }.
export default function useWallet(refreshMs = 60000) {
  const [state, setState] = useState({
    loading: true,
    wallet: null,
    config: null,
    earn: null,
    daily_claim: null,
    error: null,
  });
  const loadRef = useRef(() => {});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await base44.functions.invoke("economyGetWallet", {});
        if (alive) {
          setState({
            loading: false,
            wallet: res.data.wallet,
            config: res.data.config,
            earn: res.data.earn,
            daily_claim: res.data.daily_claim || null,
            error: null,
          });
        }
      } catch (e) {
        if (alive) setState((s) => ({ ...s, loading: false, error: e.message }));
      }
    };
    loadRef.current = load;
    load();
    const timer = setInterval(load, refreshMs);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [refreshMs]);

  return { ...state, refresh: () => loadRef.current() };
}