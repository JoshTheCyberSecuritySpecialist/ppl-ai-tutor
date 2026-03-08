import React from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function TurnCoordinator({
  label = "Turn Coordinator",
  turnRate = 0,
  slip = 0,
  active = false,
  onClick,
}) {
  const clampedRate = clamp(turnRate ?? 0, -2, 2);
  const clampedSlip = clamp(slip ?? 0, -1, 1);

  const miniatureAngle = clampedRate * 10; // ±20° at ±2 rate
  const ballOffset = clampedSlip * 10; // px left/right

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
            <radialGradient id="tcBezel" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="55%" stopColor="#020617" />
              <stop offset="100%" stopColor="#111827" />
            </radialGradient>
            <linearGradient id="tcFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="48" fill="url(#tcBezel)" />
          <circle cx="50" cy="50" r="38" fill="url(#tcFace)" />

          {/* Standard-rate turn marks */}
          <line x1="27" y1="40" x2="22" y2="40" stroke="#e5e7eb" strokeWidth="1.2" />
          <line x1="73" y1="40" x2="78" y2="40" stroke="#e5e7eb" strokeWidth="1.2" />
          <text x="22" y="38" textAnchor="middle" className="fill-slate-300" fontSize="4">
            L
          </text>
          <text x="78" y="38" textAnchor="middle" className="fill-slate-300" fontSize="4">
            R
          </text>

          {/* Miniature airplane */}
          <g
            style={{
              transform: `rotate(${miniatureAngle}deg)`,
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
              transition: "transform 0.3s ease-out",
            }}
          >
            <polygon points="50,46 47,52 53,52" fill="#e5e7eb" />
            <rect x="39" y="52" width="22" height="1.8" fill="#e5e7eb" />
            <circle cx="50" cy="50" r="3" fill="#020617" stroke="#22d3ee" strokeWidth="1.2" />
          </g>

          {/* Slip/skid tube */}
          <rect
            x="30"
            y="63"
            width="40"
            height="6"
            rx="3"
            ry="3"
            fill="#020617"
            stroke="#4b5563"
            strokeWidth="0.8"
          />

          {/* Ball */}
          <g
            style={{
              transform: `translate(${ballOffset}px, 0)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <circle cx="50" cy="66" r="2.6" fill="#e5e7eb" />
          </g>

          <text x="50" y="30" textAnchor="middle" className="fill-slate-300" fontSize="5">
            TURN COORDINATOR
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

