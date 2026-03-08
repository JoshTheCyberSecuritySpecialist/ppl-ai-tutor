import React, { Suspense, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Html,
  useGLTF,
  useProgress,
} from "@react-three/drei";

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-[11px] font-medium text-slate-100 shadow-lg">
        Loading aircraft… {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

/** Sky gradient background: deeper blue overhead (#60a5fa) to light blue at horizon (#dbeafe). */
function SkyGradient() {
  const { scene } = useThree();
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#60a5fa");
    gradient.addColorStop(1, "#dbeafe");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    scene.background = texture;
    return () => {
      scene.background = null;
      texture.dispose();
    };
  }, [scene, texture]);

  return null;
}

/** Enables soft shadows on the renderer. */
function ShadowMapConfig() {
  const { gl } = useThree();
  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);
  return null;
}

const PREFLIGHT_STEP_PART_IDS = {
  pitot: ["pitot"],
  fuel: ["fuel"],
  controls: ["aileron", "flaps", "rudder"],
  static: ["static"],
  stall: ["stall"],
};

function HotspotMarker({
  part,
  isHovered,
  isSelected,
  isPreflightActive,
  isPreflightDimmed,
  onSelect,
  onPointerOver,
  onPointerOut,
}) {
  const groupRef = React.useRef(null);
  useFrame((state) => {
    if (!groupRef.current || !isPreflightActive) return;
    const s = 1 + 0.08 * Math.sin(state.clock.elapsedTime * 3);
    groupRef.current.scale.setScalar(s);
  });

  const bright = isHovered || isSelected || isPreflightActive;
  const emissiveIntensity = isPreflightDimmed ? 0.15 : bright ? 1.4 : 0.3;
  const emissive = bright ? "#0ea5e9" : "#0f172a";

  return (
    <group ref={groupRef} position={part.position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      {(isHovered || isPreflightActive) && (
        <Html distanceFactor={18} position={[0, 0.16, 0]} center>
          <div
            className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${
              isPreflightActive
                ? "border-amber-400 bg-amber-500/95 text-slate-950 shadow-soft-glow animate-pulse"
                : "border-sky-400 bg-sky-500/95 text-slate-950 shadow-soft-glow"
            }`}
          >
            {part.label}
          </div>
        </Html>
      )}
    </group>
  );
}

function AircraftModel({
  selectedId,
  selectedPart,
  onSelectPart,
  preflightMode = false,
  preflightActivePartIds = [],
  onPreflightPartClick,
}) {
  // Cessna 172 SP model: public/models/c172/free_cessna_172sp.glb
  // selectedId is accepted for future extensions (different airframes).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _id = selectedId || "c172";

  const { scene } = useGLTF("/models/c172/free_cessna_172sp.glb", true);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });
  }, [scene]);

  const [hoveredId, setHoveredId] = useState(null);
  const [modelCenter, setModelCenter] = useState(() => new THREE.Vector3(0, 0, 0));
  const [modelScale, setModelScale] = useState(1);

  useEffect(() => {
    const temp = new THREE.Group();
    const clone = scene.clone();
    temp.add(clone);
    temp.rotation.y = Math.PI;
    temp.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(temp);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 6 / maxDim : 1;

    setModelCenter(center);
    setModelScale(scale);
  }, [scene]);

  const clickableParts = useMemo(
    () => [
      {
        id: "pitot",
        label: "Pitot Tube",
        position: [2.5, 1.1, 0.2],
      },
      {
        id: "fuel",
        label: "Fuel Cap",
        position: [-0.7, 1.4, 0],
      },
      {
        id: "flaps",
        label: "Flaps",
        position: [-3, 0.9, 0],
      },
      {
        id: "aileron",
        label: "Aileron",
        position: [3, 0.9, 0],
      },
      {
        id: "rudder",
        label: "Rudder",
        position: [-4.2, 1.6, 0],
      },
      {
        id: "static",
        label: "Static Port",
        position: [0.5, 1, -0.3],
      },
      {
        id: "stall",
        label: "Stall Warning",
        position: [1.5, 0.6, 0.5],
      },
    ],
    []
  );

  // Wrapper: centers the aircraft in the scene and applies uniform scale.
  // aircraftModel group: same transform as the GLTF so hotspots are in model-local space and follow move/rotate/scale.
  const wrapperPosition = [-modelCenter.x, -modelCenter.y + 1, -modelCenter.z];
  const modelRotation = [0, Math.PI, 0];

  return (
    <group position={wrapperPosition} scale={2}>
      <group name="aircraftModel" rotation={modelRotation}>
        <primitive object={scene} position={[0, 0, 0]} castShadow receiveShadow />
        {clickableParts.map((part) => {
          const isHovered = hoveredId === part.id;
          const isSelected = selectedPart === part.id;
          const isPreflightActive = preflightMode && preflightActivePartIds.includes(part.id);
          const isPreflightDimmed = preflightMode && !isPreflightActive;

          return (
            <HotspotMarker
              key={part.id}
              part={part}
              isHovered={isHovered}
              isSelected={isSelected}
              isPreflightActive={isPreflightActive}
              isPreflightDimmed={isPreflightDimmed}
              onSelect={() => {
                if (preflightMode && onPreflightPartClick) {
                  onPreflightPartClick(part.id);
                } else {
                  onSelectPart?.(part.id);
                }
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(part.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHoveredId(null);
                document.body.style.cursor = "default";
              }}
            />
          );
        })}
      </group>
    </group>
  );
}
// Preload the Cessna 172 SP model for smoother entry into the scene
useGLTF.preload("/models/c172/free_cessna_172sp.glb");

function GroundAndRunway() {
  return (
    <group position={[0, 0, 0]}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2a3441" roughness={0.95} />
      </mesh>

      {/* Runway */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[18, 80]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Centerline */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, -30 + i * 6]}
        >
          <planeGeometry args={[0.7, 2.6]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>
      ))}
    </group>
  );
}

function AircraftScene({
  selectedId,
  viewMode,
  resetKey,
  selectedPart,
  onSelectPart,
  preflightMode,
  preflightActivePartIds,
  onPreflightPartClick,
}) {
  const externalCamera = {
    position: [14, 6, 14],
    target: [0, 0, 0],
  };

  const cockpitCamera = {
    position: [0.4, 1.3, 0.8],
    target: [2.5, 1.2, 2.5],
  };

  const cameraConfig = viewMode === "cockpit" ? cockpitCamera : externalCamera;

  return (
    <>
      <SkyGradient />
      <ShadowMapConfig />
      <Environment preset="sunset" />

      <PerspectiveCamera makeDefault position={cameraConfig.position} fov={45} />

      <hemisphereLight
        color="#87ceeb"
        groundColor="#444444"
        intensity={0.6}
        position={[0, 200, 0]}
      />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 100, 25]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={500}
        shadow-bias={-0.0002}
      />

      <GroundAndRunway />

      <AircraftModel
        selectedId={selectedId}
        selectedPart={selectedPart}
        onSelectPart={onSelectPart}
        preflightMode={preflightMode}
        preflightActivePartIds={preflightActivePartIds}
        onPreflightPartClick={onPreflightPartClick}
      />

      <ContactShadows
        position={[0, -0.39, 0]}
        opacity={0.6}
        width={20}
        height={20}
        blur={2.4}
        far={12}
        resolution={1024}
      />

      <OrbitControls
        key={resetKey}
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.08}
        minDistance={8}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />
    </>
  );
}

const preflightSteps = [
  {
    id: "pitot",
    label: "Pitot Tube",
    description:
      "Check pitot tube opening is clear of debris and pitot cover is removed.",
  },
  {
    id: "fuel",
    label: "Fuel Sump",
    description: "Drain fuel sump and check for water or contaminants.",
  },
  {
    id: "controls",
    label: "Control Surfaces",
    description:
      "Move ailerons, elevator, and rudder to check for smooth movement and security.",
  },
  {
    id: "static",
    label: "Static Port",
    description: "Ensure the static port is unobstructed.",
  },
  {
    id: "stall",
    label: "Stall Warning",
    description: "Test stall warning horn by gently lifting the vane.",
  },
];

const partDescriptions = {
  pitot:
    "Pitot tube: measures dynamic pressure for the airspeed indicator. Blockages can cause serious airspeed errors and are a key systems topic in training.",
  fuel:
    "Fuel cap: seals the fuel tank and vents. Preflight includes checking caps, vents, and signs of fuel leaks or contamination.",
  flaps:
    "Flaps: high-lift devices that change the camber of the wing. They allow slower approach speeds and steeper descent angles—key for short- and soft-field operations.",
  aileron:
    "Ailerons: primary roll control surfaces. Demonstrate coordinated use with rudder to avoid adverse yaw during training.",
  rudder:
    "Rudder: controls yaw about the vertical axis. Use it to keep the ball centered, especially during takeoff and landing in crosswinds.",
  static:
    "Static port: provides static pressure to the pitot-static instruments (altimeter, VSI, airspeed). Blockages can corrupt multiple instruments at once.",
  stall:
    "Stall warning: vane or sensor that activates the stall horn. Test during preflight by gently lifting the vane.",
};

export function AircraftViewer({ selectedId }) {
  const [viewMode, setViewMode] = useState("external");
  const [resetKey, setResetKey] = useState(0);
  const [selectedPart, setSelectedPart] = useState(null);
  const [preflightMode, setPreflightMode] = useState(false);
  const [preflightStep, setPreflightStep] = useState(0);
  const [preflightWrongMessage, setPreflightWrongMessage] = useState(null);
  const [preflightComplete, setPreflightComplete] = useState(false);

  const modeLabel = viewMode === "cockpit" ? "Cockpit View" : "External View";
  const partLabel = selectedPart ? partDescriptions[selectedPart] : null;

  const currentPreflightStep = preflightSteps[preflightStep];
  const preflightActivePartIds = currentPreflightStep
    ? PREFLIGHT_STEP_PART_IDS[currentPreflightStep.id] ?? []
    : [];

  const handlePreflightPartClick = (partId) => {
    if (!currentPreflightStep) return;
    const validIds = PREFLIGHT_STEP_PART_IDS[currentPreflightStep.id];
    if (validIds && validIds.includes(partId)) {
      setPreflightWrongMessage(null);
      if (preflightStep + 1 >= preflightSteps.length) {
        setPreflightComplete(true);
        setPreflightMode(false);
        setPreflightStep(0);
      } else {
        setPreflightStep((s) => s + 1);
      }
    } else {
      setPreflightWrongMessage("Inspect the highlighted component first.");
    }
  };

  useEffect(() => {
    if (!preflightWrongMessage) return;
    const t = setTimeout(() => setPreflightWrongMessage(null), 2500);
    return () => clearTimeout(t);
  }, [preflightWrongMessage]);

  useEffect(() => {
    if (!preflightComplete) return;
    const t = setTimeout(() => setPreflightComplete(false), 5000);
    return () => clearTimeout(t);
  }, [preflightComplete]);

  const handleStartPreflight = () => {
    setPreflightComplete(false);
    setPreflightWrongMessage(null);
    setPreflightMode(true);
    setPreflightStep(0);
  };

  return (
    <div className="relative flex h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-soft-glow">
      <div className="pointer-events-none absolute -right-20 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-2 p-3 pb-2">
        <div className="flex items-center justify-between text-xs text-slate-300 md:text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              3D Aircraft Training Viewer
            </p>
            <p className="text-[11px] text-slate-400">
              Click + drag to rotate, scroll to zoom, right-drag to pan. Click hotspots to brief key airframe items.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!preflightMode && (
              <button
                type="button"
                onClick={handleStartPreflight}
                className="rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-semibold text-slate-950 shadow-soft-glow hover:bg-amber-400"
              >
                Start Preflight Inspection
              </button>
            )}
            <div className="hidden items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/50 md:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span>Live • Training Lab</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-slate-900/80 px-1.5 py-1 text-[10px] font-medium text-slate-200 ring-1 ring-slate-700/70">
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
                onClick={() => setViewMode("cockpit")}
                className={`rounded-full px-2 py-0.5 ${
                  viewMode === "cockpit" ? "bg-sky-500 text-slate-950 shadow-soft-glow" : "text-slate-300"
                }`}
              >
                Cockpit
              </button>
            </div>
            <button
              type="button"
              onClick={() => setResetKey((k) => k + 1)}
              className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-slate-200 hover:border-sky-400 hover:text-sky-200"
            >
              Reset
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 md:text-[11px]">
          {modeLabel} • Use this to preflight the airframe before jumping into the cockpit trainer.
        </p>
      </div>

      <div className="relative z-10 flex flex-1">
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={<CanvasLoader />}>
            <AircraftScene
              selectedId={selectedId}
              viewMode={viewMode}
              resetKey={resetKey}
              selectedPart={selectedPart}
              onSelectPart={setSelectedPart}
              preflightMode={preflightMode}
              preflightActivePartIds={preflightActivePartIds}
              onPreflightPartClick={handlePreflightPartClick}
            />
          </Suspense>
        </Canvas>
      </div>

      {preflightComplete && (
        <div className="absolute inset-x-3 top-20 z-20">
          <div className="rounded-xl border border-emerald-500/80 bg-emerald-950/95 px-4 py-3 text-center text-sm font-medium text-emerald-100 shadow-lg">
            Preflight inspection complete. Aircraft ready for flight.
          </div>
        </div>
      )}

      {preflightMode && currentPreflightStep && (
        <div className="absolute inset-x-3 top-20 z-20">
          <div className="rounded-xl border border-amber-500/80 bg-slate-950/95 px-4 py-3 shadow-lg">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400">
              Preflight Step {preflightStep + 1}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-100">{currentPreflightStep.label}</p>
            <p className="mt-1 text-xs text-slate-300">{currentPreflightStep.description}</p>
          </div>
        </div>
      )}

      {preflightWrongMessage && (
        <div className="absolute inset-x-3 bottom-3 z-20">
          <div className="rounded-xl border border-red-500/80 bg-red-950/95 px-4 py-2 text-center text-xs font-medium text-red-100 shadow-lg">
            {preflightWrongMessage}
          </div>
        </div>
      )}

      {partLabel && !preflightMode && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20">
          <div className="pointer-events-auto rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 text-[11px] text-slate-100 shadow-lg md:text-xs">
            {partLabel}
          </div>
        </div>
      )}
    </div>
  );
}
