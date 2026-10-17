import { base44 } from "@/api/base44Client";
import useWallet from "./useWallet";

// The player's real Haven Tokens (HT) balance plus a server-side spend helper
// for portal activities (dino shop, packs, trading). Wins are never sent from
// the browser: casino payouts settle server-side in the casinoPlay function.
export default function useHt(refreshMs = 30000) {
  const { loading, wallet, refresh } = useWallet(refreshMs);
  const balance = wallet?.balance ?? 0;

  const spend = async (amount, reason) => {
    const res = await base44.functions.invoke("economyGameTx", { action: "spend", amount, reason });
    await refresh();
    return res.data;
  };

  return { loading, balance, refresh, spend };
}