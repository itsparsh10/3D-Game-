import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const Pip: React.FC = () => {
  const pipRef = useRef<THREE.Group>(null);
  const playerX = useGameStore((state) => state.playerX);
  const playerY = useGameStore((state) => state.playerY);
  const playerZ = useGameStore((state) => state.playerZ);
  const activeBeat = useGameStore((state) => state.activeBeat);

  useFrame((state) => {
    if (!pipRef.current) return;
    const t = state.clock.getElapsedTime();

    // Floats to the upper-right of Gloop, smoothly tracking him
    const targetX = playerX + 1.2 + Math.sin(t * 2) * 0.2;
    const targetY = playerY + 1.8 + Math.cos(t * 3) * 0.15;
    const targetZ = playerZ - 0.4;

    pipRef.current.position.x += (targetX - pipRef.current.position.x) * 0.1;
    pipRef.current.position.y += (targetY - pipRef.current.position.y) * 0.1;
    pipRef.current.position.z += (targetZ - pipRef.current.position.z) * 0.1;

    // Gentle star wobble & rotation
    pipRef.current.rotation.y = t * 1.5;
    pipRef.current.rotation.z = Math.sin(t * 3) * 0.15;

    // React to beats
    if (activeBeat === 'result') {
      pipRef.current.scale.setScalar(1.3 + Math.sin(t * 10) * 0.2);
    } else {
      pipRef.current.scale.setScalar(1.0);
    }
  });

  return (
    <group ref={pipRef}>
      {/* Golden Glowing Star Body */}
      <mesh castShadow>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#eab308"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Cute Pip Eyes */}
      <mesh position={[0.06, 0.04, 0.14]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-0.06, 0.04, 0.14]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* Point light for glowing aura */}
      <pointLight color="#fde047" intensity={1.5} distance={3} decay={2} />
    </group>
  );
};
