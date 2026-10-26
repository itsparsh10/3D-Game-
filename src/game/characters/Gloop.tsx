import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const GLOOP_BODY_COLOR = '#06b6d4'; // Glossy turquoise cyan
export const GLOOP_SNEAKER_ORANGE = '#f97316'; // Vibrant orange
export const GLOOP_SNEAKER_WHITE = '#f8fafc'; // Clean white sole

export const Gloop: React.FC = () => {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  const playerX = useGameStore((state) => state.playerX);
  const playerY = useGameStore((state) => state.playerY);
  const playerZ = useGameStore((state) => state.playerZ);
  const isJumping = useGameStore((state) => state.isJumping);
  const isSliding = useGameStore((state) => state.isSliding);
  const status = useGameStore((state) => state.status);

  useFrame((state) => {
    if (!rootRef.current || !bodyRef.current) return;

    const t = state.clock.getElapsedTime();

    // Position updates
    rootRef.current.position.set(playerX, playerY + 0.65, playerZ);

    if (status === 'running') {
      if (isJumping) {
        // Stretch vertically in jump
        bodyRef.current.scale.set(0.85, 1.25, 0.85);
        bodyRef.current.rotation.x = -0.15;
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = -0.4;
          rightLegRef.current.rotation.x = -0.4;
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -1.2;
          rightArmRef.current.rotation.x = -1.2;
        }
      } else if (isSliding) {
        // Squash horizontally in slide
        bodyRef.current.scale.set(1.3, 0.55, 1.2);
        bodyRef.current.position.y = -0.3;
        bodyRef.current.rotation.x = 0.35;
      } else {
        // Running cycle (14 rad/s)
        const runFreq = 14;
        const bounce = Math.abs(Math.sin(t * runFreq)) * 0.14;
        const squash = 1 + Math.sin(t * runFreq * 2) * 0.08;

        bodyRef.current.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
        bodyRef.current.position.y = bounce;
        bodyRef.current.rotation.x = 0.12; // Forward lean
        bodyRef.current.rotation.z = Math.sin(t * runFreq) * 0.05;

        // Legs swinging
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(t * runFreq) * 0.8;
          rightLegRef.current.rotation.x = -Math.sin(t * runFreq) * 0.8;
        }

        // Arms pumping
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -Math.sin(t * runFreq) * 0.9;
          rightArmRef.current.rotation.x = Math.sin(t * runFreq) * 0.9;
        }
      }
    } else if (status === 'victory') {
      // Victory celebration: jumping up with raised hands
      const winBounce = Math.abs(Math.sin(t * 8)) * 0.45;
      bodyRef.current.position.y = winBounce;
      bodyRef.current.rotation.y = Math.sin(t * 4) * 0.3;
      bodyRef.current.scale.set(1.1, 1.1, 1.1);

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.z = 1.2 + Math.sin(t * 8) * 0.3;
        rightArmRef.current.rotation.z = -1.2 - Math.sin(t * 8) * 0.3;
      }
    } else if (status === 'defeat') {
      // Defeat sad squish
      bodyRef.current.scale.set(1.2, 0.7, 1.2);
      bodyRef.current.rotation.x = 0.3;
      bodyRef.current.position.y = -0.2;
    } else {
      // Idle breathing bounce
      const idle = Math.sin(t * 3) * 0.05;
      bodyRef.current.position.y = idle;
      bodyRef.current.scale.set(1 + idle * 0.5, 1 - idle * 0.5, 1 + idle * 0.5);
      bodyRef.current.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={rootRef}>
      {/* Dynamic shadow blob beneath Gloop */}
      <mesh position={[0, -0.63 - playerY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55 * (1 / (1 + playerY * 0.8)), 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      <group ref={bodyRef}>
        {/* Main Jelly Torso: Stylized rounded capsule */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.52, 32, 32]} />
          <meshStandardMaterial
            color={GLOOP_BODY_COLOR}
            roughness={0.12}
            metalness={0.15}
            emissive="#0891b2"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Glossy top-highlight dome */}
        <mesh position={[0.15, 0.28, 0.2]} scale={[0.18, 0.12, 0.12]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
        </mesh>

        {/* --- EYES --- */}
        {/* Left Eye */}
        <group position={[-0.17, 0.12, 0.42]}>
          <mesh ref={leftEyeRef}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.09]}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Eye Catchlight */}
          <mesh position={[-0.03, 0.03, 0.14]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.17, 0.12, 0.42]}>
          <mesh ref={rightEyeRef}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.09]}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Eye Catchlight */}
          <mesh position={[-0.03, 0.03, 0.14]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Cute Eyebrows */}
        <mesh position={[-0.17, 0.28, 0.41]} rotation={[0, 0, 0.15]}>
          <capsuleGeometry args={[0.025, 0.08, 8, 8]} />
          <meshBasicMaterial color="#0891b2" />
        </mesh>
        <mesh position={[0.17, 0.28, 0.41]} rotation={[0, 0, -0.15]}>
          <capsuleGeometry args={[0.025, 0.08, 8, 8]} />
          <meshBasicMaterial color="#0891b2" />
        </mesh>

        {/* Happy Smile Mouth */}
        <mesh ref={mouthRef} position={[0, -0.1, 0.47]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.065, 0.02, 12, 16, Math.PI * 0.9]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>

        {/* --- ARMS --- */}
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.52, 0.0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.22, 12, 12]} />
            <meshStandardMaterial
              color={GLOOP_BODY_COLOR}
              roughness={0.2}
              emissive="#0891b2"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.52, 0.0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.22, 12, 12]} />
            <meshStandardMaterial
              color={GLOOP_BODY_COLOR}
              roughness={0.2}
              emissive="#0891b2"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      </group>

      {/* --- LEGS & ORANGE SNEAKERS --- */}
      {/* Left Leg + Sneaker */}
      <group ref={leftLegRef} position={[-0.22, -0.35, 0]}>
        {/* Leg stalk */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.18, 12]} />
          <meshStandardMaterial color={GLOOP_BODY_COLOR} roughness={0.2} />
        </mesh>
        {/* Orange Sneaker Body */}
        <mesh position={[0, -0.12, 0.06]} castShadow>
          <boxGeometry args={[0.18, 0.14, 0.32]} />
          <meshStandardMaterial color={GLOOP_SNEAKER_ORANGE} roughness={0.3} />
        </mesh>
        {/* White Sole */}
        <mesh position={[0, -0.21, 0.06]} receiveShadow>
          <boxGeometry args={[0.2, 0.06, 0.34]} />
          <meshStandardMaterial color={GLOOP_SNEAKER_WHITE} roughness={0.25} />
        </mesh>
        {/* White Toe Cap */}
        <mesh position={[0, -0.13, 0.21]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={GLOOP_SNEAKER_WHITE} roughness={0.25} />
        </mesh>
      </group>

      {/* Right Leg + Sneaker */}
      <group ref={rightLegRef} position={[0.22, -0.35, 0]}>
        {/* Leg stalk */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.18, 12]} />
          <meshStandardMaterial color={GLOOP_BODY_COLOR} roughness={0.2} />
        </mesh>
        {/* Orange Sneaker Body */}
        <mesh position={[0, -0.12, 0.06]} castShadow>
          <boxGeometry args={[0.18, 0.14, 0.32]} />
          <meshStandardMaterial color={GLOOP_SNEAKER_ORANGE} roughness={0.3} />
        </mesh>
        {/* White Sole */}
        <mesh position={[0, -0.21, 0.06]} receiveShadow>
          <boxGeometry args={[0.2, 0.06, 0.34]} />
          <meshStandardMaterial color={GLOOP_SNEAKER_WHITE} roughness={0.25} />
        </mesh>
        {/* White Toe Cap */}
        <mesh position={[0, -0.13, 0.21]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={GLOOP_SNEAKER_WHITE} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};
