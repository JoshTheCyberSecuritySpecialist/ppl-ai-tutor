import React, { useCallback, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { C172InstrumentPanel } from "./C172InstrumentPanel.jsx";
import { C172SwitchPanel } from "./C172SwitchPanel.jsx";
import { C172Hotspot } from "./C172Hotspot.jsx";

function FlightDynamics({ onUpdate }) {
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    const next = {
      airspeed: 95 + 8 * Math.sin(t * 0.35),
      altitude: 3500 + 60 * Math.sin(t * 0.18),
      pitch: 2 + 3 * Math.sin(t * 0.4),
      bank: 8 * Math.sin(t * 0.22),
      verticalSpeed: 500 * Math.sin(t * 0.4),
      heading: 270 + 8 * Math.sin(t * 0.12),
    };

    onUpdate?.(next, delta);
  });

  return null;
}

function CockpitScene({ viewMode, selectedElementId, onSelectElement, onFlightUpdate }) {
  const cameraConfig = viewMode === "pilot"
    ? {
        position: [0.5, 1.25, 1.6],
        target: [0, 1.1, 0],
      }
    : {
        position: [3.2, 1.8, 3.6],
        target: [0, 1.1, 0],
      };

  const panelColor = "#020617";

  const hotspots = useMemo(
    () => [
      {
        id: "airspeed",
        label: "Airspeed",
        position: [-0.6, 1.2, 0.15],
      },
      {
        id: "attitude",
        label: "Attitude",
        position: [0, 1.2, 0.15],
      },
      {
        id: "altimeter",
        label: "Altimeter",
        position: [0.6, 1.2, 0.15],
      },
      {
        id: "turn",
        label: "Turn Coord",
        position: [-0.6, 1.0, 0.15],
      },
      {
        id: "heading",
        label: "Heading",
        position: [0, 1.0, 0.15],
      },
      {
        id: "vsi",
        label: "VSI",
        position: [0.6, 1.0, 0.15],
      },
      {
        id: "flaps",
        label: "Flaps Lever",
        position: [-0.9, 0.7, 0.4],
      },
      {
        id: "mixture",
        label: "Mixture",
        position: [0.2, 0.7, 0.45],
      },
      {
        id: "throttle",
        label: "Throttle",
        position: [0, 0.7, 0.45],
      },
      {
        id: "master",
        label: "Master Switch",
        position: [-0.4, 0.9, 0.45],
      },
      {
        id: "magnetos",
        label: "Magnetos",
        position: [0.6, 0.9, 0.45],
      },
    ],
    []
  );

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[3, 4, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />

      <PerspectiveCamera makeDefault position={cameraConfig.position} fov={45} />

      {/* Cockpit shell */}
      <group position={[0, 0, 0]}>
        {/* Instrument panel */}
        <mesh position={[0, 1.1, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.8, 1.2, 0.18]} />
          <meshStandardMaterial color={panelColor} metalness={0.5} roughness={0.7} />
        </mesh>

        {/* Panel trim / glare shield */}
        <mesh position={[0, 1.55, -0.2]} rotation={[-0.35, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 0.25, 0.5]} />
          <meshStandardMaterial color="#020617" metalness={0.4} roughness={0.5} />
        </mesh>

        {/* Yoke column */}
        <mesh position={[0, 0.9, 0.3]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.6, 24]} />
          <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.4} />
        </mesh>

        {/* Yoke handle */}
        <mesh position={[0, 0.7, 0.7]} castShadow>
          <boxGeometry args={[0.65, 0.25, 0.15]} />
          <meshStandardMaterial color="#020617" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      <FlightDynamics onUpdate={onFlightUpdate} />

      {hotspots.map((h) => (
        <C172Hotspot
          key={h.id}
          id={h.id}
          label={h.label}
          position={h.position}
          active={selectedElementId === h.id}
          onSelect={onSelectElement}
        />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxDistance={10}
        minDistance={2.4}
        target={cameraConfig.target}
      />
    </>
  );
}

const learningContent = {
  airspeed:
    "Airspeed indicator: primary for performance and stall awareness. In the 172, brief Vs, Vr, Vx, Vy, and approach speeds before each flight.",
  attitude:
    "Attitude indicator: center of the instrument scan. Teaches students to control pitch and bank with small, precise inputs instead of chasing needles.",
  altimeter:
    "Altimeter: keeps you clear of terrain and in the right airspace. Emphasize altimeter setting, cross-checks with field elevation, and level-off technique.",
  heading:
    "Heading indicator: gyro reference for tracking headings and procedures. Use heading bugs and pre-briefed rollout headings for every turn.",
  vsi:
    "Vertical speed indicator: trend instrument. Students should use it to anticipate level-off and avoid large, abrupt climb or descent rates.",
  turn:
    "Turn coordinator: teaches coordinated flight and standard-rate turns. Focus on keeping the ball centered with rudder and understanding instrument failures.",
  flaps:
    "Flaps lever: controls flap deflection, changing lift and drag. Discuss flap settings for normal, short-field, and soft-field takeoffs and landings.",
  mixture:
    "Mixture control: manages fuel/air ratio. Used for engine start, taxi, run-up, climb, cruise leaning, and shutdown. Tie its use to POH checklists.",
  throttle:
    "Throttle: primary power control. Connect throttle changes to airspeed, climb performance, and descent planning in training scenarios.",
  master:
    "Master switch: energizes the electrical system. Preflight includes verifying proper operation, alternator side, and knowing when to shed loads in an emergency.",
  magnetos:
    "Magnetos: independent ignition system. Use run-up checks to teach L/R/BOTH behavior, rough running, and checklist responses to abnormal mag drops.",
};

export function C172Cockpit({ selectedInstrumentId, onSelectInstrument }) {
  const [viewMode, setViewMode] = useState("pilot");
  const [flight, setFlight] = useState({
    airspeed: 95,
    altitude: 3500,
    pitch: 2,
    bank: 5,
    verticalSpeed: 500,
    heading: 270,
  });
  const [switches, setSwitches] = useState({
    master: true,
    avionics: true,
    beacon: false,
    landing: false,
    taxi: false,
    fuelPump: false,
  });
  const [selectedElement, setSelectedElement] = useState("attitude");

  const handleFlightUpdate = useCallback((next) => {
    setFlight((prev) => ({ ...prev, ...next }));
  }, []);

  const handleToggleSwitch = useCallback((id) => {
    setSwitches((prev) => ({ ...prev, [id]: !prev[id] }));
    if (id === "master") {
      setSelectedElement("master");
    }
  }, []);

  const handleSelectElement = useCallback(
    (id) => {
      setSelectedElement(id);
      if (["airspeed", "attitude", "altimeter", "heading", "vsi", "turn"].includes(id)) {
        onSelectInstrument?.(id === "turn" ? "turn" : id);
      }
    },
    [onSelectInstrument]
  );

  const detailText = learningContent[selectedElement] ?? learningContent.attitude;

  const viewLabel = viewMode === "pilot" ? "Pilot Seat View" : "External View";

  return (
    <section className="rounded-2xl border border-slate-800 bg-cockpit-900/80 p-4 shadow-soft-glow backdrop-blur">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 md:text-base">Cessna 172 Cockpit Simulator</h2>
          <p className="text-xs text-slate-400 md:text-xs">
            Explore a training-style cockpit with live gauges, switches, and clickable systems hotspots.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1 rounded-full bg-slate-900/80 px-1.5 py-0.5 ring-1 ring-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("external")}
              className={`rounded-full px-2 py-0.5 ${
                viewMode === "external" ? "bg-sky-500 text-slate-950 shadow-soft-glow" : "text-slate-300"
              }`}
            >
              External
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pilot")}
              className={`rounded-full px-2 py-0.5 ${
                viewMode === "pilot" ? "bg-sky-500 text-slate-950 shadow-soft-glow" : "text-slate-300"
              }`}
            >
              Pilot Seat
            </button>
          </div>
          <span className="hidden text-[10px] text-slate-400 md:inline">{viewLabel}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
        <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-inner md:h-72">
          <Canvas shadows dpr={[1, 2]}>
            <CockpitScene
              viewMode={viewMode}
              selectedElementId={selectedElement}
              onSelectElement={handleSelectElement}
              onFlightUpdate={handleFlightUpdate}
            />
          </Canvas>
          <div className="pointer-events-none absolute inset-x-3 bottom-2 z-20 flex justify-between text-[10px] text-slate-400">
            <span>Click hotspots to open training notes.</span>
            <span>WASD/drag to orbit, scroll to zoom.</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <C172InstrumentPanel
            flight={flight}
            selectedInstrumentId={selectedInstrumentId}
            onSelectInstrument={onSelectInstrument}
          />
          <C172SwitchPanel switches={switches} onToggle={handleToggleSwitch} />
          <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-950/90 p-3 text-[11px] text-slate-200 md:text-xs">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="font-semibold text-slate-100">Learning focus</p>
              <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-400">
                Selected: {selectedElement}
              </span>
            </div>
            <p className="leading-relaxed text-slate-200">{detailText}</p>
            <p className="mt-2 text-[10px] text-slate-500">
              Tip: Ask the AI tutor to quiz you on checklist items, failures, and ACS tasks related to this control or
              instrument.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

