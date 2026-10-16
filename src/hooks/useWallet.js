import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// The signed-in player's Haven Tokens wallet, the economy rules and live
// earning progress, resolved server-side. Returns
// { loading, wallet, config, earn, error }.
export default function useWallet(refreshMs = 60000) {
  const [state, setState] = useState({ loading: true, wallet: null, config: null, earn: null, error: null });

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
            error: null,
          });
        }
      } catch (e) {
        if (alive) setState((s) => ({ ...s, loading: false, error: e.message }));
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