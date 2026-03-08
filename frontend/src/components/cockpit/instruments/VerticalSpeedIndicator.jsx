import React from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function VerticalSpeedIndicator({
  label = "Vertical Speed",
  vsi = 0,
  active = false,
  onClick,
}) {
  const min = -2000;
  const max = 2000;
  const clamped = clamp(vsi ?? 0, min, max);
  const fraction = (clamped - min) / (max - min); // 0–1

  // Sweep from -90° (down) to +90° (up)
  const startAngle = -90;
  const endAngle = 90;
  const angle = startAngle + fraction * (endAngle - startAngle);

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
            <radialGradient id="vsiBezel" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#020617" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
            <linearGradient id="vsiFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="48" fill="url(#vsiBezel)" />
          <circle cx="50" cy="50" r="38" fill="url(#vsiFace)" />

          {/* Scale markings */}
          {[-2, -1, 0, 1, 2].map((step) => {
            const value = step * 1000;
            const frac = (value - min) / (max - min);
            const ang = startAngle + frac * (endAngle - startAngle);
            const rad = (ang * Math.PI) / 180;
            const outer = 35;
            const inner = step === 0 ? 26 : 30;
            const x1 = 50 + outer * Math.cos(rad);
            const y1 = 50 + outer * Math.sin(rad);
            const x2 = 50 + inner * Math.cos(rad);
            const y2 = 50 + inner * Math.sin(rad);

            return (
              <g key={step}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#e5e7eb"
                  strokeWidth={step === 0 ? 1.4 : 1}
                  strokeLinecap="round"
                />
                {step !== 0 && (
                  <text
                    x={50 + 22 * Math.cos(rad)}
                    y={50 + 22 * Math.sin(rad) + 2}
                    textAnchor="middle"
                    className="fill-slate-100"
                    fontSize="5"
                  >
                    {Math.abs(step)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Labels */}
          <text x="50" y="28" textAnchor="middle" className="fill-slate-300" fontSize="5">
            VERTICAL SPEED
          </text>
          <text x="50" y="35" textAnchor="middle" className="fill-slate-400" fontSize="4">
            1000 FT / MIN
          </text>

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
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </g>

          {/* Center hub */}
          <circle cx="50" cy="50" r="4.2" fill="#020617" stroke="#22d3ee" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="1.6" fill="#e0f2fe" />
        </svg>

        {/* Glass reflection */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/12 via-transparent to-white/5 mix-blend-screen opacity-70" />
        {/* Inner bezel */}
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

