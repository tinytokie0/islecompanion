import React, { useState } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import PageShell from "@/components/portal/PageShell";

const ROLES = ["Moderator", "Event Host", "Developer", "Community Helper"];

export default function Apply() {
  const [role, setRole] = useState(ROLES[0]);
  const [experience, setExperience] = useState("");
  const [hours, setHours] = useState(10);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (experience.trim().length < 40) {
      return setError("Tell us a bit more — at least a couple of sentences.");
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <PageShell
      kicker="JOIN THE TEAM"
      title="APPLY"
      sub="Apply to help run The Haven. Applications are reviewed every weekend."
    >
      {submitted ? (
        <div className="glass-panel rounded-lg p-10 flex flex-col items-center text-center">
          <CheckCircle2 size={36} className="text-accent mb-5" />
          <div className="font-heading text-2xl tracking-[0.08em] text-foreground mb-3">
            APPLICATION SUBMITTED
          </div>
          <p className="font-mono text-[11px] text-muted-foreground max-w-md leading-relaxed">
            Your {role} application is in the queue. You will hear back through
            support tickets within a week.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="glass-panel rounded-lg p-6 md:p-8 max-w-2xl">
          <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-5 flex items-center gap-2">
            <FileText size={13} className="text-primary" /> STAFF APPLICATION
          </div>
          <div className="mb-4">
            <label className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground block mb-2">
              ROLE
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-secondary border border-border rounded-sm font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60"
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground block mb-2">
              HOURS PER WEEK: <span className="text-accent">{hours}</span>
            </label>
            <input
              type="range"
              min={2}
              max={40}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value, 10))}
              className="w-full accent-[#a273f2]"
            />
          </div>
          <div className="mb-5">
            <label className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground block mb-2">
              YOUR EXPERIENCE
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={5}
              placeholder="Previous servers, moderation experience, why you want to join the team..."
              className="w-full bg-secondary border border-border rounded-sm font-mono text-xs text-foreground px-4 py-3 outline-none focus:border-primary/60 placeholder:text-muted-foreground/50 resize-none"
            />
          </div>
          <button
            type="submit"
            className="font-mono text-[10px] tracking-[0.25em] bg-primary text-primary-foreground px-8 py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            SUBMIT APPLICATION
          </button>
          {error && <div className="font-mono text-[10px] text-destructive mt-3 tracking-wide">{error}</div>}
        </form>
      )}
    </PageShell>
  );
}