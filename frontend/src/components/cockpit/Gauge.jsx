import React from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function Gauge({ label, value = 0, min = 0, max = 100, unit, active = false, onClick }) {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) && max !== safeMin ? max : safeMin + 1;
  const clamped = clamp(value ?? 0, safeMin, safeMax);
  const fraction = (clamped - safeMin) / (safeMax - safeMin);

  // Map value range to needle angle (classic ~240° sweep)
  const startAngle = -120; // left side
  const endAngle = 120; // right side
  const angle = startAngle + fraction * (endAngle - startAngle);

  const displayValue =
    typeof value === "number" && Number.isFinite(value) ? Math.round(value) : value ?? "--";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center justify-center rounded-2xl border bg-slate-950/80 p-3 transition
      cursor-pointer hover:scale-[1.02] hover:border-sky-500/80 hover:bg-slate-900/90 hover:shadow-soft-glow
      ${active ? "border-sky-400 shadow-soft-glow" : "border-slate-800"}`}
    >
      <div
        className={`relative flex aspect-square w-full max-w-[140px] items-center justify-center overflow-hidden rounded-full
        border-2 bg-slate-950 text-xs text-slate-200 shadow-inner
        ${active ? "border-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.7)]" : "border-slate-700 shadow-[0_0_12px_rgba(0,0,0,0.85)]"}`}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {/* Outer bezel ring */}
          <defs>
            <radialGradient id="bezelGradient" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#020617" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
            <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="48" fill="url(#bezelGradient)" />

          {/* Instrument face */}
          <circle cx="50" cy="50" r="38" fill="url(#faceGradient)" />

          {/* Major + minor tick marks */}
          {Array.from({ length: 36 }).map((_, index) => {
            const isMajor = index % 3 === 0;
            const tickAngle = ((index / 36) * 240 - 120) * (Math.PI / 180);
            const outerRadius = 38;
            const innerRadius = isMajor ? 32 : 35;
            const x1 = 50 + outerRadius * Math.cos(tickAngle);
            const y1 = 50 + outerRadius * Math.sin(tickAngle);
            const x2 = 50 + innerRadius * Math.cos(tickAngle);
            const y2 = 50 + innerRadius * Math.sin(tickAngle);

            return (
              <line
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? "#e5e7eb" : "#64748b"}
                strokeWidth={isMajor ? 1.4 : 0.8}
                strokeLinecap="round"
              />
            );
          })}

          {/* Value markings (0/center/max) */}
          <text
            x="18"
            y="70"
            textAnchor="middle"
            className="fill-slate-500"
            fontSize="6"
          >
            {safeMin}
          </text>
          <text
            x="50"
            y="70"
            textAnchor="middle"
            className="fill-slate-400"
            fontSize="6"
          >
            {typeof displayValue === "number" ? displayValue : displayValue}
          </text>
          <text
            x="82"
            y="70"
            textAnchor="middle"
            className="fill-slate-500"
            fontSize="6"
          >
            {safeMax}
          </text>

          {/* Unit text */}
          {unit && (
            <text
              x="50"
              y="80"
              textAnchor="middle"
              className="fill-sky-300"
              fontSize="5"
              letterSpacing="0.08em"
            >
              {unit.toUpperCase()}
            </text>
          )}

          {/* Needle */}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              transition: "transform 0.4s ease-out",
            }}
          >
            <line
              x1="50"
              y1="52"
              x2="50"
              y2="16"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>

          {/* Center hub */}
          <circle cx="50" cy="50" r="4.2" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="1.4" fill="#bae6fd" />
        </svg>

        {/* Glass reflection overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-transparent to-white/5 mix-blend-screen opacity-70" />

        {/* Inner bezel ring */}
        <div className="pointer-events-none absolute inset-1 rounded-full border border-slate-800/80" />
      </div>

      {/* Label + value */}
      <div className="mt-2 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-200 md:text-xs">
          {label}
        </div>
        <div className="text-[10px] text-slate-400 md:text-[11px]">
          {typeof displayValue === "number" ? displayValue.toLocaleString() : displayValue}
          {unit && (
            <span className="ml-1 text-slate-500">
              {unit}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

