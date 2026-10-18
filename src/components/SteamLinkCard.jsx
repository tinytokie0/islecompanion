import React, { useState, useEffect } from "react";
import { Gamepad2, Unlink, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SteamIcon from "@/components/SteamIcon";
import { Image } from "@/components/ui/image";

const RAPTOR =
  "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/4916924f5_generated_image.png";

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

  const linked = !!link;

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Gamepad2 size={12} className="text-accent" />
            <span className="font-mono text-[9px] tracking-[0.25em] text-accent">STEAM ACCOUNT</span>
          </div>
          <h2 className="font-heading text-lg md:text-xl font-bold text-foreground mb-1.5 tracking-wide">
            {linked ? "Steam connected" : "Connect your Steam"}
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <Loader2 size={13} className="animate-spin" /> CHECKING LINK...
            </div>
          ) : link ? (
            <div className="flex items-center gap-2 font-mono text-xs text-foreground">
              <CheckCircle2 size={13} className="text-emerald-400" />
              LINKED — STEAM ID {link.steam_id}
              <span className="font-mono text-[10px] text-muted-foreground ml-2">
                {new Date(link.linked_date).toLocaleString()}
              </span>
            </div>
          ) : (
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed max-w-xl">
              {authed
                ? "Sign in with Steam to connect it to your Haven profile. You will sign in on Steam's official page and be redirected back here. Your Steam account stays linked to your profile across future sign-ins."
                : "First time here? You'll create your free Haven account just once (email sign-in), then you'll be sent straight to Steam to finish linking. Returning players skip straight to Steam."}
            </p>
          )}

          {busy && !loading && (
            <div className="flex items-center gap-2 mt-3 font-mono text-[10px] text-muted-foreground">
              <Loader2 size={11} className="animate-spin" /> WORKING...
            </div>
          )}

          {status && (
            <div
              className={`flex items-center gap-2 mt-3 font-mono text-[10px] tracking-[0.1em] ${
                status.type === "ok" ? "text-emerald-400" : "text-destructive"
              }`}
            >
              {status.type === "ok" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {status.text.toUpperCase()}
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-stretch gap-2">
          {linked ? (
            <button
              onClick={unlink}
              disabled={busy}
              className="font-mono text-[11px] tracking-[0.2em] border border-destructive/50 text-destructive px-6 py-3 rounded-md hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Unlink size={14} /> UNLINK STEAM
            </button>
          ) : (
            <button
              onClick={startLink}
              disabled={busy}
              className="bg-primary text-primary-foreground font-mono text-[9px] font-bold tracking-[0.2em] px-4 py-2.5 rounded-md hover:shadow-[0_0_22px_rgba(201,138,94,0.55)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <SteamIcon className="w-3.5 h-3.5" /> SIGN IN WITH STEAM
            </button>
          )}
          {linked && link && (
            <span className="font-mono text-[10px] text-muted-foreground text-center">
              Linked {new Date(link.linked_date).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* A raptor strolls along the bottom of the banner, passing under the button */}
      <div className="absolute bottom-0.5 card-walker pointer-events-none" style={{ width: 48 }}>
        <Image
          src={RAPTOR}
          alt=""
          className="w-full walk-bob"
          fittingType="fit"
          style={{ mixBlendMode: "screen" }}
        />
      </div>
    </div>
  );
}