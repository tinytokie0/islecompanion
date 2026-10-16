import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMPTY = { name: "", description: "", category: "cosmetic", price: "", one_time: false };

// Shop item manager: create, reprice, toggle and delete rewards. All writes
// are admin-only via row-level security.
export default function AdminShopItems() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const load = async () => {
    try {
      const page = await base44.entities.ShopItem.filter({}, { sort: "name", limit: 200 });
      setItems(page.items);
    } catch {
      setItems([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await base44.entities.ShopItem.create({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price: Math.max(1, Math.floor(Number(form.price) || 0)),
        one_time: form.one_time,
        active: true,
      });
      setForm(EMPTY);
      setStatus({ ok: true, text: "Reward added." });
      await load();
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
    setBusy(false);
  };

  const setPrice = async (item, price) => {
    const value = Math.max(1, Math.floor(Number(price) || 0));
    if (value === item.price) return;
    try {
      await base44.entities.ShopItem.update(item.id, { price: value });
      await load();
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
  };

  const toggle = async (item) => {
    try {
      await base44.entities.ShopItem.update(item.id, { active: !item.active });
      await load();
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete reward "${item.name}"?`)) return;
    try {
      await base44.entities.ShopItem.delete(item.id);
      await load();
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
  };

  const valid = form.name.trim() && Number(form.price) >= 1;

  return (
    <div className="glass-panel rounded-lg p-6 mb-6">
      <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5">
        SHOP REWARDS
      </div>

      {/* Create */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 lg:col-span-2"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
        >
          <option value="cosmetic">Cosmetic</option>
          <option value="title">Title</option>
          <option value="badge">Badge</option>
          <option value="reward">Other reward</option>
        </select>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            placeholder="Price HT"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full bg-secondary border border-border rounded-sm px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/60"
          />
          <button
            onClick={create}
            disabled={busy || !valid}
            className="shrink-0 bg-primary text-primary-foreground rounded-sm px-4 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>
      </div>
      <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-muted-foreground mb-5 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={form.one_time}
          onChange={(e) => setForm({ ...form, one_time: e.target.checked })}
          className="accent-primary"
        />
        ONE-TIME PURCHASE ONLY
      </label>

      {status && (
        <div className={`font-mono text-[10px] mb-3 ${status.ok ? "text-emerald-400" : "text-destructive"}`}>
          {status.text.toUpperCase()}
        </div>
      )}

      {items === null ? (
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground py-4">
          <Loader2 size={13} className="animate-spin" /> LOADING...
        </div>
      ) : items.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground py-4">No rewards configured yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="py-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground flex items-center gap-2">
                  {item.name}
                  {item.one_time && (
                    <span className="font-mono text-[8px] tracking-[0.15em] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                      ONE-TIME
                    </span>
                  )}
                </div>
                <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                  {item.category.toUpperCase()} — {item.active ? "ACTIVE" : "HIDDEN"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  defaultValue={item.price}
                  onBlur={(e) => setPrice(item, e.target.value)}
                  className="w-24 bg-secondary border border-border rounded-sm px-2 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary/60"
                />
                <button
                  onClick={() => toggle(item)}
                  className="font-mono text-[9px] tracking-[0.15em] border border-border text-muted-foreground px-3 py-1.5 rounded-sm hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {item.active ? "HIDE" : "SHOW"}
                </button>
                <button
                  onClick={() => remove(item)}
                  className="font-mono text-[9px] border border-destructive/50 text-destructive px-2.5 py-1.5 rounded-sm hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}