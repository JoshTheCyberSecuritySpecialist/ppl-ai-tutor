import React from "react";

const aircraftPresets = [
  { id: "c172", name: "Cessna 172", role: "Primary trainer", engine: "Lycoming IO-360", seats: "4 seats" },
  { id: "archer", name: "Piper Archer", role: "Cross-country trainer", engine: "Lycoming O-360", seats: "4 seats" },
  { id: "da40", name: "Diamond DA40", role: "Modern glass-cockpit trainer", engine: "Austro AE300", seats: "4 seats" },
];

export function AircraftSelector({ selectedId, onSelect }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-100 md:text-base">Aircraft Training Lab</h3>
        <p className="text-xs text-slate-400">
          Choose a training airframe to explore its handling, cockpit layout, and instruments.
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-xs md:text-sm">
        {aircraftPresets.map((aircraft) => {
          const active = aircraft.id === selectedId;
          return (
            <button
              key={aircraft.id}
              type="button"
              onClick={() => onSelect(aircraft.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                active
                  ? "border-blue-400/80 bg-blue-500/10 text-blue-100 shadow-soft-glow"
                  : "border-slate-700 bg-slate-950/60 text-slate-200 hover:border-blue-400/70 hover:bg-slate-900"
              }`}
            >
              <div>
                <div className="font-semibold">{aircraft.name}</div>
                <div className="text-[11px] text-slate-400">
                  {aircraft.role} • {aircraft.engine} • {aircraft.seats}
                </div>
              </div>
              <span className="text-lg">{active ? "✈️" : "🛩️"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

