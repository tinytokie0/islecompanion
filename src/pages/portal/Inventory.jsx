import React, { useEffect, useState, useCallback } from "react";
import { Backpack, Loader2, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageShell from "@/components/portal/PageShell";
import DinoGarageCard from "@/components/inventory/DinoGarageCard";
import SkinCard from "@/components/inventory/SkinCard";

export default function Inventory() {
  const { user } = useAuth();
  const [dinos, setDinos] = useState(null);
  const [skins, setSkins] = useState(null);
  const [busy, setBusy] = useState(null); // busy record id
  const [status, setStatus] = useState(null); // { ok, text }

  const load = useCallback(async () => {
    try {
      const dinoPage = await base44.entities.ParkedDino.filter(
        { user_id: user.id },
        { sort: "-parked_date", limit: 50 }
      );
      setDinos(dinoPage.items);
    } catch {
      setDinos([]);
    }
    try {
      const skinPage = await base44.entities.OwnedSkin.filter(
        { user_id: user.id },
        { sort: "-purchased_date", limit: 100 }
      );
      setSkins(skinPage.items);
    } catch {
      setSkins([]);
    }
  }, [user.id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const restore = async (dino) => {
    setBusy(dino.id);
    setStatus(null);
    try {
      await base44.functions.invoke("garageRestore", { id: dino.id });
      setStatus({ ok: true, text: `${dino.species || "Dino"} released from the garage. The island feed will pick it up shortly.` });
      await load();
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
    setBusy(null);
  };

  const equip = async (skin) => {
    setBusy(skin.id);
    setStatus(null);
    try {
      await base44.functions.invoke("skinShop", { action: "equip", skin_id: skin.skin_id });
      setStatus({ ok: true, text: `${skin.name} equipped. The command is queued for your dino in-game.` });
      await load();
    } catch (e) {
      setStatus({ ok: false, text: e?.response?.data?.error || e.message });
    }
    setBusy(null);
  };

  const parkedDinos = (dinos || []).filter((d) => d.status === "parked");
  const restoredDinos = (dinos || []).filter((d) => d.status !== "parked");

  return (
    <PageShell
      kicker="SPECIMEN VAULT"
      title="INVENTORY"
      sub="Everything you own: dinos parked in the garage and skins bought with Haven Tokens. Restores and equips are queued to the game server over the live bridge."
    >
      {status && (
        <div
          className={`glass-panel rounded-lg p-4 mb-5 flex items-center gap-2 font-mono text-xs ${
            status.ok ? "text-emerald-400" : "text-destructive"
          }`}
        >
          {status.ok ? null : <XCircle size={13} />}
          {status.text.toUpperCase()}
        </div>
      )}

      {/* Garage: parked dinos */}
      <div className="flex items-center gap-3 mb-4">
        <Backpack size={14} className="text-primary" />
        <span className="font-mono text-[10px] tracking-[0.25em] text-primary">GARAGE — PARKED DINOS</span>
      </div>
      {dinos === null ? (
        <div className="glass-panel rounded-lg p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground mb-8">
          <Loader2 size={14} className="animate-spin" /> LOADING GARAGE...
        </div>
      ) : parkedDinos.length === 0 ? (
        <div className="glass-panel rounded-lg p-8 text-center mb-8">
          <div className="font-heading text-lg text-foreground mb-2">Nothing parked right now</div>
          <p className="font-mono text-[10px] text-muted-foreground">
            Park a dino in-game and it will appear here, safe in the garage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {parkedDinos.map((d) => (
            <DinoGarageCard key={d.id} dino={d} busy={busy === d.id} onRestore={restore} />
          ))}
        </div>
      )}

      {/* Recently restored */}
      {restoredDinos.length > 0 && (
        <div className="mb-8">
          <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground mb-3">RECENTLY RESTORED</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {restoredDinos.slice(0, 3).map((d) => (
              <DinoGarageCard key={d.id} dino={d} busy={false} onRestore={() => {}} />
            ))}
          </div>
        </div>
      )}

      {/* Owned skins */}
      <div className="flex items-center gap-3 mb-4 mt-8">
        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
        <span className="font-mono text-[10px] tracking-[0.25em] text-primary">OWNED SKINS</span>
      </div>
      {skins === null ? (
        <div className="glass-panel rounded-lg p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> LOADING SKINS...
        </div>
      ) : skins.length === 0 ? (
        <div className="glass-panel rounded-lg p-8 text-center">
          <div className="font-heading text-lg text-foreground mb-2">No skins owned yet</div>
          <p className="font-mono text-[10px] text-muted-foreground">
            Skins you buy in the token shop show up here, ready to equip.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {skins.map((s) => (
            <SkinCard key={s.id} skin={s} busy={busy === s.id} onEquip={equip} />
          ))}
        </div>
      )}
    </PageShell>
  );
}