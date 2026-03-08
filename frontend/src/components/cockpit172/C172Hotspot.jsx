import React from "react";
import { Html } from "@react-three/drei";

export function C172Hotspot({ id, label, position, active = false, onSelect }) {
  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={active ? "#38bdf8" : "#22c55e"}
          emissive={active ? "#0ea5e9" : "#052e16"}
          emissiveIntensity={active ? 0.9 : 0.4}
        />
      </mesh>
      <Html distanceFactor={16} position={[0, -0.12, 0]} center>
        <div
          className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${
            active
              ? "border-sky-400 bg-sky-500/90 text-slate-950 shadow-soft-glow"
              : "border-slate-700 bg-slate-900/90 text-slate-100"
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

