import React, { useEffect, useMemo, useState } from "react";
import { AirspeedIndicator } from "./instruments/AirspeedIndicator.jsx";
import { AttitudeIndicator } from "./instruments/AttitudeIndicator.jsx";
import { Altimeter } from "./instruments/Altimeter.jsx";
import { TurnCoordinator } from "./instruments/TurnCoordinator.jsx";
import { HeadingIndicator } from "./instruments/HeadingIndicator.jsx";
import { VerticalSpeedIndicator } from "./instruments/VerticalSpeedIndicator.jsx";

const initialFlightState = {
  airspeed: 95,
  altitude: 3500,
  heading: 270,
  pitch: 2,
  roll: 5,
  vsi: 500,
  turnRate: 1,
};

const scanOrder = ["airspeed", "attitude", "altimeter", "turn", "heading", "vsi"];

const instrumentLabels = {
  airspeed: "Airspeed",
  attitude: "Attitude",
  altimeter: "Altimeter",
  turn: "Turn",
  heading: "Heading",
  vsi: "VSI",
};

function GaugeBezel({ active, children }) {
  return (
    <div
      className={`flex aspect-square max-h-[120px] w-full max-w-[120px] shrink-0 items-center justify-center justify-self-center overflow-hidden rounded-full p-1 transition-shadow ${
        active
          ? "outline outline-2 outline-[#38bdf8] outline-offset-0 shadow-[0_0_0_3px_#0f172a,0_0_10px_rgba(0,0,0,0.8),inset_0_0_8px_rgba(0,0,0,0.9),0_0_15px_rgba(56,189,248,0.5)]"
          : "shadow-[0_0_0_3px_#0f172a,0_0_10px_rgba(0,0,0,0.8),inset_0_0_8px_rgba(0,0,0,0.9)]"
      }`}
    >
      {children}
    </div>
  );
}

const instrumentBlurbs = {
  airspeed:
    "Monitors indicated airspeed and energy state. Critical for stall awareness, climb performance, and approach speeds.",
  attitude:
    "Shows pitch and bank relative to the horizon. Center of the instrument scan in both VFR and IFR training.",
  altimeter:
    "Indicates altitude above mean sea level. Used for terrain clearance, pattern altitudes, and airspace compliance.",
  turn:
    "Displays rate and coordination of turn. Teaches standard-rate turns and keeping the ball centered with rudder.",
  heading:
    "Gyroscopic heading reference for tracking courses and pattern legs. Often used with a heading bug for briefed rollouts.",
  vsi:
    "Shows rate of climb or descent in feet per minute. Best used as a trend instrument to anticipate level-offs.",
};

export function CockpitPanel({ selectedInstrumentId, onSelectInstrument }) {
  const [flightState, setFlightState] = useState(initialFlightState);
  const [scanMode, setScanMode] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [focusedId, setFocusedId] = useState(null);

  useEffect(() => {
    if (!scanMode) {
      setFlightState(initialFlightState);
      setScanIndex(0);
      return;
    }

    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;

      setScanIndex((prev) => (prev + 1) % scanOrder.length);

      setFlightState(() => {
        const airspeed = Math.max(60, 95 - elapsed * 3);
        const vsi = -500 - 200 * Math.sin(elapsed * 0.8);
        const altitude = Math.max(2500, 3500 - elapsed * 80);
        const pitch = 2 - 3 * Math.sin(elapsed * 0.6);
        const roll = 5 * Math.sin(elapsed * 0.4);
        const heading = 270 + 5 * Math.sin(elapsed * 0.3);

        return {
          airspeed,
          altitude,
          heading,
          pitch,
          roll,
          vsi,
          turnRate: roll / 15,
        };
      });
    }, 900);

    return () => clearInterval(id);
  }, [scanMode]);

  const activeScanId = useMemo(() => (scanMode ? scanOrder[scanIndex] : null), [scanMode, scanIndex]);

  const handleInstrumentClick = (id) => {
    onSelectInstrument?.(id);
    setFocusedId(id);
  };

  const focusedInfoId = focusedId || selectedInstrumentId || "attitude";
  const focusedLabel = instrumentLabels[focusedInfoId] ?? "Instrument";
  const focusedBlurb = instrumentBlurbs[focusedInfoId] ?? instrumentBlurbs.attitude;

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-black shadow-[0_0_32px_rgba(0,0,0,0.9)] min-h-0">
      {/* Subtle panel glow */}
      <div className="pointer-events-none absolute -right-20 -top-16 h-44 w-44 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative z-10 flex items-center justify-between px-3 pt-3 text-xs text-slate-300 md:text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cockpit Instrument Panel</p>
          <p className="text-[11px] text-slate-400">
            Classic Cessna-style six-pack layout. Click an instrument to explore it.
          </p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="uppercase tracking-wide">Scan order</span>
            <div className="flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5">
              {scanOrder.map((id, index) => {
                const active = activeScanId === id;
                const label = instrumentLabels[id];
                return (
                  <span key={id} className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-medium ${
                        active ? "text-sky-300 underline decoration-sky-400" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                    {index < scanOrder.length - 1 && <span className="text-slate-500">→</span>}
                  </span>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setScanMode((prev) => !prev)}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold transition ${
              scanMode
                ? "bg-amber-500 text-slate-950 shadow-soft-glow"
                : "border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-sky-400 hover:text-sky-200"
            }`}
          >
            {scanMode ? "Scan Training On" : "Scan Training"}
          </button>
        </div>
      </div>
      <div className="relative z-10 flex flex-1 flex-col min-h-0 px-2 pb-2">
        <div
          className="rounded-xl border border-slate-800 p-2.5 shadow-[inset_0_0_24px_rgba(0,0,0,0.4)]"
          style={{ background: "linear-gradient(180deg, #0b1320, #020617)" }}
        >
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-slate-400 md:text-xs">
            <span>
              {scanMode
                ? "Scan training: watch the instruments change and identify what is happening with the aircraft."
                : "Hover and click instruments to focus them. Use scan training to practice your instrument scan."}
            </span>
          </div>
          {/* Tight 3x2 six-pack grid: Row 1 = Airspeed | Attitude | Altimeter; Row 2 = Turn | Heading | VSI */}
          <div className="mx-auto grid max-w-[420px] grid-cols-3 gap-[12px]">
            <GaugeBezel active={selectedInstrumentId === "airspeed" || activeScanId === "airspeed"}>
              <AirspeedIndicator
                label="Airspeed Indicator"
                value={flightState.airspeed}
                active={selectedInstrumentId === "airspeed" || activeScanId === "airspeed"}
                onClick={() => handleInstrumentClick("airspeed")}
              />
            </GaugeBezel>
            <GaugeBezel active={selectedInstrumentId === "attitude" || activeScanId === "attitude"}>
              <AttitudeIndicator
                label="Attitude Indicator"
                pitch={flightState.pitch}
                roll={flightState.roll}
                active={selectedInstrumentId === "attitude" || activeScanId === "attitude"}
                onClick={() => handleInstrumentClick("attitude")}
              />
            </GaugeBezel>
            <GaugeBezel active={selectedInstrumentId === "altimeter" || activeScanId === "altimeter"}>
              <Altimeter
                label="Altimeter"
                altitude={flightState.altitude}
                active={selectedInstrumentId === "altimeter" || activeScanId === "altimeter"}
                onClick={() => handleInstrumentClick("altimeter")}
              />
            </GaugeBezel>
            <GaugeBezel active={selectedInstrumentId === "turn" || activeScanId === "turn"}>
              <TurnCoordinator
                label="Turn Coordinator"
                turnRate={flightState.turnRate}
                slip={0}
                active={selectedInstrumentId === "turn" || activeScanId === "turn"}
                onClick={() => handleInstrumentClick("turn")}
              />
            </GaugeBezel>
            <GaugeBezel active={selectedInstrumentId === "heading" || activeScanId === "heading"}>
              <HeadingIndicator
                label="Heading Indicator"
                heading={flightState.heading}
                active={selectedInstrumentId === "heading" || activeScanId === "heading"}
                onClick={() => handleInstrumentClick("heading")}
              />
            </GaugeBezel>
            <GaugeBezel active={selectedInstrumentId === "vsi" || activeScanId === "vsi"}>
              <VerticalSpeedIndicator
                label="Vertical Speed"
                vsi={flightState.vsi}
                active={selectedInstrumentId === "vsi" || activeScanId === "vsi"}
                onClick={() => handleInstrumentClick("vsi")}
              />
            </GaugeBezel>
          </div>
          {/* Focus / explanation strip */}
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/90 px-2 py-1.5 text-[10px] text-slate-200 md:text-xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-sky-500/20 ring-1 ring-sky-400/70" />
              <div>
                <p className="font-semibold text-slate-100">
                  {instrumentLabels[focusedInfoId] ?? "Instrument focus"}
                </p>
                <p className="text-[10px] text-slate-300 md:text-[11px]">{focusedBlurb}</p>
              </div>
            </div>
            {scanMode && (
              <span className="hidden text-[10px] font-medium text-amber-300 md:inline">
                Scan training active – identify what is happening with the aircraft.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

