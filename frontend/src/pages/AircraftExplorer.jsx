import React from "react";
import { AircraftViewer } from "../components/aircraft/AircraftViewer.jsx";

export default function AircraftExplorer() {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <header className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Aircraft Explorer</h1>
          <p className="mt-1 text-xs text-slate-400 md:text-sm">
            Rotate, zoom, and pan around the training aircraft in 3D. Use this page to visually inspect the airframe
            before running scenarios in the cockpit trainer.
          </p>
        </header>

        <section className="mt-4">
          <div className="w-full">
            <AircraftViewer />
          </div>
        </section>
      </div>
    </div>
  );
}

