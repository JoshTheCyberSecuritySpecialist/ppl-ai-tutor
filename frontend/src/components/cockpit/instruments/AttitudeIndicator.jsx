import React from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function AttitudeIndicator({
  label = "Attitude",
  pitch = 0,
  roll = 0,
  active = false,
  onClick,
}) {
  const clampedPitch = clamp(pitch ?? 0, -20, 20);
  const clampedRoll = clamp(roll ?? 0, -45, 45);
  const pitchPixels = clampedPitch * -1.3; // nose up = horizon moves down

  const pitchMarks = [-20, -10, -5, 0, 5, 10, 20];
  const bankAngles = [-45, -30, -20, -10, 0, 10, 20, 30, 45];

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
            <radialGradient id="attBezel" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#020617" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
          </defs>

          {/* Bezel */}
          <circle cx="50" cy="50" r="48" fill="url(#attBezel)" />

          {/* Horizon group (moves with pitch + roll) */}
          <g
            transform={`translate(50 50) rotate(${clampedRoll}) translate(-50 -50) translate(0 ${pitchPixels})`}
            style={{ transition: "transform 0.3s ease-out" }}
          >
            {/* Sky and ground */}
            <rect x="8" y="0" width="84" height="50" fill="#0ea5e9" />
            <rect x="8" y="50" width="84" height="50" fill="#78350f" />

            {/* Horizon line */}
            <rect x="8" y="49" width="84" height="2" fill="#e5e7eb" />

            {/* Pitch ladder */}
            {pitchMarks.map((deg) => {
              if (deg === 0) return null;
              const offset = (deg * -1.3) + 0; // match scale
              const length = Math.abs(deg) === 10 || Math.abs(deg) === 20 ? 24 : 16;

              return (
                <g key={deg}>
                  <line
                    x1={50 - length / 2}
                    x2={50 + length / 2}
                    y1={50 + offset}
                    y2={50 + offset}
                    stroke="#e5e7eb"
                    strokeWidth={0.8}
                  />
                  <text
                    x={50 - length / 2 - 3}
                    y={50 + offset + 2}
                    textAnchor="end"
                    className="fill-slate-100"
                    fontSize="4"
                  >
                    {Math.abs(deg)}
                  </text>
                  <text
                    x={50 + length / 2 + 3}
                    y={50 + offset + 2}
                    textAnchor="start"
                    className="fill-slate-100"
                    fontSize="4"
                  >
                    {Math.abs(deg)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Bank scale fixed to aircraft */}
          <g>
            {bankAngles.map((deg) => {
              const angleRad = (deg * Math.PI) / 180;
              const outer = 40;
              const inner = Math.abs(deg) === 45 ? 33 : Math.abs(deg) === 30 ? 34 : 36;
              const x1 = 50 + outer * Math.sin(angleRad);
              const y1 = 50 - outer * Math.cos(angleRad);
              const x2 = 50 + inner * Math.sin(angleRad);
              const y2 = 50 - inner * Math.cos(angleRad);

              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#e5e7eb"
                  strokeWidth={Math.abs(deg) === 45 || deg === 0 ? 1.4 : 0.9}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Bank pointer at top */}
          <polygon points="50,8 48,13 52,13" fill="#e5e7eb" />

          {/* Miniature airplane fixed in center */}
          <g>
            <rect x="42" y="48" width="16" height="1.8" fill="#e5e7eb" />
            <rect x="49.2" y="44" width="1.6" height="10" fill="#e5e7eb" />
          </g>

          {/* Center hub circle */}
          <circle cx="50" cy="50" r="4.2" fill="#020617" stroke="#22d3ee" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="1.6" fill="#e0f2fe" />
        </svg>

        {/* Glass reflection */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/16 via-transparent to-white/6 mix-blend-screen opacity-75" />
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

