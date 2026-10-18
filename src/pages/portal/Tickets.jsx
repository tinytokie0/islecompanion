import React, { useState } from "react";
import { LifeBuoy, Send, ExternalLink } from "lucide-react";
import PageShell from "@/components/portal/PageShell";

const CATEGORIES = ["Bug report", "Payment issue", "Ban appeal", "Lost dino", "Other"];

const INITIAL_TICKETS = [
  { id: 1, subject: "Dino missing after server restart", category: "Lost dino", status: "Open", reply: "Our team is checking the vault logs — expect an update within 24h." },
  { id: 2, subject: "Skin not applying in-game", category: "Bug report", status: "Resolved", reply: "Fixed in the latest server patch. Thanks for the report!" },
];

export default function Tickets() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      return setError("Fill in a subject and message.");
    }
    setError(null);
    setTickets((prev) => [
      { id: Date.now(), subject: subject.trim(), category, status: "Open", reply: null },
      ...prev,
    ]);
    setSubject("");
    setMessage("");
  };

  return (
    <PageShell
      kicker="KEEPER DESK"
      title="SUPPORT"
      sub="Open a ticket with the staff team. Average first response: under 12 hours."
    >
      {/* Arkanis support */}
      <a
        href="https://arkanis.gg/dashboard/405418368334561281/panels/isle"
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col sm:flex-row sm:items-center gap-4 glass-panel rounded-lg p-5 mb-8 hover:border-[rgba(230,184,76,0.65)] hover:shadow-[0_0_30px_rgba(230,184,76,0.2)] transition-all"
      >
        <span className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/25 shrink-0">
          <ExternalLink size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-heading text-base font-bold text-foreground tracking-wide mb-0.5">
            Arkanis support
          </div>
          <div className="font-mono text-[11px] text-muted-foreground leading-relaxed">
            In-game tickets and lost dinos are handled on the Arkanis server panel — open it to reach staff there.
          </div>
        </div>
        <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-primary uppercase whitespace-nowrap flex items-center gap-2">
          Open panel <ExternalLink size={13} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </a>

      {/* New ticket */}
      <form onSubmit={submit} className="glass-panel rounded-lg p-6 mb-8">
        <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-4 flex items-center gap-2">
          <LifeBuoy size={13} className="text-primary" /> NEW TICKET
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-48 bg-secondary border border-border rounded-sm font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="SUBJECT"
            className="flex-1 bg-secondary border border-border rounded-sm font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
          />
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="DESCRIBE THE ISSUE..."
          rows={4}
          className="w-full bg-secondary border border-border rounded-sm font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60 placeholder:text-muted-foreground/50 mb-3 resize-none"
        />
        <button
          type="submit"
          className="font-mono text-[10px] tracking-[0.25em] bg-primary text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Send size={13} /> SUBMIT TICKET
        </button>
        {error && <div className="font-mono text-[10px] text-destructive mt-3 tracking-wide">{error}</div>}
      </form>

      {/* My tickets */}
      <div className="glass-panel rounded-lg divide-y divide-border/60">
        <div className="p-5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
          MY TICKETS — {tickets.length}
        </div>
        {tickets.map((t) => (
          <div key={t.id} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <div className="font-mono text-xs text-foreground">{t.subject}</div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground">
                  {t.category.toUpperCase()}
                </span>
                <span
                  className={`font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border rounded-sm ${
                    t.status === "Open"
                      ? "text-accent border-accent/50 bg-accent/5"
                      : "text-primary border-primary/50 bg-primary/5"
                  }`}
                >
                  {t.status.toUpperCase()}
                </span>
              </div>
            </div>
            {t.reply && (
              <div className="font-mono text-[11px] text-muted-foreground leading-relaxed mt-2 pl-4 border-l border-border">
                STAFF: {t.reply}
              </div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}