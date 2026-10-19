import React, { useEffect, useState, useCallback } from "react";
import { Coins, Crosshair, Target, Loader2, Skull, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LiveIslandStrip from "@/components/portal/LiveIslandStrip";
import useHt from "@/hooks/useHt";

export default function Bounties() {
  const { balance, refresh } = useHt();
  const [bounties, setBounties] = useState([]);
  const [settled, setSettled] = useState([]);
  const [me, setMe] = useState(null);
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState(1000);
  const [error, setError] = useState(null);
  const [boardError, setBoardError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actingId, setActingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [open, done, user] = await Promise.all([
        base44.entities.Bounty.filter({ status: "open" }, { sort: "-created_date", limit: 50 }),
        base44.entities.Bounty.filter({ status: "collected" }, { sort: "-collected_date", limit: 8 }),
        base44.auth.me(),
      ]);
      setBounties(open.items || []);
      setSettled(done.items || []);
      setMe(user);
      setBoardError(null);
    } catch (e) {
      setBoardError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const place = async (e) => {
    e.preventDefault();
    const amt = parseInt(amount, 10) || 0;
    if (!target.trim()) return setError("Enter a player name.");
    if (amt < 100) return setError("Minimum bounty is 100 HT.");
    if (amt > balance) return setError("Not enough Haven Tokens.");
    setError(null);
    setBusy(true);
    try {
      const res = await base44.functions.invoke("bountyPost", {
        target_name: target.trim(),
        amount: amt,
      });
      if (res.data && res.data.ok) {
        setTarget("");
        setAmount(1000);
        await refresh();
        await load();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not place the bounty — check your balance.");
    }
    setBusy(false);
  };

  const act = async (b, action) => {
    setActingId(b.id);
    setError(null);
    try {
      const res = await base44.functions.invoke("bountyAction", {
        bounty_id: b.id,
        action,
      });
      if (res.data && res.data.ok) {
        await refresh();
        await load();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Action failed.");
    }
    setActingId(null);
  };

  return (
    <section className="px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Bounties</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Put a price on a player's head. The live server feed settles the bounty
            automatically when the target dies in-game and the killer collects.
          </p>
        </div>

        {/* Place a bounty */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8 mb-10">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-1">Place a bounty</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Name the player and the price. The pot is deducted from your Haven Tokens up front
            and refunded if you cancel before it's collected.
          </p>
          <form onSubmit={place} className="flex flex-col md:flex-row gap-3">
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Player name"
              className="flex-1 bg-secondary border border-border rounded-md font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={100}
              className="w-full md:w-44 bg-secondary border border-border rounded-md font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60"
            />
            <button
              type="submit"
              disabled={busy}
              className="font-heading text-sm font-bold tracking-wide bg-primary text-primary-foreground px-6 py-3 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Target size={15} /> Place bounty
            </button>
          </form>
          {error && <div className="font-mono text-[10px] text-destructive mt-3 tracking-wide">{error}</div>}
        </div>

        {/* Bounty board */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border/60 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
            ACTIVE BOUNTIES — {bounties.length}
          </div>
          {boardError ? (
            <div className="p-10 text-center font-mono text-xs text-destructive">{boardError}</div>
          ) : bounties.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No active bounties. Be the first to post one.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {bounties.map((b) => (
                <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-md border border-destructive/40 bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                      <Crosshair size={15} />
                    </span>
                    <div>
                      <div className="font-mono text-xs text-foreground tracking-wide">{b.target_name}</div>
                      <div className="font-mono text-[9px] text-muted-foreground tracking-[0.15em]">
                        PLACED BY {(b.poster_name || "UNKNOWN").toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-accent flex items-center gap-1.5">
                      <Coins size={13} /> {(b.amount || 0).toLocaleString()} HT
                    </span>
                    <button
                      onClick={() => act(b, "claim")}
                      disabled={actingId === b.id}
                      className="font-heading text-xs font-bold tracking-wide border border-primary/40 text-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50"
                    >
                      {actingId === b.id ? <Loader2 size={12} className="animate-spin" /> : "Collect"}
                    </button>
                    {me && b.poster_user_id === me.id && (
                      <button
                        onClick={() => act(b, "cancel")}
                        disabled={actingId === b.id}
                        title="Cancel and refund"
                        className="font-heading text-xs font-bold tracking-wide border border-border text-muted-foreground px-3 py-2 rounded-md hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently settled */}
        {settled.length > 0 && (
          <div className="rounded-xl border border-border bg-card mt-8">
            <div className="p-5 border-b border-border/60 font-mono text-[10px] tracking-[0.25em] text-muted-foreground flex items-center gap-2">
              <Skull size={12} className="text-destructive" /> RECENTLY COLLECTED
            </div>
            <div className="divide-y divide-border/60">
              {settled.map((b) => (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-mono text-[11px] text-foreground">
                    {b.killer_name || "Unknown"}
                    <span className="text-muted-foreground"> claimed the bounty on </span>
                    {b.target_name}
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.15em]">
                    <span className="text-accent flex items-center gap-1.5">
                      <Coins size={11} /> {(b.amount || 0).toLocaleString()} HT
                    </span>
                    <span className="text-muted-foreground">
                      {b.collected_date ? new Date(b.collected_date).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <LiveIslandStrip />
        </div>
      </div>
    </section>
  );
}