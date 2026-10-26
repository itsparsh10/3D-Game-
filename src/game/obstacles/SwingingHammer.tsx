import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

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
  swingAmplitude = 3.0
}) => {
  const pivotRef = useRef<THREE.Group>(null);
  const hammerHeadRef = useRef<THREE.Mesh>(null);

  const playerX = useGameStore((state) => state.playerX);
  const playerY = useGameStore((state) => state.playerY);
  const playerZ = useGameStore((state) => state.playerZ);
  const isSliding = useGameStore((state) => state.isSliding);
  const hitObstacle = useGameStore((state) => state.hitObstacle);

  const [hasCollided, setHasCollided] = React.useState(false);

  useFrame((state) => {
    if (!pivotRef.current) return;
    const t = state.clock.getElapsedTime();

    // Pendulum swing angle
    const angle = Math.sin(t * swingSpeed + position[2] * 0.05) * (Math.PI / 3);
    pivotRef.current.rotation.z = angle;

    // Calculate current hammer head world position
    const hammerX = Math.sin(angle) * swingAmplitude;
    const hammerY = 4.2 - Math.cos(angle) * swingAmplitude;
    const hammerZ = position[2];

    // Collision check: if player is within Z window (~1.2 units) and close to hammer head
    const dz = Math.abs(playerZ - hammerZ);
    if (!hasCollided && dz < 1.2) {
      const dx = Math.abs(playerX - hammerX);
      const dy = Math.abs(playerY + 0.5 - hammerY);

      // If sliding and hammer is swinging high, player ducks under!
      if (isSliding && hammerY > 0.8) {
        // Safe duck under
      } else if (dx < 1.1 && dy < 1.1) {
        setHasCollided(true);
        hitObstacle(id);
      }
    }
  });

  return (
    <group position={position}>
      {/* Overhead Support Arch Frame */}
      {/* Left Pillar */}
      <mesh position={[-4.0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 5.0, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Right Pillar */}
      <mesh position={[4.0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 5.0, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Top Crossbeam */}
      <mesh position={[0, 4.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 8.2, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Swinging Pivot Group at top */}
      <group ref={pivotRef} position={[0, 4.8, 0]}>
        {/* Shaft */}
        <mesh position={[0, -1.8, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 3.6, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Hammer Head: Toy-like Red Cylinder with White Stripes */}
        <group position={[0, -3.6, 0]}>
          <mesh ref={hammerHeadRef} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.65, 0.65, 1.8, 24]} />
            <meshStandardMaterial color="#ef4444" roughness={0.25} metalness={0.3} />
          </mesh>

          {/* White End Caps */}
          <mesh position={[-0.92, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.68, 0.68, 0.15, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0.92, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.68, 0.68, 0.15, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
