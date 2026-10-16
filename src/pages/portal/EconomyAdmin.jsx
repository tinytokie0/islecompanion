import React, { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageShell from "@/components/portal/PageShell";
import AdminConfigForm from "@/components/wallet/AdminConfigForm";
import AdminWallets from "@/components/wallet/AdminWallets";
import AdminShopItems from "@/components/wallet/AdminShopItems";
import TransactionTable from "@/components/wallet/TransactionTable";

const DEFAULTS = {
  earning_enabled: true,
  coins_per_interval: 10,
  interval_minutes: 30,
  max_backlog_intervals: 3,
  feed_fresh_minutes: 12,
  shop_enabled: true,
};

export default function EconomyAdmin() {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    let alive = true;
    (async () => {
      try {
        const page = await base44.entities.EconomyConfig.filter({}, { limit: 1 });
        if (page.items.length > 0) {
          if (alive) setConfig(page.items[0]);
        } else {
          const created = await base44.entities.EconomyConfig.create(DEFAULTS);
          if (alive) setConfig(created);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <PageShell kicker="ADMIN" title="ECONOMY" sub="Administrator controls for the Haven Tokens economy.">
        <div className="glass-panel rounded-lg p-10 text-center">
          <ShieldAlert size={22} className="mx-auto mb-3 text-destructive" />
          <div className="font-heading text-xl text-foreground mb-2">Admins only</div>
          <p className="font-mono text-xs text-muted-foreground">
            This dashboard is restricted to server staff.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      kicker="ADMIN"
      title="ECONOMY"
      sub="Configure Haven Tokens rules, adjust player balances and manage shop rewards. Every balance change is authorized server-side and recorded."
    >
      {loading ? (
        <div className="glass-panel rounded-lg p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> LOADING ECONOMY...
        </div>
      ) : (
        <>
          <AdminConfigForm config={config} onSaved={setConfig} />
          <AdminWallets />
          <AdminShopItems />
          <div className="mb-2">
            <TransactionTable refreshKey={config?.updated_date || 0} limit={30} canRefund />
          </div>
        </>
      )}
    </PageShell>
  );
}