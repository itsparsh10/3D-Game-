import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

export const Glitchmaker: React.FC = () => {
  const cubeRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);

  const playerZ = useGameStore((state) => state.playerZ);
  const activeBeat = useGameStore((state) => state.activeBeat);
  const twist = useGameStore((state) => state.activeEpisode.twist);

  const isVisible =
    twist === "glitchmaker-attack" ||
    activeBeat === "twist" ||
    activeBeat === "hard-obstacle";

  useFrame((state) => {
    if (!cubeRef.current) return;
    const t = state.clock.getElapsedTime();

    // Floats menacingly ahead of Gloop on the track
    cubeRef.current.position.set(
      Math.sin(t * 2.5) * 2.0,
      2.6 + Math.cos(t * 3.5) * 0.35,
      playerZ - 18,
    );

    cubeRef.current.rotation.x = t * 0.8;
    cubeRef.current.rotation.y = t * 1.2;

    if (orbitRef.current) {
      orbitRef.current.rotation.y = -t * 2.5;
      orbitRef.current.rotation.z = t * 1.5;
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={cubeRef}>
      {/* Main Glitch Purple Cube */}
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial
          color="#9333ea"
          emissive="#c026d3"
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Menacing Angular Yellow Eye Slits */}
      <mesh position={[-0.2, 0.1, 0.46]}>
        <boxGeometry args={[0.2, 0.08, 0.05]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
      <mesh position={[0.2, 0.1, 0.46]}>
        <boxGeometry args={[0.2, 0.08, 0.05]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>

      {/* Orbiting Glitch Voxels */}
      <group ref={orbitRef}>
        {[
          [-0.8, 0.4, 0.5],
          [0.9, -0.3, -0.4],
          [0.3, 0.9, -0.6],
          [-0.5, -0.8, 0.3],
        ].map((pos, idx) => (
          <mesh key={idx} position={pos as [number, number, number]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color="#ec4899"
              emissive="#f43f5e"
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      <pointLight color="#d946ef" intensity={2} distance={6} decay={2} />
    </group>
  );
};
