import React from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toRadians = (deg) => (deg * Math.PI) / 180;

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const angle = toRadians(angleDeg - 90);
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
};

export function AirspeedIndicator({ label = "Airspeed", value = 0, active = false, onClick }) {
  const min = 0;
  const max = 200;
  const clamped = clamp(value ?? 0, min, max);
  const fraction = (clamped - min) / (max - min);

  // Needle sweep ~ 250° from left to right
  const startAngle = -130;
  const endAngle = 120;
  const angle = startAngle + fraction * (endAngle - startAngle);

  const display = Number.isFinite(clamped) ? Math.round(clamped) : "--";

  // Example C172-style arcs (approximate)
  const whiteStart = 40;
  const whiteEnd = 85;
  const greenStart = 45;
  const greenEnd = 129;
  const yellowStart = 129;
  const yellowEnd = 163;
  const redVne = 163;

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
          <defs>
            <radialGradient id="asiBezel" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#020617" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
            <linearGradient id="asiFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="100%" stopColor="#0b1120" />
            </linearGradient>
          </defs>

          {/* Bezel */}
          <circle cx="50" cy="50" r="48" fill="url(#asiBezel)" />

          {/* Dial background */}
          <circle cx="50" cy="50" r="38" fill="url(#asiFace)" />

          {/* Color arcs on outer ring */}
          <path
            d={describeArc(50, 50, 36, whiteStart, whiteEnd)}
            stroke="#e5e7eb"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={describeArc(50, 50, 36, greenStart, greenEnd)}
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={describeArc(50, 50, 36, yellowStart, yellowEnd)}
            stroke="#eab308"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Red Vne line */}
          <path
            d={describeArc(50, 50, 36, redVne - 2, redVne + 2)}
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Tick marks */}
          {Array.from({ length: 40 }).map((_, index) => {
            const isMajor = index % 4 === 0;
            const tFraction = index / 40;
            const tAngle = startAngle + tFraction * (endAngle - startAngle);
            const angleRad = toRadians(tAngle);
            const outer = 35;
            const inner = isMajor ? 30 : 33;

            const x1 = 50 + outer * Math.cos(angleRad);
            const y1 = 50 + outer * Math.sin(angleRad);
            const x2 = 50 + inner * Math.cos(angleRad);
            const y2 = 50 + inner * Math.sin(angleRad);

            return (
              <line
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? "#f9fafb" : "#64748b"}
                strokeWidth={isMajor ? 1.4 : 0.8}
                strokeLinecap="round"
              />
            );
          })}

          {/* Speed labels every 20 kt */}
          {Array.from({ length: 11 }).map((_, i) => {
            const kts = i * 20;
            const tFraction = (kts - min) / (max - min);
            const tAngle = startAngle + tFraction * (endAngle - startAngle);
            const angleRad = toRadians(tAngle);
            const radius = 24;
            const x = 50 + radius * Math.cos(angleRad);
            const y = 50 + radius * Math.sin(angleRad) + 2;

            return (
              <text
                // eslint-disable-next-line react/no-array-index-key
                key={kts}
                x={x}
                y={y}
                textAnchor="middle"
                className="fill-slate-100"
                fontSize="5"
              >
                {kts}
              </text>
            );
          })}

          {/* Needle */}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              transition: "transform 0.3s ease-out",
            }}
          >
            <line
              x1="50"
              y1="52"
              x2="50"
              y2="16"
              stroke="#22d3ee"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>

          {/* Center hub */}
          <circle cx="50" cy="50" r="4.2" fill="#020617" stroke="#22d3ee" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="1.6" fill="#e0f2fe" />

          {/* Label + units inside dial */}
          <text x="50" y="60" textAnchor="middle" className="fill-slate-300" fontSize="6">
            {display}
          </text>
          <text x="50" y="68" textAnchor="middle" className="fill-sky-300" fontSize="5">
            KTS
          </text>
        </svg>

        {/* Glass reflection */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/14 via-transparent to-white/5 mix-blend-screen opacity-70" />
        {/* Inner bezel ring */}
        <div className="pointer-events-none absolute inset-1 rounded-full border border-slate-800/80" />
      </div>

      <div className="mt-2 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-200 md:text-xs">
          {label}
        </div>
      </div>
    </button>
  );
}

