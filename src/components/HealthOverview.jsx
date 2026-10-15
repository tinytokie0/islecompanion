import React, { useState, useMemo } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

const VITALS = [
  { name: "HEALTH", value: 78, color: "#22c55e", max: 100 },
  { name: "STAMINA", value: 62, color: "#f59e0b", max: 100 },
  { name: "HUNGER", value: 41, color: "#ef4444", max: 100 },
  { name: "THIRST", value: 85, color: "#3b82f6", max: 100 },
];

// Growth-to-prime progress over selectable time ranges
const GROWTH_RANGES = [
  {
    id: "session",
    label: "SESSION",
    eta: "42m",
    data: [
      { t: "0m", value: 58 },
      { t: "2m", value: 61 },
      { t: "4m", value: 64 },
      { t: "6m", value: 67 },
      { t: "8m", value: 70 },
      { t: "10m", value: 74 },
      { t: "12m", value: 76 },
      { t: "14m", value: 78 },
    ],
  },
  {
    id: "day",
    label: "24H",
    eta: "2h 10m",
    data: [
      { t: "00", value: 34 },
      { t: "03", value: 41 },
      { t: "06", value: 47 },
      { t: "09", value: 55 },
      { t: "12", value: 58 },
      { t: "15", value: 66 },
      { t: "18", value: 71 },
      { t: "21", value: 76 },
      { t: "now", value: 78 },
    ],
  },
  {
    id: "week",
    label: "7D",
    eta: "1d 6h",
    data: [
      { t: "MON", value: 12 },
      { t: "TUE", value: 25 },
      { t: "WED", value: 38 },
      { t: "THU", value: 46 },
      { t: "FRI", value: 59 },
      { t: "SAT", value: 70 },
      { t: "SUN", value: 78 },
    ],
  },
];

// In-game growth stages mapped to overall growth %
const STAGES = [
  { name: "HATCHLING", at: 0 },
  { name: "JUVENILE", at: 15 },
  { name: "ADOLESCENT", at: 35 },
  { name: "SUB-ADULT", at: 60 },
  { name: "PRIME", at: 100 },
];

const TREND_SERIES = [
  { key: "health", label: "HEALTH", color: "#e6b84c", gradId: "healthGrad" },
  { key: "stamina", label: "STAMINA", color: "#a78bfa", gradId: "staminaGrad" },
  { key: "hunger", label: "HUNGER", color: "#ef4444", gradId: "hungerGrad" },
];

const TREND_DATA = [
  { t: "0", health: 70, stamina: 80, hunger: 60 },
  { t: "2", health: 72, stamina: 75, hunger: 55 },
  { t: "4", health: 75, stamina: 68, hunger: 48 },
  { t: "6", health: 78, stamina: 62, hunger: 41 },
  { t: "8", health: 78, stamina: 65, hunger: 41 },
  { t: "10", health: 78, stamina: 62, hunger: 41 },
];

const GROWTH = 78;

function VitalGauge({ name, value, color, max }) {
  const data = [{ name, value, fill: color }];
  return (
    <div className="glass-panel-light p-5 flex flex-col items-center">
      <div className="relative w-full aspect-square max-w-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={90 - (value / max) * 360}
          >
            <RadialBar background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={0} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl text-foreground">{value}</span>
          <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground">/ {max}</span>
        </div>
      </div>
      <div className="font-mono text-[10px] tracking-[0.25em] mt-3" style={{ color }}>
        {name}
      </div>
    </div>
  );
}

export default function HealthOverview() {
  const [rangeId, setRangeId] = useState("session");
  const [activeSeries, setActiveSeries] = useState(["health", "stamina", "hunger"]);

  const range = GROWTH_RANGES.find((r) => r.id === rangeId);

  // Current stage: last stage whose threshold is reached
  const currentStage = useMemo(
    () => [...STAGES].reverse().find((s) => GROWTH >= s.at),
    []
  );
  const nextStage = useMemo(() => {
    const i = STAGES.indexOf(currentStage);
    return i < STAGES.length - 1 ? STAGES[i + 1] : null;
  }, [currentStage]);

  const toggleSeries = (key) => {
    setActiveSeries((prev) =>
      prev.includes(key)
        ? prev.length > 1
          ? prev.filter((k) => k !== key)
          : prev // keep at least one series visible
        : [...prev, key]
    );
  };

  return (
    <section id="vitals" className="relative py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-primary mb-3 block">
              04 — VITALITY RUNES
            </span>
            <h2 className="font-heading text-3xl md:text-5xl tracking-[0.08em] text-foreground">
              HEALTH OVERVIEW
            </h2>
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-md tracking-wide leading-relaxed">
            Live biometric telemetry. Growth channel toward prime, vital
            runes, and interactive trend analysis.
          </p>
        </div>

        {/* Top row: vitals + growth to prime */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Vital gauges */}
          <div className="lg:col-span-2 glass-panel p-6">
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-6">
              VITAL GAUGES — LIVE
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {VITALS.map((v) => (
                <VitalGauge key={v.name} {...v} />
              ))}
            </div>
          </div>

          {/* Growth to prime */}
          <div className="glass-panel p-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
                GROWTH TO PRIME
              </div>
              {/* Time range selector */}
              <div className="flex gap-1">
                {GROWTH_RANGES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRangeId(r.id)}
                    className={`font-mono text-[9px] tracking-[0.1em] px-2 py-1 transition-colors ${
                      rangeId === r.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-5xl text-primary text-glow">{GROWTH}</span>
              <span className="font-mono text-sm text-muted-foreground">%</span>
            </div>
            <div className="font-mono text-[10px] text-accent tracking-wide mb-4">
              ▲ +7% SINCE LAST SESSION
            </div>

            <div className="flex-1 min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={range.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e6b84c" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#e6b84c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(167,139,250,0.08)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: "#6b7280", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,15,13,0.9)",
                      border: "1px solid rgba(34,197,94,0.3)",
                      fontFamily: "JetBrains Mono",
                      fontSize: "10px",
                    }}
                    labelStyle={{ color: "#22c55e" }}
                    formatter={(v) => [`${v}%`, "GROWTH"]}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="#e6b84c"
                    strokeDasharray="3 3"
                    label={{ value: "PRIME", fill: "#e6b84c", fontSize: 8, fontFamily: "JetBrains Mono", position: "insideTopRight" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#e6b84c" strokeWidth={2} fill="url(#growthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground">
                {range.label} TREND
              </span>
              <span className="font-mono text-[9px] tracking-[0.15em] text-accent">
                ETA TO PRIME: {range.eta}
              </span>
            </div>
          </div>
        </div>

        {/* Growth stage tracker */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
              GROWTH STAGE TRACKER — {currentStage.name}
            </div>
            {nextStage && (
              <div className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
                NEXT: <span className="text-foreground">{nextStage.name}</span> AT {nextStage.at}%
              </div>
            )}
          </div>
          <div className="relative h-10">
            {/* Stage segments */}
            <div className="absolute inset-x-0 top-3 h-2 flex gap-1">
              {STAGES.slice(0, -1).map((s, i) => {
                const end = STAGES[i + 1].at;
                const reached = GROWTH >= end;
                return (
                  <div
                    key={s.name}
                    className="h-full overflow-hidden bg-secondary"
                    style={{ width: `${end - s.at}%` }}
                  >
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: GROWTH >= end ? "100%" : GROWTH > s.at ? `${((GROWTH - s.at) / (end - s.at)) * 100}%` : "0%",
                        backgroundColor: reached ? "#e6b84c" : "#a78bfa",
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Position marker */}
            <div
              className="absolute top-0 bottom-0 z-10"
              style={{ left: `${GROWTH}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-px h-full bg-accent" />
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-accent" />
            </div>
          </div>
          <div className="flex justify-between mt-3">
            {STAGES.map((s) => (
              <span
                key={s.name}
                className={`font-mono text-[9px] tracking-[0.15em] ${
                  GROWTH >= s.at ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.name}
                <span className="ml-1 opacity-60">{s.at}%</span>
              </span>
            ))}
          </div>
        </div>

        {/* Prime stats + trend */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Prime stats */}
          <div className="glass-panel p-6">
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-6">
              PRIME STATS — CURRENT SPECIMEN
            </div>
            <div className="space-y-5">
              {[
                { label: "DAMAGE OUTPUT", value: 98, prime: 100, color: "#dc2626" },
                { label: "MOVE SPEED", value: 68, prime: 72, color: "#f59e0b" },
                { label: "BITE FORCE", value: 94, prime: 98, color: "#ef4444" },
                { label: "DURABILITY", value: 95, prime: 100, color: "#22c55e" },
                { label: "STEALTH", value: 30, prime: 35, color: "#3b82f6" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                      {s.label}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-sm text-foreground">{s.value}</span>
                      <span className="font-mono text-[9px] text-muted-foreground">/ {s.prime}</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-secondary overflow-hidden">
                    {/* Prime marker */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-accent z-10"
                      style={{ left: `${s.prime}%` }}
                    />
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${(s.value / s.prime) * 100}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
              <span className="w-3 h-px bg-accent" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-accent">PRIME THRESHOLD</span>
            </div>
          </div>

          {/* Interactive trend chart */}
          <div className="glass-panel p-6">
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-6">
              10-MINUTE TREND ANALYSIS
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    {TREND_SERIES.map((s) => (
                      <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="rgba(167,139,250,0.08)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: "#6b7280", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10,15,13,0.9)",
                      border: "1px solid rgba(34,197,94,0.3)",
                      fontFamily: "JetBrains Mono",
                      fontSize: "10px",
                    }}
                  />
                  {TREND_SERIES.filter((s) => activeSeries.includes(s.key)).map((s) => (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      stroke={s.color}
                      strokeWidth={2}
                      fill={`url(#${s.gradId})`}
                      name={s.label}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Clickable legend — toggles series */}
            <div className="flex items-center gap-4 mt-4 justify-center">
              {TREND_SERIES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => toggleSeries(s.key)}
                  className={`flex items-center gap-2 font-mono text-[9px] tracking-[0.15em] transition-opacity ${
                    activeSeries.includes(s.key)
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/40 opacity-50"
                  }`}
                >
                  <span className="w-3 h-px" style={{ backgroundColor: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}