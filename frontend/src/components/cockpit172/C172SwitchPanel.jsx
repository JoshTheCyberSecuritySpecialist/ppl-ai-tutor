import React from "react";

const switchesConfig = [
  { id: "master", label: "Master" },
  { id: "avionics", label: "Avionics" },
  { id: "beacon", label: "Beacon" },
  { id: "landing", label: "Landing" },
  { id: "taxi", label: "Taxi" },
  { id: "fuelPump", label: "Fuel Pump" },
];

export function C172SwitchPanel({ switches, onToggle }) {
  return (
    <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/90 p-3 text-[11px] text-slate-200 md:text-xs">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Electrical & Lighting Switches
        </p>
        <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-400">
          Click to toggle
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {switchesConfig.map((sw) => {
          const on = !!switches?.[sw.id];
          return (
            <button
              key={sw.id}
              type="button"
              onClick={() => onToggle?.(sw.id)}
              className={`flex flex-col items-center rounded-xl border px-2 py-1.5 transition ${
                on
                  ? "border-emerald-400/80 bg-emerald-500/10 text-emerald-100 shadow-soft-glow"
                  : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-sky-400/70 hover:bg-slate-900"
              }`}
            >
              <div
                className={`mb-1 h-6 w-8 rounded-full border border-slate-700 bg-slate-950/90 shadow-inner transition-transform ${
                  on ? "-translate-y-[1px]" : "translate-y-[1px]"
                }`}
              >
                <div
                  className={`mx-auto mt-[2px] h-[18px] w-5 rounded-full bg-gradient-to-b from-slate-200 to-slate-500 shadow-sm transition-transform ${
                    on ? "translate-y-[0px]" : "translate-y-[4px]"
                  }`}
                />
              </div>
              <span className="text-[10px] font-medium">{sw.label}</span>
              <span
                className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                  on ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" : "bg-slate-600"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

