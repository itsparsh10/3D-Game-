import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

interface SwingingHammerProps {
  id: string;
  position: [number, number, number];
  swingSpeed?: number;
  swingAmplitude?: number;
}

export const SwingingHammer: React.FC<SwingingHammerProps> = ({
  id,
  position,
  swingSpeed = 2.2,
  swingAmplitude = 2.8,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const hammerHeadRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!pivotRef.current || !rootGroupRef.current) return;
    const s = useGameStore.getState();
    const t = s.elapsedTime;

    // Smooth pendulum swing
    const angle = Math.sin(t * swingSpeed + position[2] * 0.05) * (Math.PI / 3.2);
    pivotRef.current.rotation.z = angle;

    // Camera proximity fade: hide or scale down when within 4 units of camera
    const distToCam = Math.abs(s.playerZ - position[2]);
    if (distToCam < 3.5) {
      rootGroupRef.current.visible = false;
    } else {
      rootGroupRef.current.visible = true;
    }
  });

  return (
    <group ref={rootGroupRef} position={position}>
      {/* Overhead Support Arch Frame - Compact, capped at ~40% track width */}
      {/* Left Pillar */}
      <mesh position={[-3.6, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 4.8, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Right Pillar */}
      <mesh position={[3.6, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 4.8, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Top Crossbeam */}
      <mesh position={[0, 4.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 7.4, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Swinging Pivot Group at top */}
      <group ref={pivotRef} position={[0, 4.6, 0]}>
        {/* Shaft */}
        <mesh position={[0, -1.6, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 3.2, 12]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Hammer Head: Toy-like Red Cylinder with White Stripes */}
        <group position={[0, -3.2, 0]}>
          <mesh ref={hammerHeadRef} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 1.4, 24]} />
            <meshStandardMaterial
              color="#ef4444"
              roughness={0.25}
              metalness={0.3}
              emissive="#b91c1c"
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* White End Caps */}
          <mesh position={[-0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.58, 0.58, 0.12, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.58, 0.58, 0.12, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
