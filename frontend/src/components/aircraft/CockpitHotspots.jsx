import React from "react";

const hotspotGroups = {
  c172: [
    {
      id: "airspeed",
      label: "Airspeed Indicator",
      description:
        "Displays indicated airspeed in knots. Primary for pitch control in approach and climb. In the C172, white/green/yellow arcs define flap range, normal operations, and caution range.",
    },
    {
      id: "attitude",
      label: "Attitude Indicator",
      description:
        "Shows aircraft pitch and bank relative to the horizon. In VFR training, it helps maintain precise pitch for maneuvers and instrument scan practice.",
    },
    {
      id: "altimeter",
      label: "Altimeter",
      description:
        "Indicates altitude above mean sea level. Requires correct barometric setting (Kollsman window). Used to hold pattern altitude and comply with terrain + airspace requirements.",
    },
    {
      id: "heading",
      label: "Heading Indicator",
      description:
        "Gyroscopic instrument used with the magnetic compass. Primary reference for maintaining headings, intercepting radials, and flying pattern legs.",
    },
  ],
  archer: [
    {
      id: "airspeed",
      label: "Airspeed Indicator",
      description:
        "In the Archer, pay close attention to Vx, Vy, and Vr as they differ from a 172. Use it to brief performance and departure profiles.",
    },
    {
      id: "altimeter",
      label: "Altimeter",
      description:
        "Often paired with a backup altimeter in IFR trainers. Emphasize cross-check with GPS altitude and ATC reported field elevation.",
    },
    {
      id: "attitude",
      label: "Attitude Indicator",
      description:
        "Used heavily during instrument training blocks. Students should practice partial panel scenarios assuming attitude failure.",
    },
    {
      id: "heading",
      label: "Heading Indicator",
      description:
        "Workload tool: heading bugs for ATC vectors and holds. Integrate its use into standard callouts before turns and level-offs.",
    },
  ],
  da40: [
    {
      id: "airspeed",
      label: "Airspeed Tape (PFD)",
      description:
        "Displayed as a vertical tape on the G1000/G3000-style PFD. Great for teaching trend awareness and energy management in glass-cockpit trainers.",
    },
    {
      id: "attitude",
      label: "PFD Attitude Indicator",
      description:
        "Synthetic horizon with flight director. Ideal platform for teaching instrument scan and automation management in technically advanced aircraft.",
    },
    {
      id: "altimeter",
      label: "Altitude Tape (PFD)",
      description:
        "Digital altitude readout with trend vector and bug. Use for precision altitude control during instrument approaches and level-offs.",
    },
    {
      id: "heading",
      label: "HSI / Heading Bug",
      description:
        "Horizontal Situation Indicator integrated with GPS/NAV. Perfect for teaching intercepts, tracking, and situational awareness on procedures.",
    },
  ],
};

const labelForAircraft = {
  c172: "Cessna 172",
  archer: "Piper Archer",
  da40: "Diamond DA40",
};

export function CockpitHotspots({ selectedId }) {
  const key = selectedId || "c172";
  const groups = hotspotGroups[key] ?? hotspotGroups.c172;
  const aircraftLabel = labelForAircraft[key] ?? "Training Aircraft";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200 md:text-sm">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-slate-100 md:text-base">Cockpit Hotspots</h3>
        <p className="text-xs text-slate-400">
          Key flight instruments in the {aircraftLabel}. Use this panel to brief systems before simulator or flight
          lessons.
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {groups.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 hover:border-blue-400/70"
          >
            <div className="mb-0.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-100 md:text-sm">{item.label}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-500">Instrument</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 md:text-xs">{item.description}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Tip: Ask the AI tutor to quiz you on each instrument&apos;s failures, limitations, and related ACS tasks.
      </p>
    </div>
  );
}

