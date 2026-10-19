import { Coins, Loader2 } from "lucide-react";

// Compact Haven Tokens balance pill used on the dashboard and wallet pages.
export default function CoinBadge({ balance, loading }) {
  return (
    <span className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 text-primary font-mono text-[11px] tracking-[0.15em] rounded px-3 py-1.5">
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Coins size={12} />}
      {loading ? "HT …" : `${balance ?? 0} HT`}
    </span>
  );
}