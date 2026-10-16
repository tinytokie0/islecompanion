import React, { useEffect, useState } from "react";
import { Coins, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageShell from "@/components/portal/PageShell";
import CoinBadge from "@/components/wallet/CoinBadge";

const CATEGORY_LABELS = { cosmetic: "COSMETIC", title: "TITLE", badge: "BADGE", reward: "REWARD" };

export default function TokenShop() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [shopClosed, setShopClosed] = useState(false);
  const [items, setItems] = useState(null);
  const [ownedIds, setOwnedIds] = useState(new Set());
  const [busyId, setBusyId] = useState(null);
  const [status, setStatus] = useState(null); // { ok, text }

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await base44.functions.invoke("economyGetWallet", {});
        if (alive) {
          setBalance(res.data.wallet?.balance ?? 0);
          setShopClosed(res.data.config?.shop_enabled === false);
        }
      } catch {
        if (alive) setBalance(0);
      }
      try {
        const page = await base44.entities.ShopItem.filter({ active: true }, { sort: "price", limit: 50 });
        if (alive) setItems(page.items);
      } catch {
        if (alive) setItems([]);
      }
    };
    if (user) load();
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const page = await base44.entities.CoinTransaction.filter(
          { user_id: user.id, type: "purchase" },
          { limit: 200 }
        );
        if (alive) setOwnedIds(new Set(page.items.map((t) => t.item_id).filter(Boolean)));
      } catch {
        /* ownership info is best-effort */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const buy = async (item) => {
    setBusyId(item.id);
    setStatus(null);
    try {
      const res = await base44.functions.invoke("economyPurchase", { item_id: item.id });
      if (res.data.wallet) setBalance(res.data.wallet.balance);
      if (item.one_time) setOwnedIds((s) => new Set(s).add(item.id));
      setStatus({ ok: true, text: `Purchased "${item.name}" for ${item.price} HT.` });
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
    setBusyId(null);
  };

  return (
    <PageShell
      kicker="SPEND HT"
      title="TOKEN SHOP"
      sub="Rewards bought with Haven Tokens. Purchases are checked and deducted securely on the backend."
      right={<CoinBadge balance={balance} loading={balance === null} />}
    >
      {shopClosed && (
        <div className="glass-panel rounded-lg p-5 mb-5 font-mono text-xs text-amber-400">
          THE SHOP IS CURRENTLY CLOSED BY STAFF.
        </div>
      )}
      {status && (
        <div
          className={`glass-panel rounded-lg p-4 mb-5 flex items-center gap-2 font-mono text-xs ${
            status.ok ? "text-emerald-400" : "text-destructive"
          }`}
        >
          {status.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          {status.text.toUpperCase()}
        </div>
      )}

      {items === null ? (
        <div className="glass-panel rounded-lg p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> LOADING REWARDS...
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel rounded-lg p-10 text-center">
          <div className="font-heading text-xl text-foreground mb-2">No rewards listed yet</div>
          <p className="font-mono text-xs text-muted-foreground">
            Staff add rewards from the economy dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => {
            const owned = item.one_time && ownedIds.has(item.id);
            const affordable = (balance ?? 0) >= (item.price || 0);
            return (
              <div key={item.id} className="glass-panel rounded-lg p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-primary border border-primary/40 rounded px-2 py-0.5">
                    {CATEGORY_LABELS[item.category] || "REWARD"}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                    <Coins size={12} className="text-primary" /> {item.price} HT
                  </span>
                </div>
                <div className="font-heading text-lg text-foreground mb-1 flex items-center gap-2">
                  {item.name}
                  {owned && <Sparkles size={13} className="text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1">
                  {item.description || "Administrator-approved reward."}
                </p>
                {owned ? (
                  <div className="font-mono text-[10px] tracking-[0.2em] text-emerald-400 border border-emerald-400/40 rounded px-3 py-2 text-center">
                    OWNED
                  </div>
                ) : (
                  <button
                    onClick={() => buy(item)}
                    disabled={busyId === item.id || shopClosed || !affordable}
                    className={`font-mono text-[10px] tracking-[0.2em] rounded px-3 py-2 transition-colors flex items-center justify-center gap-2 ${
                      affordable && !shopClosed
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    {busyId === item.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> PURCHASING...
                      </>
                    ) : affordable && !shopClosed ? (
                      "PURCHASE"
                    ) : (
                      "NOT ENOUGH HT"
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}