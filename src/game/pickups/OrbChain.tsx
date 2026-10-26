import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

const MAX_ORBS = 40;
const FRAME_GAP = 5; // History frames between trailing orbs

export const OrbChain: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const historyRef = useRef<{ x: number; y: number }[]>([]);
  const tmpObj = useRef(new THREE.Object3D());

  useFrame(() => {
    if (!meshRef.current) return;

    const playerX = useGameStore.getState().playerX;
    const playerY = useGameStore.getState().playerY;
    const playerZ = useGameStore.getState().playerZ;
    const orbsCollected = useGameStore.getState().orbsCollected;
    const status = useGameStore.getState().status;

    const count = Math.min(orbsCollected, MAX_ORBS);

    // Track horizontal position history
    historyRef.current.unshift({ x: playerX, y: playerY });
    if (historyRef.current.length > MAX_ORBS * FRAME_GAP + 2) {
      historyRef.current.pop();
    }

    const isVictory = status === 'victory';

    for (let i = 0; i < MAX_ORBS; i++) {
      if (i >= count) {
        // Hide unused instances
        tmpObj.current.scale.setScalar(0);
        tmpObj.current.position.set(0, -100, 0);
        tmpObj.current.updateMatrix();
        meshRef.current.setMatrixAt(i, tmpObj.current.matrix);
        continue;
      }

      if (isVictory) {
        // Stacks neatly directly under Gloop into a victory podium!
        tmpObj.current.position.set(playerX, 0.38 + i * 0.48, playerZ);
      } else {
        // Snakes along the path behind Gloop in +Z (since Gloop runs in -Z)
        const histIndex = Math.min((i + 1) * FRAME_GAP, historyRef.current.length - 1);
        const histPos = historyRef.current[histIndex] || { x: playerX, y: playerY };
        const trailZ = playerZ + (i + 1) * 0.75;
        const trailY = 0.45 + (histPos.y > 0 ? histPos.y * 0.6 : 0);

        tmpObj.current.position.set(histPos.x, trailY, trailZ);
      }

      tmpObj.current.scale.setScalar(0.38);
      tmpObj.current.updateMatrix();
      meshRef.current.setMatrixAt(i, tmpObj.current.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_ORBS]}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 32, 24]} />
      <meshPhysicalMaterial
        color="#2aa8ff"
        roughness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.05}
        emissive="#1a6fff"
        emissiveIntensity={0.65}
      />
    </instancedMesh>
  );
};
