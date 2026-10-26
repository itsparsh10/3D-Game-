import React from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "../../store/gameStore";
import { SoundManager } from "../audio/SoundManager";

interface BouncePadProps {
  id: string;
  position: [number, number, number];
}

export const BouncePad: React.FC<BouncePadProps> = ({ position }) => {
  const playerX = useGameStore((state) => state.playerX);
  const playerZ = useGameStore((state) => state.playerZ);
  const triggerJump = useGameStore((state) => state.triggerJump);

  const [hasBounced, setHasBounced] = React.useState(false);

  return (
    <group position={position}>
      {/* Outer Sloped Bevel Base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.16, 2.0]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} />
      </mesh>

      {/* Inner Springy Blue Pressure Plate */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[1.6, 0.1, 1.6]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Upward Chevron Arrows */}
      <mesh position={[0, 0.24, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.24, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};
