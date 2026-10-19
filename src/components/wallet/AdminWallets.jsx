import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMPTY = { user_id: "", type: "staff_grant", amount: "", reason: "" };

// Player wallet list with the staff adjustment panel. Balance changes go
// through the economyAdjust backend function, which enforces admin rights,
// blocks negative balances and records the reason in the ledger.
export default function AdminWallets() {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const load = async () => {
    try {
      const wallets = await base44.entities.Wallet.list({ limit: 200 });
      const users = await base44.entities.User.list({ limit: 500 });
      const byId = new Map(users.items.map((u) => [u.id, u]));
      setRows(wallets.items.map((w) => ({ wallet: w, user: byId.get(w.user_id) })));
    } catch {
      setRows([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const adjust = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await base44.functions.invoke("economyAdjust", {
        user_id: form.user_id,
        type: form.type,
        amount: Number(form.amount),
        reason: form.reason.trim(),
      });
      setStatus({ ok: true, text: "Adjustment applied and recorded in the ledger." });
      setForm((f) => ({ ...f, amount: "", reason: "" }));
      await load();
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
    setBusy(false);
  };

  const valid = form.user_id && Number(form.amount) >= 1 && form.reason.trim();

  return (
    <div className="glass-panel rounded-lg p-6 mb-6">
      <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">
        PLAYER WALLETS &amp; ADJUSTMENTS
      </div>

      {/* Adjustment panel */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <select
          value={form.user_id}
          onChange={(e) => setForm({ ...form, user_id: e.target.value })}
          className="bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
        >
          <option value="">Select player…</option>
          {(rows || []).map(({ wallet, user }) => (
            <option key={wallet.id} value={wallet.user_id}>
              {(user && (user.email || user.id)) || wallet.user_id}
            </option>
          ))}
        </select>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
        >
          <option value="staff_grant">Grant HT</option>
          <option value="staff_deduct">Deduct HT</option>
          <option value="refund">Refund HT</option>
        </select>
        <input
          type="number"
          min="1"
          placeholder="Amount HT"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/60"
        />
        <input
          placeholder="Reason (recorded)"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          className="bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
        />
      </div>
      <button
        onClick={adjust}
        disabled={busy || !valid}
        className="mb-5 bg-primary text-primary-foreground font-mono text-[10px] tracking-[0.2em] px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : null} APPLY ADJUSTMENT
      </button>

      {status && (
        <div className={`font-mono text-[10px] mb-3 ${status.ok ? "text-emerald-400" : "text-destructive"}`}>
          {status.text.toUpperCase()}
        </div>
      )}

      {rows === null ? (
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground py-4">
          <Loader2 size={13} className="animate-spin" /> LOADING WALLETS...
        </div>
      ) : rows.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground py-4">
          No wallets yet — a wallet is created the first time a player opens theirs.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {rows.map(({ wallet, user }) => (
            <div key={wallet.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  {(user && (user.full_name || user.email)) || "Unknown player"}
                </div>
                <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                  {wallet.steam_id ? `STEAM LINKED` : "STEAM NOT LINKED"}
                  {wallet.last_reward_at ? ` — EARNING SINCE ${new Date(wallet.last_reward_at).toLocaleString()}` : ""}
                </div>
              </div>
              <div className="font-mono text-sm text-primary shrink-0 sm:text-right">
                {wallet.balance ?? 0} HT
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}