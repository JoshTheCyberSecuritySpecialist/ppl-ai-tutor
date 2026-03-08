import React from "react";
import { InstrumentInfo } from "./InstrumentInfo.jsx";

const quickInfo = {
  airspeed: {
    title: "Airspeed Indicator",
    bullets: [
      "Measures aircraft speed through the air (indicated knots).",
      "Primary reference during takeoff, climb, and approach.",
      "Critical for stall avoidance and staying within structural limits.",
    ],
  },
  attitude: {
    title: "Attitude Indicator",
    bullets: [
      "Shows aircraft pitch and bank relative to the horizon.",
      "Center of the instrument scan in IMC and hood work.",
      "Used to maintain precise pitch and bank during maneuvers.",
    ],
  },
  altimeter: {
    title: "Altimeter",
    bullets: [
      "Indicates altitude above mean sea level (MSL).",
      "Essential for terrain clearance and traffic separation.",
      "Relies on correct barometric setting in the Kollsman window.",
    ],
  },
  turn: {
    title: "Turn Coordinator",
    bullets: [
      "Shows rate and coordination of turn, not bank angle.",
      "Use the miniature airplane and ball to keep turns standard and coordinated.",
      "Key for partial panel work and maintaining safe, coordinated turns.",
    ],
  },
  heading: {
    title: "Heading Indicator",
    bullets: [
      "Provides a stable directional reference tied to the magnetic compass.",
      "Used to fly headings, pattern legs, and instrument procedures.",
      "Must be periodically realigned with the magnetic compass.",
    ],
  },
  vsi: {
    title: "Vertical Speed Indicator",
    bullets: [
      "Shows rate of climb or descent in feet per minute (FPM).",
      "Helps smooth level-offs and stabilized climbs and descents.",
      "Best used as a trend instrument, not something to 'chase'.",
    ],
  },
};

export function InstrumentInfoPanel({ selectedInstrumentId }) {
  const key = selectedInstrumentId || "attitude";
  const info = quickInfo[key] ?? quickInfo.attitude;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Quick reference panel for the currently selected instrument */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 text-xs text-slate-200 md:text-sm">
        <h3 className="mb-1 text-sm font-semibold text-slate-100 md:text-base">{info.title}</h3>
        <p className="mb-2 text-[11px] text-slate-400 md:text-xs">
          When you click an instrument in the six-pack, use this panel to brief what it does and how to read it.
        </p>
        <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-200 md:text-xs">
          {info.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Full AI-powered explanation + Q&A, reusing existing logic */}
      <InstrumentInfo selectedInstrumentId={selectedInstrumentId} />
    </div>
  );
}

