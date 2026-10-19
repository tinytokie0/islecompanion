import React, { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NUM_FIELDS = [
  { key: "coins_per_interval", label: "HT PER INTERVAL", min: 1 },
  { key: "interval_minutes", label: "INTERVAL (MIN)", min: 5 },
  { key: "max_backlog_intervals", label: "MAX BACKLOG INTERVALS", min: 1 },
  { key: "feed_fresh_minutes", label: "FEED FRESH WINDOW (MIN)", min: 5 },
];

// Economy rules editor. Saves straight to EconomyConfig — writes are
// admin-only via row-level security.
export default function AdminConfigForm({ config, onSaved }) {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (config) setForm({ ...config });
  }, [config]);

  if (!form) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const save = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const updated = await base44.entities.EconomyConfig.update(config.id, {
        earning_enabled: !!form.earning_enabled,
        shop_enabled: !!form.shop_enabled,
        coins_per_interval: Math.max(1, Math.floor(Number(form.coins_per_interval) || 10)),
        interval_minutes: Math.max(5, Math.floor(Number(form.interval_minutes) || 30)),
        max_backlog_intervals: Math.max(1, Math.floor(Number(form.max_backlog_intervals) || 3)),
        feed_fresh_minutes: Math.max(5, Math.floor(Number(form.feed_fresh_minutes) || 12)),
      });
      onSaved(updated);
      setStatus({ ok: true, text: "Rules saved." });
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
    setBusy(false);
  };

  return (
    <div className="glass-panel rounded-lg p-6 mb-6">
      <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">
        REWARD RULES
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {NUM_FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">{f.label}</span>
            <input
              type="number"
              min={f.min}
              value={form[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              className="bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/60"
            />
          </label>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={!!form.earning_enabled}
            onChange={(e) => set("earning_enabled", e.target.checked)}
            className="accent-primary"
          />
          EARNING ENABLED
        </label>
        <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={!!form.shop_enabled}
            onChange={(e) => set("shop_enabled", e.target.checked)}
            className="accent-primary"
          />
          SHOP ENABLED
        </label>
        <button
          onClick={save}
          disabled={busy}
          className="sm:ml-auto bg-primary text-primary-foreground font-mono text-[10px] tracking-[0.2em] px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} SAVE RULES
        </button>
      </div>
      {status && (
        <div className={`font-mono text-[10px] mt-3 ${status.ok ? "text-emerald-400" : "text-destructive"}`}>
          {status.text.toUpperCase()}
        </div>
      )}
    </div>
  );
}