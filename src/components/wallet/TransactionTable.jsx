import React, { useEffect, useState } from "react";
import { Loader2, Undo2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TYPE_META = {
  playtime: { label: "PLAYTIME", cls: "text-emerald-400 border-emerald-400/40" },
  purchase: { label: "PURCHASE", cls: "text-rose-400 border-rose-400/40" },
  staff_grant: { label: "STAFF GRANT", cls: "text-sky-400 border-sky-400/40" },
  staff_deduct: { label: "STAFF DEDUCTION", cls: "text-amber-400 border-amber-400/40" },
  refund: { label: "REFUND", cls: "text-sky-400 border-sky-400/40" },
};

// The signed-in player's own ledger, read-only by design: every record was
// written by a backend function and can never be edited by a player.
export default function TransactionTable({ refreshKey = 0, limit = 50, canRefund = false }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [refundBusy, setRefundBusy] = useState(null);
  const [refundNote, setRefundNote] = useState(null);

  const refundTx = async (tx) => {
    if (!window.confirm(`Refund "${tx.item_name}" (${Math.abs(tx.amount)} HT) to this player?`)) return;
    setRefundBusy(tx.id);
    setRefundNote(null);
    try {
      await base44.functions.invoke("economyAdjust", {
        type: "refund",
        user_id: tx.user_id,
        item_id: tx.item_id,
        amount: Math.abs(tx.amount),
        reason: `Refund of purchase: ${tx.item_name}`,
      });
      setRefundNote({ ok: true, text: `REFUNDED ${Math.abs(tx.amount)} HT FOR ${tx.item_name}` });
      const page = await base44.entities.CoinTransaction.filter({}, { sort: "-created_date", limit });
      setItems(page.items);
    } catch (e) {
      setRefundNote({ ok: false, text: e?.response?.data?.error || e.message });
    }
    setRefundBusy(null);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const page = await base44.entities.CoinTransaction.filter({}, { sort: "-created_date", limit });
        if (alive) setItems(page.items);
      } catch (e) {
        if (alive) setError(e.message);
      }
    })();
    return () => {
      alive = false;
    };
  }, [refreshKey, limit]);

  if (error) {
    return (
      <div className="glass-panel rounded-lg p-6 font-mono text-xs text-destructive">
        COULD NOT LOAD TRANSACTIONS — {error.toUpperCase()}
      </div>
    );
  }

  if (items === null) {
    return (
      <div className="glass-panel rounded-lg p-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Loader2 size={13} className="animate-spin" /> READING LEDGER...
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-lg p-4 md:p-6">
      <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4">
        TRANSACTION HISTORY
      </div>
      {refundNote && (
        <div className={`font-mono text-[10px] mb-3 ${refundNote.ok ? "text-emerald-400" : "text-destructive"}`}>
          {refundNote.text.toUpperCase()}
        </div>
      )}
      {items.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground py-4">
          No transactions yet — earn your first Haven Tokens by playing on the server.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {items.map((tx) => {
            const meta = TYPE_META[tx.type] || { label: tx.type.toUpperCase(), cls: "text-muted-foreground border-border" };
            const positive = (tx.amount || 0) >= 0;
            return (
              <div key={tx.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                <div className="sm:w-40 flex items-center gap-2 shrink-0">
                  <span className={`font-mono text-[9px] tracking-[0.15em] border rounded px-1.5 py-0.5 ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground truncate">{tx.reason}</div>
                  <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                    {tx.created_date ? new Date(tx.created_date).toLocaleString() : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`font-mono text-xs sm:text-right ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                    {positive ? "+" : ""}
                    {tx.amount} HT
                  </div>
                  {canRefund && tx.type === "purchase" && tx.item_id && (
                    <button
                      onClick={() => refundTx(tx)}
                      disabled={refundBusy === tx.id}
                      title={`Refund ${tx.item_name}`}
                      className="font-mono text-[9px] tracking-[0.15em] border border-border text-muted-foreground px-2 py-1 rounded-sm hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {refundBusy === tx.id ? <Loader2 size={10} className="animate-spin" /> : <Undo2 size={10} />}
                      REFUND
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}