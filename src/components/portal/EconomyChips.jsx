import React from "react";
import { Coins } from "lucide-react";
import useWallet from "@/hooks/useWallet";
import CoinBadge from "@/components/wallet/CoinBadge";

// Header balance chips: the player's real Haven Tokens wallet (live from the
// server) plus their persistent play-shard balance for the portal mini-games.
export default function EconomyChips({ shards }) {
  const { loading, wallet } = useWallet();

  return (
    <div className="flex items-center gap-2 w-fit">
      <CoinBadge balance={wallet?.balance} loading={loading} />
      <div className="glass-panel-light px-4 py-2 flex items-center gap-2 w-fit">
        <Coins size={14} className="text-accent" />
        <span className="font-mono text-xs text-foreground">{shards.toLocaleString()}</span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">SHARDS</span>
      </div>
    </div>
  );
}