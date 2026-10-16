import React, { useEffect, useState } from "react";
import { Coins, Loader2, CheckCircle2, XCircle, Sparkles, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageShell from "@/components/portal/PageShell";
import CoinBadge from "@/components/wallet/CoinBadge";
import { Image } from "@/components/ui/image";

const CATEGORY_LABELS = { cosmetic: "COSMETIC", title: "TITLE", badge: "BADGE", reward: "REWARD" };

export default function TokenShop() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [shopClosed, setShopClosed] = useState(false);
  const [items, setItems] = useState(null);
  const [purchases, setPurchases] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [status, setStatus] = useState(null); // { ok, text }

  const loadPurchases = async () => {
    try {
      const page = await base44.entities.Purchase.filter(
        { user_id: user.id },
        { sort: "-created_date", limit: 100 }
      );
      setPurchases(page.items);
    } catch {
      setPurchases([]);
    }
  };

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
    if (user) {
      load();
      loadPurchases();
    }
    return () => {
      alive = false;
    };
  }, [user]);

  // Live ownership state: unrefunded purchases
  const owned = new Set(
    (purchases || []).filter((p) => !p.refunded).map((p) => p.item_id)
  );
  const myRewards = (purchases || []).filter((p) => !p.refunded);

  const buy = async (item) => {
    setBusyId(item.id);
    setStatus(null);
    try {
      const res = await base44.functions.invoke("economyPurchase", { item_id: item.id });
      if (res.data.wallet) setBalance(res.data.wallet.balance);
      setStatus({ ok: true, text: `Purchased "${item.name}" for ${item.price} HT.` });
      await loadPurchases();
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
    setBusyId(null);
  };

  return (
    <PageShell
      kicker="SPEND HT"
      title="TOKEN SHOP"
      sub="Website rewards bought with Haven Tokens. Purchases are checked and deducted securely on the backend. These rewards are website-only — nothing changes your dinosaur in-game."
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

      {/* My rewards */}
      {user && myRewards.length > 0 && (
        <div className="glass-panel rounded-lg p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={13} className="text-primary" />
            <span className="font-mono text-[10px] tracking-[0.25em] text-primary">MY REWARDS</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {myRewards.map((p) => (
              <span
                key={p.id}
                className="font-mono text-[10px] tracking-[0.15em] border border-primary/40 text-foreground rounded px-3 py-1.5 flex items-center gap-2"
              >
                {CATEGORY_LABELS[p.category] || "REWARD"} — {p.item_name}
              </span>
            ))}
          </div>
          <p className="font-mono text-[9px] text-muted-foreground mt-3">
            WEBSITE-ONLY REWARDS: TITLES, BADGES AND PROFILE COSMETICS. YOUR IN-GAME DINOSAUR IS NEVER CHANGED.
          </p>
        </div>
      )}

      {/* Catalog */}
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
            const isOwned = item.one_time && owned.has(item.id);
            const affordable = (balance ?? 0) >= (item.price || 0);
            return (
              <div key={item.id} className="glass-panel rounded-lg p-5 flex flex-col">
                {item.image_url && (
                  <div className="rounded overflow-hidden mb-4 h-32">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fittingType="fill"
                      className="w-full h-32"
                    />
                  </div>
                )}
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
                  {isOwned && <Sparkles size={13} className="text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1">
                  {item.description || "Administrator-approved reward."}
                </p>
                {isOwned ? (
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

      {/* Purchase history */}
      {purchases !== null && purchases.length > 0 && (
        <div className="glass-panel rounded-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <History size={13} className="text-muted-foreground" />
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">PURCHASE HISTORY</span>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {purchases.map((p) => (
              <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                <div className="sm:w-32 shrink-0">
                  <span className="font-mono text-[9px] tracking-[0.15em] border border-border text-muted-foreground rounded px-1.5 py-0.5">
                    {CATEGORY_LABELS[p.category] || "REWARD"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground truncate flex items-center gap-2">
                    {p.item_name}
                    {p.refunded && (
                      <span className="font-mono text-[8px] tracking-[0.15em] text-amber-400 border border-amber-400/40 rounded px-1.5 py-0.5">
                        REFUNDED
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                    {p.created_date ? new Date(p.created_date).toLocaleString() : ""}
                  </div>
                </div>
                <div className="font-mono text-xs shrink-0 sm:text-right text-rose-400">
                  -{p.price} HT
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}