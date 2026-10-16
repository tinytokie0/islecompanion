import React from "react";
import { useAuth } from "@/lib/AuthContext";
import useWallet from "@/hooks/useWallet";
import CoinBadge from "@/components/wallet/CoinBadge";

// Top-right balance chip shown on every page: the player's real Haven
// Tokens (HT) wallet, live from the server. Hidden when signed out.
export default function EconomyChips() {
  const { isAuthenticated } = useAuth();
  const { loading, wallet } = useWallet();

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center w-fit">
      <CoinBadge balance={wallet?.balance} loading={loading} />
    </div>
  );
}