import React, { useEffect, useState } from "react";
import { Coins, Palette, Check, Loader2 } from "lucide-react";
import { SKINS } from "@/lib/portalData";
import useHt from "@/hooks/useHt";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const HERO_ART =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/df0eed8ea_generated_image.png";

export default function SkinShop() {
  const { balance, refresh } = useHt();
  const [records, setRecords] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Owned skins live in the database so equipping persists and queues the
  // in-game skin command; the poll keeps sync status fresh.
  const load = async () => {
    try {
      const page = await base44.entities.OwnedSkin.filter({}, { sort: "-purchased_date", limit: 50 });
      setRecords(page.items);
    } catch {
      setRecords((r) => r || []);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const act = async (skin, action) => {
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await base44.functions.invoke("skinShop", { action, skin_id: skin.id });
      if (res.data?.error) {
        setMsg(res.data.error);
      } else {
        setMsg(
          action === "buy"
            ? `${skin.name} bought and equipped — syncing to the game server...`
            : `${skin.name} equipped — syncing to the game server...`
        );
      }
      await refresh();
      await load();
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  };

  return (
    <section className="relative">
      {/* Full-bleed cinematic art backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src={HERO_ART}
          alt=""
          fittingType="fill"
          className="w-full h-full animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/55 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
        <div className="absolute inset-0 grid-bg opacity-25" />
      </div>

      <div className="relative px-4 md:px-8 py-10">
        <div className="max-w-[1500px] mx-auto">
          {/* Header panel */}
          <div className="glass-panel rounded-xl px-8 py-10 mb-10 text-center">
            <span className="inline-flex w-14 h-14 rounded-xl bg-primary/15 text-primary items-center justify-center mb-5">
              <Palette size={24} />
            </span>
            <h1 className="font-heading text-4xl md:text-5xl tracking-[0.08em] text-foreground text-glow mb-3">
              SKIN GARAGE
            </h1>
            <p className="font-mono text-xs md:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed tracking-wide">
              Buy skins with Haven Tokens and equip them — applied to your dino in-game.
            </p>
            <div className="inline-flex items-center gap-2 mt-6 glass-panel-light px-4 py-2 rounded-full">
              <Coins size={13} className="text-accent" />
              <span className="font-mono text-xs text-foreground tracking-widest">
                {balance.toLocaleString()} HT
              </span>
            </div>
          </div>

          {msg && (
            <div className="glass-panel-light px-4 py-3 mb-6 font-mono text-[10px] text-accent tracking-wide text-center">
              {msg}
            </div>
          )}

          {/* Skin grid over the art */}
          {records === null ? (
            <div className="glass-panel rounded-lg p-10 flex items-center justify-center gap-3 font-mono text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> READING YOUR GARAGE...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SKINS.map((skin) => {
                const record = records.find((r) => r.skin_id === skin.id);
                const isEquipped = !!record?.equipped;
                const afford = balance >= skin.price;
                return (
                  <div
                    key={skin.id}
                    className={`glass-panel rounded-lg p-5 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                      isEquipped ? "border-primary/60 ring-1 ring-primary/30" : ""
                    }`}
                  >
                    <div className="relative aspect-video rounded-sm mb-4 overflow-hidden flex items-center justify-center">
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `radial-gradient(circle at 50% 60%, ${skin.hex} 0%, ${skin.hex}cc 45%, #0b0b12 100%)`,
                        }}
                      />
                      <div className="absolute inset-0 grid-bg opacity-40" />
                      <div
                        className="relative w-2/3 h-1/2 rounded-sm shadow-lg"
                        style={{ backgroundColor: skin.hex, boxShadow: `0 0 24px ${skin.hex}88` }}
                      />
                      <span className="absolute font-mono text-[9px] tracking-[0.25em] text-black/70 bottom-2 right-2">
                        {skin.hex.toUpperCase()}
                      </span>
                    </div>
                    <div className="font-heading text-lg tracking-[0.05em] text-foreground mb-1">
                      {skin.name.toUpperCase()}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground mb-2">{skin.pattern}</div>

                    {/* In-game sync status once a skin is owned */}
                    {record && record.server_status && (
                      <div
                        className={`font-mono text-[9px] tracking-wide mb-2 flex items-center gap-1.5 ${
                          record.server_status === "failed" ? "text-destructive" : "text-accent"
                        }`}
                      >
                        {record.server_status === "applied" ? (
                          <>APPLIED IN GAME</>
                        ) : record.server_status === "failed" ? (
                          <>SERVER ERROR{record.server_error ? ` — ${record.server_error}` : ""}</>
                        ) : (
                          <>
                            <Loader2 size={9} className="animate-spin" /> SYNCING TO GAME SERVER...
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-mono text-sm text-accent">{skin.price.toLocaleString()}</span>
                      {isEquipped ? (
                        <span className="font-mono text-[9px] tracking-[0.2em] text-primary flex items-center gap-1.5">
                          <Check size={12} /> EQUIPPED
                        </span>
                      ) : record ? (
                        <button
                          onClick={() => act(skin, "equip")}
                          disabled={busy}
                          className="font-mono text-[9px] tracking-[0.2em] border border-primary/40 text-primary px-3 py-1.5 rounded-sm hover:bg-primary/10 transition-colors disabled:opacity-50"
                        >
                          EQUIP
                        </button>
                      ) : (
                        <button
                          onClick={() => act(skin, "buy")}
                          disabled={busy || !afford}
                          className={`font-mono text-[9px] tracking-[0.2em] px-3 py-1.5 border rounded-sm transition-colors flex items-center gap-1.5 ${
                            afford
                              ? "border-primary/40 text-primary hover:bg-primary/10"
                              : "border-border text-muted-foreground/50 cursor-not-allowed"
                          }`}
                        >
                          {busy ? <Loader2 size={11} className="animate-spin" /> : <Palette size={11} />}
                          {afford ? "BUY" : "TOO LOW"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10">
            <LiveIslandStrip />
          </div>
        </div>
      </div>
    </section>
  );
}