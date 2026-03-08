import React from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function Altimeter({ label = "Altimeter", altitude = 0, active = false, onClick }) {
  const alt = clamp(altitude ?? 0, -1000, 20000);

  // Needle angles (approximate altimeter behavior)
  const hundreds = alt % 1000;
  const thousands = alt % 10000;
  const tenThousands = alt;

  const hundredsAngle = (hundreds / 1000) * 360 - 90;
  const thousandsAngle = (thousands / 10000) * 360 - 90;
  const tenThousandsAngle = (tenThousands / 100000) * 360 - 90;

  const display = Math.round(alt);

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
            <radialGradient id="altBezel" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#020617" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
            <linearGradient id="altFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* Bezel + dial */}
          <circle cx="50" cy="50" r="48" fill="url(#altBezel)" />
          <circle cx="50" cy="50" r="38" fill="url(#altFace)" />

          {/* Index marks every 100 ft with longer marks for each 1000 */}
          {Array.from({ length: 60 }).map((_, index) => {
            const isThousand = index % 5 === 0;
            const angleRad = ((index * 6 - 90) * Math.PI) / 180;
            const outer = 37;
            const inner = isThousand ? 30 : 34;
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
                stroke="#e5e7eb"
                strokeWidth={isThousand ? 1.3 : 0.8}
                strokeLinecap="round"
              />
            );
          })}

          {/* Altitude numerals (thousands) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const thousandsLabel = i * 1;
            const angleDeg = i * 30 - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
            const radius = 24;
            const x = 50 + radius * Math.cos(angleRad);
            const y = 50 + radius * Math.sin(angleRad) + 2;
            return (
              <text
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                className="fill-slate-100"
                fontSize="5"
              >
                {thousandsLabel}
              </text>
            );
          })}

          {/* 10,000 ft needle (short, thick) */}
          <g
            style={{
              transform: `rotate(${tenThousandsAngle}deg)`,
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              transition: "transform 0.3s ease-out",
            }}
          >
            <line
              x1="50"
              y1="52"
              x2="50"
              y2="30"
              stroke="#6b7280"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* 1,000 ft needle */}
          <g
            style={{
              transform: `rotate(${thousandsAngle}deg)`,
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              transition: "transform 0.3s ease-out",
            }}
          >
            <line
              x1="50"
              y1="52"
              x2="50"
              y2="20"
              stroke="#e5e7eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* 100 ft needle */}
          <g
            style={{
              transform: `rotate(${hundredsAngle}deg)`,
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              transition: "transform 0.3s ease-out",
            }}
          >
            <line
              x1="50"
              y1="52"
              x2="50"
              y2="14"
              stroke="#22d3ee"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>

          {/* Center hub */}
          <circle cx="50" cy="50" r="4.2" fill="#020617" stroke="#22d3ee" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="1.6" fill="#e0f2fe" />

          {/* Altitude window */}
          <rect
            x="36"
            y="58"
            width="28"
            height="9"
            rx="1.5"
            ry="1.5"
            fill="#020617"
            stroke="#4b5563"
            strokeWidth="0.8"
          />
          <text x="50" y="64" textAnchor="middle" className="fill-slate-100" fontSize="6">
            {display.toLocaleString()}
          </text>
          <text x="50" y="71" textAnchor="middle" className="fill-slate-400" fontSize="4">
            FT MSL
          </text>
        </svg>

        {/* Glass reflection */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/14 via-transparent to-white/5 mix-blend-screen opacity-70" />
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

