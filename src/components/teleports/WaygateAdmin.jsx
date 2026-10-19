import React, { useEffect, useState } from "react";
import { Settings2, Plus, Pencil, Trash2, Save, X, PackageCheck, Ban } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMPTY_FORM = {
  name: "",
  region: "",
  description: "",
  pos_x: "",
  pos_y: "",
  pos_z: "",
  price: "",
  active: true,
};

// Admin configure panel: create, edit, retire and delete waygates, plus the
// pending teleport queue (mark delivered, or cancel with an HT refund).
export default function WaygateAdmin({ onChanged }) {
  const [gates, setGates] = useState([]);
  const [pending, setPending] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    const gatePage = await base44.entities.Waygate.list({ sort: "-created_date", limit: 100 });
    setGates(gatePage.items || []);
    const reqPage = await base44.entities.TeleportRequest.filter(
      { status: "pending" },
      { sort: "-created_date", limit: 50 }
    );
    setPending(reqPage.items || []);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (gate) => {
    setEditingId(gate.id);
    setForm({
      name: gate.name || "",
      region: gate.region || "",
      description: gate.description || "",
      pos_x: gate.pos_x ?? "",
      pos_y: gate.pos_y ?? "",
      pos_z: gate.pos_z ?? "",
      price: gate.price ?? "",
      active: gate.active !== false,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const saveGate = async () => {
    if (!form.name.trim() || !form.price) {
      setFeedback("Name and price are required.");
      return;
    }
    setBusy(true);
    setFeedback("");
    const payload = {
      name: form.name.trim(),
      region: form.region.trim(),
      description: form.description.trim(),
      pos_x: form.pos_x === "" ? undefined : Number(form.pos_x),
      pos_y: form.pos_y === "" ? undefined : Number(form.pos_y),
      pos_z: form.pos_z === "" ? undefined : Number(form.pos_z),
      price: Math.max(0, Math.floor(Number(form.price))),
      active: form.active,
    };
    try {
      if (editingId) {
        await base44.entities.Waygate.update(editingId, payload);
      } else {
        await base44.entities.Waygate.create(payload);
      }
      resetForm();
      await load();
      onChanged?.();
      setFeedback("Waygate saved.");
    } catch (e) {
      setFeedback(e.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  const deleteGate = async (gate) => {
    setBusy(true);
    await base44.entities.Waygate.delete(gate.id);
    if (editingId === gate.id) resetForm();
    await load();
    onChanged?.();
    setBusy(false);
  };

  const markDelivered = async (r) => {
    await base44.entities.TeleportRequest.update(r.id, {
      status: "delivered",
      delivered_date: new Date().toISOString(),
    });
    await load();
    onChanged?.();
  };

  const cancelWithRefund = async (r) => {
    setBusy(true);
    try {
      await base44.entities.TeleportRequest.update(r.id, { status: "cancelled" });
      await base44.functions.invoke("economyAdjust", {
        user_id: r.user_id,
        type: "staff_grant",
        amount: r.price,
        reason: `Waygate refund: ${r.waygate_name}`,
      });
      await load();
      onChanged?.();
      setFeedback("Cancelled and refunded.");
    } catch (e) {
      setFeedback(e.message || "Cancel failed.");
    } finally {
      setBusy(false);
    }
  };

  const field = (key, placeholder, type = "text") => (
    <input
      type={type}
      value={form[key]}
      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      placeholder={placeholder}
      className="rounded-md bg-secondary/70 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full"
    />
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6 mb-8">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Settings2 size={16} />
        </span>
        <h2 className="font-heading text-lg font-bold text-foreground">Configure waygates</h2>
      </div>

      {feedback && (
        <div className="mb-4 rounded-md bg-secondary/70 border border-border px-3 py-2 text-xs text-foreground">
          {feedback}
        </div>
      )}

      {/* Gate editor */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {field("name", "Waygate name")}
        {field("region", "Region (e.g. Highlands)")}
        {field("price", "Price in HT", "number")}
        <label className="flex items-center gap-2 text-sm text-muted-foreground px-1">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="accent-current"
          />
          Active
        </label>
        {field("pos_x", "X coordinate", "number")}
        {field("pos_y", "Y coordinate", "number")}
        {field("pos_z", "Z coordinate", "number")}
        <div className="flex items-center gap-2">
          <button
            onClick={saveGate}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 hover:opacity-90 disabled:opacity-50"
          >
            {editingId ? <Save size={14} /> : <Plus size={14} />}
            {editingId ? "Save changes" : "Add waygate"}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 rounded-md bg-secondary text-muted-foreground text-sm font-medium px-3 py-2 hover:text-foreground"
            >
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      </div>
      <input
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Description shown on the gate card (optional)"
        className="mb-5 rounded-md bg-secondary/70 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full"
      />

      {/* Configured gates */}
      {gates.length > 0 && (
        <div className="space-y-2 mb-8">
          {gates.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between gap-4 rounded-lg bg-secondary/50 px-4 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {g.name}
                  {!g.active && <span className="text-xs text-muted-foreground ml-2">(inactive)</span>}
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {g.region ? `${g.region} · ` : ""}
                  {g.price.toLocaleString()} HT
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(g)}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteGate(g)}
                  disabled={busy}
                  className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending delivery queue */}
      <h3 className="font-heading text-base font-bold text-foreground mb-3">
        Pending teleports {pending.length > 0 && <span className="text-primary">({pending.length})</span>}
      </h3>
      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">No teleport requests waiting for delivery.</p>
      ) : (
        <div className="space-y-2">
          {pending.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary/50 px-4 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {r.player_name || "Unknown player"} <span className="text-muted-foreground">→ {r.waygate_name}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {r.species || "?"} · {r.steam_id}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => markDelivered(r)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 text-xs font-semibold px-3 py-1.5 hover:opacity-90"
                >
                  <PackageCheck size={13} /> Delivered
                </button>
                <button
                  onClick={() => cancelWithRefund(r)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary text-muted-foreground border border-border text-xs font-semibold px-3 py-1.5 hover:text-foreground"
                >
                  <Ban size={13} /> Cancel + refund
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}