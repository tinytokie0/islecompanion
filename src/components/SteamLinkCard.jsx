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

// Set before sending a signed-out visitor to account creation, so they are
// sent straight into Steam authentication when they come back.
const PENDING_FLAG = "steam_link_pending";

export default function SteamLinkCard() {
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok' | 'error', text }

  const load = async () => {
    setLoading(true);
    try {
      if (await base44.auth.isAuthenticated()) {
        setAuthed(true);
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
    if (steam) sessionStorage.removeItem(PENDING_FLAG);
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
      // Visitors without a Haven profile create it once, then come straight
      // back to finish linking Steam.
      if (!(await base44.auth.isAuthenticated())) {
        sessionStorage.setItem(PENDING_FLAG, "1");
        window.location.href = "/login?returnTo=%2F";
        return;
      }
      await beginSteamLink();
    } catch (e) {
      setStatus({ type: "error", text: e.message });
      setBusy(false);
    }
  };

  const beginSteamLink = async () => {
    const res = await base44.functions.invoke("steamLinkStart", {});
    window.location.href = res.data.redirect_url;
  };

  // A visitor who was sent to create their Haven account returns here and
  // continues directly into Steam authentication.
  useEffect(() => {
    if (loading || busy) return;
    if (sessionStorage.getItem(PENDING_FLAG) !== "1") return;
    sessionStorage.removeItem(PENDING_FLAG);
    if (!authed || link) return;
    setBusy(true);
    beginSteamLink().catch((e) => {
      setBusy(false);
      setStatus({ type: "error", text: e.message });
    });
  }, [loading, busy, authed, link]);

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
            {authed
              ? "Sign in with Steam to connect it to your Haven profile. You will sign in on Steam's official page and be redirected back here. Your Steam account stays linked to your profile across future sign-ins."
              : "First time here? You'll create your free Haven account just once (email sign-in), then you'll be sent straight to Steam to finish linking. Returning players skip straight to Steam."}
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