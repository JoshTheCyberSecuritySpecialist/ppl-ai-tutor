import React from "react";

const normalizeHeading = (heading) => {
  if (!Number.isFinite(heading)) return 0;
  const h = heading % 360;
  return h < 0 ? h + 360 : h;
};

export function HeadingIndicator({ label = "Heading", heading = 0, active = false, onClick }) {
  const hdg = normalizeHeading(heading);

  const compassMarks = Array.from({ length: 36 }).map((_, index) => {
    const deg = index * 10;
    const isMajor = deg % 30 === 0;
    return { deg, isMajor };
  });

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
            <radialGradient id="hdgBezel" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#020617" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
            <linearGradient id="hdgFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="48" fill="url(#hdgBezel)" />
          <circle cx="50" cy="50" r="38" fill="url(#hdgFace)" />

          {/* Rotating compass card */}
          <g
            style={{
              transform: `rotate(${-hdg}deg)`,
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              transition: "transform 0.3s ease-out",
            }}
          >
            {/* Tick marks and labels */}
            {compassMarks.map(({ deg, isMajor }) => {
              const angleRad = ((deg - 90) * Math.PI) / 180;
              const outer = 37;
              const inner = isMajor ? 30 : 34;
              const x1 = 50 + outer * Math.cos(angleRad);
              const y1 = 50 + outer * Math.sin(angleRad);
              const x2 = 50 + inner * Math.cos(angleRad);
              const y2 = 50 + inner * Math.sin(angleRad);

              return (
                <g key={deg}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#e5e7eb"
                    strokeWidth={isMajor ? 1.3 : 0.8}
                    strokeLinecap="round"
                  />
                  {isMajor && (
                    <text
                      x={50 + 24 * Math.cos(angleRad)}
                      y={50 + 24 * Math.sin(angleRad) + 2}
                      textAnchor="middle"
                      className="fill-slate-100"
                      fontSize="5"
                    >
                      {deg === 0 ? "N" : deg === 90 ? "E" : deg === 180 ? "S" : deg === 270 ? "W" : deg / 10}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Fixed aircraft reference */}
          <polygon points="50,14 47,22 53,22" fill="#f97316" />
          <line x1="50" y1="22" x2="50" y2="34" stroke="#f97316" strokeWidth="1.4" />

          {/* Heading readout window */}
          <rect
            x="38"
            y="60"
            width="24"
            height="10"
            rx="2"
            ry="2"
            fill="#020617"
            stroke="#4b5563"
            strokeWidth="0.8"
          />
          <text x="50" y="67" textAnchor="middle" className="fill-slate-100" fontSize="6">
            {hdg.toString().padStart(3, "0")}
          </text>
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

