import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

export const GameCamera: React.FC = () => {
  const { camera } = useThree();
  const lookAtRef = useRef(new THREE.Vector3(0, 1.2, 0));

  useFrame((_, dt) => {
    const s = useGameStore.getState();
    const px = s.playerX;
    // Account for victory podium height if standing on orb stack
    const targetLiftY = s.status === "victory" ? Math.min(s.orbsCollected, 40) * 0.48 : 0;
    const py = s.playerY + targetLiftY;
    const pz = s.playerZ;

    const t = s.elapsedTime;
    const isResult = s.status === "victory" || s.status === "defeat";

    let targetPos: THREE.Vector3;
    let targetLook: THREE.Vector3;

    if (isResult) {
      // Result Close-up: In front of Gloop's face looking up at his crown & expression
      targetPos = new THREE.Vector3(px, py + 1.8, pz - 3.8);
      targetLook = new THREE.Vector3(px, py + 1.3, pz);
    } else if (t < 2.5 && s.status === "running") {
      // Beat 1 Hook: Front-facing 3/4 view showing Gloop's face & the opening arch
      targetPos = new THREE.Vector3(px + 1.4, py + 1.6, pz - 4.5);
      targetLook = new THREE.Vector3(px, py + 1.2, pz);
    } else {
      // 3/4 Dynamic Chase Camera: Behind Gloop (+Z), offset slightly (+X), looking ahead (-Z)
      targetPos = new THREE.Vector3(px * 0.6 + 2.0, py * 0.4 + 3.2, pz + 6.8);
      targetLook = new THREE.Vector3(px * 0.4, 1.2, pz - 7.0);
    }

    // Impact camera shake
    if (s.shakeIntensity > 0.01) {
      const shakeAmt = s.shakeIntensity * 0.35;
      targetPos.x += (Math.random() - 0.5) * shakeAmt;
      targetPos.y += (Math.random() - 0.5) * shakeAmt;
    }

    const k = 1 - Math.exp(-6 * dt);
    camera.position.lerp(targetPos, k);
    lookAtRef.current.lerp(targetLook, k);
    camera.lookAt(lookAtRef.current);
  });

  return null;
};
