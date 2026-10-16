import { base44 } from "@/api/base44Client";
import useWallet from "./useWallet";

// The player's real Haven Tokens (HT) balance plus server-side spend/award
// helpers for portal activities (casino, shop, packs, trading, bounties).
// Balance changes always go through the economyGameTx backend function.
export default function useHt(refreshMs = 30000) {
  const { loading, wallet, refresh } = useWallet(refreshMs);
  const balance = wallet?.balance ?? 0;

  const tx = async (action, amount, reason) => {
    const res = await base44.functions.invoke("economyGameTx", { action, amount, reason });
    await refresh();
    return res.data;
  };

  const spend = (amount, reason) => tx("spend", amount, reason);
  const award = (amount, reason) => tx("award", amount, reason);

  return { loading, balance, refresh, spend, award };
}