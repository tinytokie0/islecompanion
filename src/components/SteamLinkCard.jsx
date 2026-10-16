import React, { useState, useEffect } from "react";
import { Gamepad2, Unlink, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SteamIcon from "@/components/SteamIcon";

const REASONS = {
  missing: "Linking request was incomplete.",
  invalid_signature: "Steam could not verify this response.",
  bad_id: "Steam returned an unexpected identity.",
  expired: "The linking request expired. Try again.",
  taken: "That Steam account is already linked to another user.",
  server: "Something went wrong verifying the link.",
  bad_return_to: "Steam's response did not come back to this site correctly.",
};

export default function SteamLinkCard() {
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok' | 'error', text }

  const load = async () => {
    setLoading(true);
    try {
      if (await base44.auth.isAuthenticated()) {
        const items = await base44.entities.SteamLink.filter({});
        setLink(items[0] || null);
      }
    } catch (e) {
      setStatus({ type: "error", text: e.message });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const steam = params.get("steam");
    if (steam === "linked") {
      setStatus({ type: "ok", text: "Steam account linked." });
      load();
    } else if (steam === "error") {
      setStatus({ type: "error", text: REASONS[params.get("reason")] || "Linking failed." });
      load();
    }
  }, []);

  const startLink = async () => {
    setBusy(true);
    setStatus(null);
    try {
      // Visitors without a Haven profile sign in first, then come back here to link Steam.
      if (!(await base44.auth.isAuthenticated())) {
        window.location.href = "/login?returnTo=%2F";
        return;
      }
      const res = await base44.functions.invoke("steamLinkStart", {});
      window.location.href = res.data.redirect_url;
    } catch (e) {
      setStatus({ type: "error", text: e.message });
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await base44.functions.invoke("steamUnlink", {});
      setStatus({ type: "ok", text: "Steam account unlinked." });
      await load();
    } catch (e) {
      setStatus({ type: "error", text: e.message });
    }
    setBusy(false);
  };

  return (
    <div className="glass-panel rounded-lg p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Gamepad2 size={14} className="text-accent" />
        <span className="font-mono text-[10px] tracking-[0.25em] text-accent">STEAM ACCOUNT</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Loader2 size={13} className="animate-spin" /> CHECKING LINK...
        </div>
      ) : link ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-mono text-xs text-foreground">
              <CheckCircle2 size={13} className="text-emerald-400" />
              LINKED — STEAM ID {link.steam_id}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground mt-1">
              Linked {new Date(link.linked_date).toLocaleString()}
            </div>
          </div>
          <button
            onClick={unlink}
            disabled={busy}
            className="font-mono text-[10px] tracking-[0.2em] border border-destructive/50 text-destructive px-4 py-2 rounded-sm hover:bg-destructive/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Unlink size={12} /> UNLINK
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="flex-1 font-mono text-[11px] text-muted-foreground leading-relaxed">
            Sign in with Steam to connect it to your Haven profile. You will sign in on
            Steam's official page and be redirected back here. Your Steam account stays
            linked to your profile across future sign-ins.
          </p>
          <button
            onClick={startLink}
            disabled={busy}
            className="shrink-0 font-mono text-[10px] tracking-[0.2em] border border-primary/40 text-primary px-4 py-2 rounded-sm hover:bg-primary/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <SteamIcon className="w-3.5 h-3.5" /> SIGN IN WITH STEAM
          </button>
        </div>
      )}

      {busy && !loading && (
        <div className="flex items-center gap-2 mt-3 font-mono text-[10px] text-muted-foreground">
          <Loader2 size={11} className="animate-spin" /> WORKING...
        </div>
      )}

      {status && (
        <div
          className={`flex items-center gap-2 mt-4 font-mono text-[10px] tracking-[0.1em] ${
            status.type === "ok" ? "text-emerald-400" : "text-destructive"
          }`}
        >
          {status.type === "ok" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {status.text.toUpperCase()}
        </div>
      )}
    </div>
  );
}