import React from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const VITALS = [
  { name: "HEALTH", value: 78, color: "#22c55e", max: 100 },
  { name: "STAMINA", value: 62, color: "#f59e0b", max: 100 },
  { name: "HUNGER", value: 41, color: "#ef4444", max: 100 },
  { name: "THIRST", value: 85, color: "#3b82f6", max: 100 },
];

const GROWTH_DATA = [
  { t: "0m", value: 12 },
  { t: "2m", value: 18 },
  { t: "4m", value: 25 },
  { t: "6m", value: 33 },
  { t: "8m", value: 42 },
  { t: "10m", value: 51 },
  { t: "12m", value: 58 },
  { t: "14m", value: 64 },
  { t: "16m", value: 71 },
  { t: "18m", value: 78 },
];

const TREND_DATA = [
  { t: "0", health: 70, stamina: 80, hunger: 60 },
  { t: "2", health: 72, stamina: 75, hunger: 55 },
  { t: "4", health: 75, stamina: 68, hunger: 48 },
  { t: "6", health: 78, stamina: 62, hunger: 41 },
  { t: "8", health: 78, stamina: 65, hunger: 41 },
  { t: "10", health: 78, stamina: 62, hunger: 41 },
];

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
            runes, and 10-minute trend analysis.
          </p>
        </div>

        {/* Top row: vitals + growth */}
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
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-2">
              GROWTH TO PRIME
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-5xl text-primary text-glow">78</span>
              <span className="font-mono text-sm text-muted-foreground">%</span>
            </div>
            <div className="font-mono text-[10px] text-accent tracking-wide mb-6">
              ▲ +7% SINCE LAST SESSION
            </div>

            <div className="flex-1 min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={GROWTH_DATA} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#67e8f9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  />
                  <Area type="monotone" dataKey="value" stroke="#67e8f9" strokeWidth={2} fill="url(#growthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground text-center mt-2">
              TIME ELAPSED (MINUTES)
            </div>
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

          {/* Trend chart */}
          <div className="glass-panel p-6">
            <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground mb-6">
              10-MINUTE TREND ANALYSIS
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#67e8f9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="staminaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="health" stroke="#67e8f9" strokeWidth={2} fill="url(#healthGrad)" name="Health" />
                  <Area type="monotone" dataKey="stamina" stroke="#a78bfa" strokeWidth={2} fill="url(#staminaGrad)" name="Stamina" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-px bg-primary" />
                <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground">HEALTH</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-px bg-accent" />
                <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground">STAMINA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}