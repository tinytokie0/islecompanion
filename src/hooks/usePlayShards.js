import { useState } from "react";
import { START_SHARDS } from "@/lib/portalData";

const KEY = "haven_play_shards";

// The player's own play-shard balance, persisted on this device. The portal
// mini-games (casino, packs, trading, bounties) spend and earn from it.
// No demo pre-load after the first visit: the balance is genuinely the
// player's own, saved between sessions.
export default function usePlayShards() {
  const [shards, setShardsState] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved !== null) return parseInt(saved, 10) || 0;
      localStorage.setItem(KEY, String(START_SHARDS));
      return START_SHARDS;
    } catch {
      return START_SHARDS;
    }
  });

  const setShards = (updater) =>
    setShardsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(KEY, String(next));
      } catch {
        /* storage unavailable — balance stays in memory */
      }
      return next;
    });

  return [shards, setShards];
}