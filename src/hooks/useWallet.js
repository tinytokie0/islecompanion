import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// The signed-in player's Haven Tokens wallet, the economy rules, live earning
// progress and daily claim status, resolved server-side.
//
// One shared store for the whole app: every component (top-right chip, casino,
// shop, claim cards) subscribes to the same wallet, so any refresh — a casino
// bet, a quest claim, a daily claim — updates the top-right balance instantly.
// A single polling interval and a single 'ht-claimed' listener serve everyone.
const EMPTY = {
  loading: true,
  wallet: null,
  config: null,
  earn: null,
  daily_claim: null,
  error: null,
};

let state = EMPTY;
const listeners = new Set();
let timer = null;
let inFlight = null;

const notify = () => {
  for (const listener of listeners) listener(state);
};

// Fetch the wallet once; concurrent callers share the same request.
const load = () => {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res = await base44.functions.invoke("economyGetWallet", {});
      state = {
        loading: false,
        wallet: res.data.wallet,
        config: res.data.config,
        earn: res.data.earn,
        daily_claim: res.data.daily_claim || null,
        error: null,
      };
    } catch (e) {
      state = { ...state, loading: false, error: e.message };
    }
    inFlight = null;
    notify();
  })();
  return inFlight;
};

const startPolling = () => {
  if (timer) return;
  timer = setInterval(load, 30000);
  window.addEventListener("ht-claimed", load);
};

// No subscribers left: stop the poll and reset, so a sign-in by a different
// user never sees the previous wallet.
const stopPolling = () => {
  if (listeners.size > 0) return;
  clearInterval(timer);
  timer = null;
  window.removeEventListener("ht-claimed", load);
  state = EMPTY;
};

export default function useWallet() {
  const [snap, setSnap] = useState(state);

  useEffect(() => {
    listeners.add(setSnap);
    load();
    startPolling();
    return () => {
      listeners.delete(setSnap);
      stopPolling();
    };
  }, []);

  return { ...snap, refresh: load };
}