import React from "react";
import { C172Gauge } from "./C172Gauge.jsx";

const layout = [
  { id: "airspeed", type: "airspeed", label: "Airspeed Indicator", row: "top" },
  { id: "attitude", type: "attitude", label: "Attitude Indicator", row: "top" },
  { id: "altimeter", type: "altimeter", label: "Altimeter", row: "top" },
  { id: "turn", type: "turn", label: "Turn Coordinator", row: "bottom" },
  { id: "heading", type: "heading", label: "Heading Indicator", row: "bottom" },
  { id: "vsi", type: "vsi", label: "Vertical Speed Indicator", row: "bottom" },
];

export function C172InstrumentPanel({ flight, selectedInstrumentId, onSelectInstrument }) {
  const topRow = layout.filter((i) => i.row === "top");
  const bottomRow = layout.filter((i) => i.row === "bottom");

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950/90 to-black/95 p-4 shadow-inner">
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-slate-300 md:text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Cessna 172 Six-Pack
          </p>
          <p className="text-[11px] text-slate-400">
            Classic primary instrument cluster. Click to highlight and brief each gauge.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 md:gap-5">
        {topRow.map((inst) => (
          <C172Gauge
            key={inst.id}
            type={inst.type}
            label={inst.label}
            flight={flight}
            active={selectedInstrumentId === inst.id}
            onClick={() => onSelectInstrument?.(inst.id)}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 md:gap-5">
        {bottomRow.map((inst) => (
          <C172Gauge
            key={inst.id}
            type={inst.type}
            label={inst.label}
            flight={flight}
            active={selectedInstrumentId === inst.id}
            onClick={() => onSelectInstrument?.(inst.id)}
          />
        ))}
      </div>
    </div>
  );
}

