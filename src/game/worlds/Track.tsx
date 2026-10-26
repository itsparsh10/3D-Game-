import React, { useMemo } from "react";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { WORLDS } from "../../config/worlds";
import { useGameStore } from "../../store/gameStore";

function useCheckerTexture(a = "#ffffff", b = "#cfe3f7") {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = a;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = b;
    g.fillRect(0, 0, 64, 64);
    g.fillRect(64, 64, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [a, b]);
}

function useStripeTexture(a = "#0284c7", b = "#ffffff") {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = a;
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = b;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(32, 0);
    g.lineTo(64, 32);
    g.lineTo(64, 64);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(0, 32);
    g.lineTo(0, 64);
    g.lineTo(32, 64);
    g.closePath();
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [a, b]);
}

export const Track: React.FC = () => {
  const worldId = useGameStore((state) => state.activeEpisode.world);
  const targetOrbs = useGameStore((state) => state.activeEpisode.targetOrbs);
  const finishZ = useGameStore((state) => state.levelData.finishZ);
  const playerZ = useGameStore((state) => state.playerZ);

  const theme = WORLDS[worldId] || WORLDS["sky-islands"];

  const checkerTex = useCheckerTexture(theme.checkerA, theme.checkerB);
  checkerTex.repeat.set(7.6 / 1.6, 12 / 1.6); // 1.6-unit tiles

  const stripeTex = useStripeTexture(theme.railA, theme.railB);
  stripeTex.repeat.set(1, 6);

  const trackLength = Math.abs(finishZ) + 60;
  const numSegments = Math.ceil(trackLength / 12);

  const segments = useMemo(() => {
    const list = [];
    for (let i = 0; i < numSegments; i++) {
      list.push({
        id: i,
        z: -i * 12 - 6,
      });
    }
    return list;
  }, [numSegments]);

  return (
    <group>
      {/* --- STARTING RUNWAY HOOK OVERHEAD ARCH --- */}
      <group position={[0, 0, -8]}>
        <mesh position={[-4.2, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 6.4, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[4.2, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 6.4, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 6.0, 0]}>
          <boxGeometry args={[7.4, 1.4, 0.4]} />
          <meshStandardMaterial
            color="#d97706"
            roughness={0.2}
            metalness={0.8}
            emissive="#b45309"
            emissiveIntensity={0.3}
          />
        </mesh>
        <Text
          position={[0, 6.0, 0.3]}
          fontSize={0.75}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`${targetOrbs} ORBS? ONE RUN.`}
        </Text>
      </group>

      {/* --- REPEATING CHECKERED TRACK SEGMENTS --- */}
      {segments
        .filter((seg) => seg.z < playerZ + 24 && seg.z > playerZ - 160)
        .map((seg) => (
          <group key={seg.id} position={[0, 0, seg.z]}>
            {/* Glossy Checkered Road Surface */}
            <mesh position={[0, -0.05, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[7.8, 12]} />
              <meshPhysicalMaterial
                map={checkerTex}
                roughness={0.35}
                clearcoat={0.6}
                clearcoatRoughness={0.2}
              />
            </mesh>

            {/* Base platform under road */}
            <RoundedBox
              position={[0, -0.38, 0]}
              args={[8.4, 0.6, 12.02]}
              radius={0.16}
              receiveShadow
            >
              <meshStandardMaterial color="#1e293b" roughness={0.4} />
            </RoundedBox>

            {/* Left Striped Curb */}
            <RoundedBox
              position={[-4.05, 0.12, 0]}
              args={[0.36, 0.3, 12]}
              radius={0.06}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial map={stripeTex} roughness={0.3} />
            </RoundedBox>

            {/* Right Striped Curb */}
            <RoundedBox
              position={[4.05, 0.12, 0]}
              args={[0.36, 0.3, 12]}
              radius={0.06}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial map={stripeTex} roughness={0.3} />
            </RoundedBox>

            {/* Gold Lamp Posts every 2 segments */}
            {seg.id % 2 === 0 && (
              <>
                {[-4.1, 4.1].map((xSide) => (
                  <group key={xSide} position={[xSide, 0.8, 0]}>
                    <mesh castShadow>
                      <cylinderGeometry args={[0.07, 0.1, 1.4, 12]} />
                      <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 0.75, 0]}>
                      <sphereGeometry args={[0.18, 16, 16]} />
                      <meshStandardMaterial
                        color="#fef08a"
                        emissive="#facc15"
                        emissiveIntensity={0.8}
                      />
                    </mesh>
                  </group>
                ))}
              </>
            )}

            {/* Lane Divider Dashes */}
            {[-1.3, 1.3].map((x) => (
              <mesh key={x} position={[x, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.08, 6]} />
                <meshBasicMaterial
                  color={theme.laneDividerColor}
                  transparent
                  opacity={0.65}
                />
              </mesh>
            ))}
          </group>
        ))}

      {/* --- GRAND GOLDEN FINISH PORTAL --- */}
      <group position={[0, 0, finishZ]}>
        {/* Left Golden Crown Pillar */}
        <mesh position={[-3.8, 3.5, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 7.0, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.2}
            metalness={0.8}
            emissive="#d97706"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Right Golden Crown Pillar */}
        <mesh position={[3.8, 3.5, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 7.0, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            roughness={0.2}
            metalness={0.8}
            emissive="#d97706"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Grand Golden Arch Crown */}
        <mesh position={[0, 6.8, 0]}>
          <torusGeometry args={[3.8, 0.35, 16, 32, Math.PI]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.15}
            metalness={0.9}
            emissive="#f59e0b"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Crown Emblem on top */}
        <mesh position={[0, 7.6, 0]} castShadow>
          <octahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.9}
            metalness={0.9}
          />
        </mesh>

        {/* Swirling Translucent Portal Vortex with Bloom Pick */}
        <mesh position={[0, 3.4, -0.2]}>
          <planeGeometry args={[6.8, 6.8]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.7}
            transparent
            opacity={0.65}
            roughness={0.1}
          />
        </mesh>

        {/* "FINAL TEST" 3D Sign */}
        <Text
          position={[0, 6.2, 0.4]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          FINAL TEST!
        </Text>

        {/* Radiant Portal Light */}
        <pointLight color="#38bdf8" intensity={5} distance={18} decay={2} />
      </group>
    </group>
  );
};
