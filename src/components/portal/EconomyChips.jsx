import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import useWallet from "@/hooks/useWallet";
import CoinBadge from "@/components/wallet/CoinBadge";

// Top-right balance chip shown on every page: the player's real Haven
// Tokens (HT) wallet, live from the server. Any claimed HT announces itself
// with an 'ht-claimed' window event and flashes a "+X HT" chip right here.
// Hidden when signed out.
export default function EconomyChips() {
  const { isAuthenticated } = useAuth();
  const { loading, wallet } = useWallet();
  const [claimed, setClaimed] = useState(null);

  useEffect(() => {
    const onClaimed = (e) => {
      const amount = Number(e.detail?.amount);
      if (Number.isFinite(amount) && amount > 0) setClaimed(amount);
    };
    window.addEventListener("ht-claimed", onClaimed);
    return () => window.removeEventListener("ht-claimed", onClaimed);
  }, []);

  useEffect(() => {
    if (claimed == null) return;
    const t = setTimeout(() => setClaimed(null), 4000);
    return () => clearTimeout(t);
  }, [claimed]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-2 w-fit">
      {claimed != null && (
        <span className="font-mono text-[11px] tracking-[0.15em] text-accent border border-accent/40 bg-accent/10 rounded px-3 py-1.5 animate-flicker">
          +{claimed.toLocaleString()} HT
        </span>
      )}
      <CoinBadge balance={wallet?.balance} loading={loading} />
    </div>
  );
}