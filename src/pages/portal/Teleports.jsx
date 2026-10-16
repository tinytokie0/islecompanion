import React, { useEffect, useState, useCallback } from "react";
import { Zap } from "lucide-react";
import TeleportHero from "@/components/teleports/TeleportHero";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";
import WaygateCard from "@/components/teleports/WaygateCard";
import WaygateHistory from "@/components/teleports/WaygateHistory";
import TeleportBar from "@/components/teleports/TeleportBar";
import CoinBadge from "@/components/wallet/CoinBadge";
import useWallet from "@/hooks/useWallet";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function Teleports() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { wallet } = useWallet();
  const [gates, setGates] = useState(null);
  const [requests, setRequests] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    const gatePage = await base44.entities.Waygate.filter(
      isAdmin ? {} : { active: true },
      { sort: "-created_date", limit: 50 }
    );
    setGates(gatePage.items || []);
    const reqPage = await base44.entities.TeleportRequest.filter(
      { user_id: user.id },
      { sort: "-created_date", limit: 10 }
    );
    setRequests(reqPage.items || []);
  }, [isAdmin, user?.id, reloadKey]);

  useEffect(() => { load(); }, [load]);

  const onUsed = () => {
    setReloadKey((k) => k + 1);
  };

  return (
    <div>
      <TeleportHero
        sub="Pick a destination, teleport instantly, and staff deliver you in-game. Every gate shares one 10-minute cooldown."
        right={
          <div className="flex items-center justify-center">
            <CoinBadge balance={wallet?.balance} />
          </div>
        }
      />

      <section className="px-4 md:px-8 py-8 md:py-10">
        <div className="max-w-[1500px] mx-auto">
          {gates === null ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-6 animate-pulse h-56" />
              ))}
            </div>
          ) : gates.length === 0 ? (
            <div className="glass-panel rounded-lg p-10 text-center mb-8">
              <Zap size={22} className="mx-auto mb-3 text-muted-foreground" />
              <div className="font-heading text-xl text-foreground mb-2">No waygates configured yet</div>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                "Waygates appear here as soon as admins set them up."
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {gates.map((gate) => (
                <WaygateCard
                  key={gate.id}
                  gate={gate}
                  selected={selected?.id === gate.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}

          {selected && (
            <TeleportBar key={selected.id} gate={selected} onUsed={onUsed} />
          )}

          <WaygateHistory requests={requests || []} />

          <div className="mt-8">
            <LiveIslandStrip />
          </div>
        </div>
      </section>
    </div>
  );
}