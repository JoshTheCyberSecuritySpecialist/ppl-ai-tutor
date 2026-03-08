import React from "react";
import { Html } from "@react-three/drei";

export function InstrumentHotspot({ id, label, position, isActive, onSelect }) {
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
        <cylinderGeometry args={[0.28, 0.28, 0.08, 48]} />
        <meshStandardMaterial
          color={isActive ? "#38bdf8" : "#020617"}
          metalness={0.3}
          roughness={0.4}
          emissive={isActive ? "#0ea5e9" : "#000000"}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </mesh>
      <Html distanceFactor={18} position={[0, -0.28, 0]} center>
        <div
          className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
            isActive ? "bg-sky-500/90 text-slate-950" : "bg-slate-900/80 text-slate-200"
          } border border-slate-700/70`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

