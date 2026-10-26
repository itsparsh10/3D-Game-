import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { WORLDS } from '../../config/worlds';
import { useGameStore } from '../../store/gameStore';

export const Track: React.FC = () => {
  const worldId = useGameStore((state) => state.activeEpisode.world);
  const targetOrbs = useGameStore((state) => state.activeEpisode.targetOrbs);
  const finishZ = useGameStore((state) => state.levelData.finishZ);
  const theme = WORLDS[worldId] || WORLDS['sky-islands'];

  const trackLength = Math.abs(finishZ) + 60;
  const numSegments = Math.ceil(trackLength / 12);

  // Generate track segments
  const segments = useMemo(() => {
    const list = [];
    for (let i = 0; i < numSegments; i++) {
      list.push({
        id: i,
        z: -i * 12 - 6,
        isEven: i % 2 === 0
      });
    }
    return list;
  }, [numSegments]);

  return (
    <group>
      {/* --- STARTING RUNWAY & OVERHEAD HOOK ARCH --- */}
      <group position={[0, 0, -8]}>
        {/* Overhead Hook Gate Pillars */}
        <mesh position={[-4.2, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 6.4, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[4.2, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 6.4, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Golden Arch Banner */}
        <mesh position={[0, 6.0, 0]}>
          <boxGeometry args={[7.2, 1.4, 0.4]} />
          <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Big Hook Text: "20 ORBS?" */}
        <Text
          position={[0, 6.0, 0.3]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`${targetOrbs} ORBS?`}
        </Text>
      </group>

      {/* --- REPEATING MODULAR TRACK SEGMENTS --- */}
      {segments.map((seg) => (
        <group key={seg.id} position={[0, 0, seg.z]}>
          {/* Main Road Surface */}
          <mesh position={[0, -0.1, 0]} receiveShadow>
            <boxGeometry args={[8.0, 0.2, 12]} />
            <meshStandardMaterial
              color={seg.isEven ? theme.trackColor : '#f1f5f9'}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>

          {/* Left Colored Curb Border */}
          <mesh position={[-4.05, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.3, 12]} />
            <meshStandardMaterial
              color={theme.trackEdgeColor}
              roughness={0.2}
              emissive={theme.trackEdgeColor}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Right Colored Curb Border */}
          <mesh position={[4.05, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.3, 12]} />
            <meshStandardMaterial
              color={theme.trackEdgeColor}
              roughness={0.2}
              emissive={theme.trackEdgeColor}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Lane Divider Dashes (-1.2 and +1.2) */}
          <mesh position={[-1.2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, 6]} />
            <meshBasicMaterial color={theme.laneDividerColor} transparent opacity={0.6} />
          </mesh>
          <mesh position={[1.2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, 6]} />
            <meshBasicMaterial color={theme.laneDividerColor} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}

      {/* --- GRAND GOLDEN FINISH PORTAL --- */}
      <group position={[0, 0, finishZ]}>
        {/* Left Golden Crown Pillar */}
        <mesh position={[-3.8, 3.5, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 7.0, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Right Golden Crown Pillar */}
        <mesh position={[3.8, 3.5, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 7.0, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Grand Golden Arch Crown */}
        <mesh position={[0, 6.8, 0]}>
          <torusGeometry args={[3.8, 0.35, 16, 32, Math.PI]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.15}
            metalness={0.9}
            emissive="#d97706"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Crown Emblem on top */}
        <mesh position={[0, 7.6, 0]} castShadow>
          <octahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.8}
            metalness={0.9}
          />
        </mesh>

        {/* Swirling Translucent Portal Vortex */}
        <mesh position={[0, 3.4, -0.2]}>
          <planeGeometry args={[6.8, 6.8]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
            roughness={0.1}
          />
        </mesh>

        {/* "FINISH" 3D Sign */}
        <Text
          position={[0, 6.2, 0.4]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          FINISH!
        </Text>

        {/* Radiant Portal Light */}
        <pointLight color="#38bdf8" intensity={4} distance={15} decay={2} />
      </group>
    </group>
  );
};
