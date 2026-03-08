import React from "react";
import airspeedImg from "../../assets/instruments/airspeed.png";
import attitudeImg from "../../assets/instruments/attitude.png";
import altimeterImg from "../../assets/instruments/altimeter.png";
import headingImg from "../../assets/instruments/heading.png";
import vsiImg from "../../assets/instruments/vsi.png";
import turnImg from "../../assets/instruments/turn.png";

const instrumentImageMap = {
  airspeed: airspeedImg,
  attitude: attitudeImg,
  altimeter: altimeterImg,
  heading: headingImg,
  vsi: vsiImg,
  turn: turnImg,
};

export function InstrumentGauge({ id, label, active, onClick }) {
  const src = instrumentImageMap[id] ?? attitudeImg;

  return (
    <button
      type="button"
      onClick={() => onClick?.(id)}
      className={`group flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 p-2 transition cursor-pointer hover:scale-105 hover:border-sky-500/80 hover:bg-slate-900/90 hover:shadow-soft-glow hover:ring-2 hover:ring-sky-400 ${
        active ? "border-sky-400 bg-slate-900/90 shadow-soft-glow" : ""
      }`}
    >
      <div
        className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-700 bg-slate-900 text-xs text-slate-200 shadow-inner md:h-24 md:w-24 ${
          active ? "border-sky-400 shadow-soft-glow" : "group-hover:border-sky-400/80"
        }`}
      >
        {/* Instrument face image */}
        <img src={src} alt={label} className="h-full w-full object-cover" />
        {/* Glass reflection overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/12 via-transparent to-white/5 mix-blend-screen opacity-70" />
        {/* Inner bezel ring */}
        <div className="pointer-events-none absolute inset-1 rounded-full border border-slate-800/80" />
      </div>
      <span className="mt-2 text-[10px] font-medium text-slate-300 md:text-xs">{label}</span>
    </button>
  );
}

