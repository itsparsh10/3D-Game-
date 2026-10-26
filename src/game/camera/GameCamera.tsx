import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const GameCamera: React.FC = () => {
  const { camera } = useThree();
  const playerX = useGameStore((state) => state.playerX);
  const playerY = useGameStore((state) => state.playerY);
  const playerZ = useGameStore((state) => state.playerZ);
  const status = useGameStore((state) => state.status);
  const shakeIntensity = useGameStore((state) => state.shakeIntensity);

  const currentCamPos = useRef(new THREE.Vector3(0, 4, 7));
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 0));

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Default chase camera offset: 3.5 units above, 6.5 units behind
    let targetX = playerX * 0.45;
    let targetY = playerY * 0.4 + 3.4;
    let targetZ = playerZ + 6.2;

    let lookAtX = playerX * 0.7;
    let lookAtY = playerY * 0.5 + 1.2;
    let lookAtZ = playerZ - 9; // Look ahead into the track

    // Camera shake calculation
    if (shakeIntensity > 0.01) {
      const shakeX = (Math.random() - 0.5) * shakeIntensity * 0.4;
      const shakeY = (Math.random() - 0.5) * shakeIntensity * 0.4;
      targetX += shakeX;
      targetY += shakeY;
    }

    // Victory cinematic orbit!
    if (status === 'victory') {
      const orbitRadius = 4.0;
      targetX = playerX + Math.sin(t * 1.5) * orbitRadius;
      targetY = playerY + 2.0;
      targetZ = playerZ + Math.cos(t * 1.5) * orbitRadius;

      lookAtX = playerX;
      lookAtY = playerY + 0.8;
      lookAtZ = playerZ;
    }

    // Smooth interpolation with delta time
    const lerpSpeed = Math.min(1, delta * 8.5);
    currentCamPos.current.x += (targetX - currentCamPos.current.x) * lerpSpeed;
    currentCamPos.current.y += (targetY - currentCamPos.current.y) * lerpSpeed;
    currentCamPos.current.z += (targetZ - currentCamPos.current.z) * lerpSpeed;

    currentLookAt.current.x += (lookAtX - currentLookAt.current.x) * lerpSpeed;
    currentLookAt.current.y += (lookAtY - currentLookAt.current.y) * lerpSpeed;
    currentLookAt.current.z += (lookAtZ - currentLookAt.current.z) * lerpSpeed;

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);

    // Subtle lane-switch roll tilt
    if (status === 'running') {
      const rollTilt = (targetX - currentCamPos.current.x) * -0.05;
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, rollTilt, delta * 10);
    }
  });

  return null;
};
