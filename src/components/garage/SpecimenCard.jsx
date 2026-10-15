import { stageFor } from "@/lib/growthStages";

const SILHOUETTE =
  "M 30 120 Q 40 100 60 95 L 80 85 Q 100 75 120 80 L 140 70 Q 160 65 170 75 L 165 90 Q 155 95 145 100 L 135 110 Q 130 125 120 130 L 110 135 Q 95 140 80 138 L 65 145 Q 45 150 35 140 Z";

export default function SpecimenCard({ spec, selected, onSelect, deployed, listed }) {
  const { current, next } = stageFor(spec.growth);

  return (
    <button
      onClick={onSelect}
      className={`flex-shrink-0 w-44 md:w-52 glass-panel-light p-4 text-left transition-all duration-300 hover:scale-105 ${
        selected ? "border-primary/60 ring-1 ring-primary/30" : ""
      }`}
    >
      <div
        className="w-full aspect-video mb-3 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: `${spec.accent}11` }}
      >
        <svg viewBox="0 0 200 200" className="w-3/4 h-3/4">
          <path d={SILHOUETTE} fill={spec.accent} opacity="0.8" />
        </svg>
        {listed && (
          <div className="absolute top-1 left-1 font-mono text-[8px] tracking-[0.15em] text-accent border border-accent/40 px-1.5 py-0.5">
            TRADE
          </div>
        )}
        <div className="absolute bottom-1 right-1 font-mono text-[8px] text-muted-foreground">
          {spec.prime}%
        </div>
        {deployed && (
          <div className="absolute bottom-1 left-1 font-mono text-[8px] tracking-[0.15em] text-primary">
            ● DEPLOYED
          </div>
        )}
      </div>
      <div className="font-mono text-xs text-foreground tracking-wide mb-1 truncate">
        {spec.name}
      </div>
      <div className="font-mono text-[9px] text-muted-foreground tracking-wide mb-2 truncate">
        {spec.code} — {current.name}
        {next ? ` → ${next.name}` : ""}
      </div>
      {/* Growth bar */}
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[8px] tracking-[0.15em] text-muted-foreground">GROWTH</span>
        <span className="font-mono text-[8px]" style={{ color: spec.accent }}>
          {spec.growth}%
        </span>
      </div>
      <div className="h-1 bg-secondary overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${spec.growth}%`, backgroundColor: spec.accent }}
        />
      </div>
    </button>
  );
}