import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

interface SpikeRollerProps {
  id: string;
  position: [number, number, number];
  rotationSpeed?: number;
}

export const SpikeRoller: React.FC<SpikeRollerProps> = ({
  id,
  position,
  rotationSpeed = 3.0,
}) => {
  const rollerRef = useRef<THREE.Group>(null);
  const playerY = useGameStore((state) => state.playerY);
  const playerZ = useGameStore((state) => state.playerZ);
  const hitObstacle = useGameStore((state) => state.hitObstacle);

  const [hasCollided, setHasCollided] = React.useState(false);

  useFrame((state) => {
    if (!rollerRef.current) return;
    rollerRef.current.rotation.x =
      -useGameStore.getState().elapsedTime * rotationSpeed;
  });

  return (
    <group position={position}>
      {/* Side Mounting Blocks */}
      <mesh position={[-3.8, 0.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.8]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      <mesh position={[3.8, 0.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.8]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {/* Rotating Spiked Cylinder */}
      <group ref={rollerRef} position={[0, 0.45, 0]}>
        {/* Central Core Axle */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 7.2, 16]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        {/* Spike Rings */}
        {[-2.6, -1.3, 0, 1.3, 2.6].map((xOffset, idx) => (
          <group key={idx} position={[xOffset, 0, 0]}>
            {[0, 1, 2, 3].map((coneIdx) => {
              const angle = (coneIdx * Math.PI) / 2;
              return (
                <mesh
                  key={coneIdx}
                  position={[0, Math.sin(angle) * 0.4, Math.cos(angle) * 0.4]}
                  rotation={[angle, 0, 0]}
                  castShadow
                >
                  <coneGeometry args={[0.15, 0.4, 10]} />
                  <meshStandardMaterial
                    color="#f97316"
                    roughness={0.3}
                    metalness={0.4}
                  />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>
    </group>
  );
};
