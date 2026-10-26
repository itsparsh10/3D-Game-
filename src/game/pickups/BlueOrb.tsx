import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

interface BlueOrbProps {
  id: string;
  position: [number, number, number];
  value: number;
}

export const BlueOrb: React.FC<BlueOrbProps> = ({ id, position, value }) => {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const playerX = useGameStore((state) => state.playerX);
  const playerY = useGameStore((state) => state.playerY);
  const playerZ = useGameStore((state) => state.playerZ);
  const collectOrb = useGameStore((state) => state.collectOrb);

  const [collected, setCollected] = React.useState(false);

  useFrame((state) => {
    if (collected || !meshRef.current) return;

    const t = state.clock.getElapsedTime();
    // Gentle bobbing and spinning
    meshRef.current.position.y =
      position[1] + Math.sin(t * 4 + position[2] * 0.1) * 0.12;
    meshRef.current.rotation.y = t * 2.5;

    if (ringRef.current) {
      ringRef.current.rotation.x = t * 3;
      ringRef.current.rotation.z = t * 2;
    }
  });

  const orb = useGameStore((s) => s.levelData.orbs.find((o) => o.id === id));
  if (
    orb?.collected ||
    position[2] > playerZ + 8 ||
    position[2] < playerZ - 115
  )
    return null;
  const color =
    value === 2 ? "#ffc637" : position[0] > 1 ? "#ff535d" : "#00cbea";

  return (
    <group ref={meshRef} position={position}>
      {/* Outer Luminous Sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.25}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Inner Bright Core */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Orbiting Energy Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.42, 0.025, 8, 24]} />
        <meshBasicMaterial color="#7dd3fc" />
      </mesh>
    </group>
  );
};
