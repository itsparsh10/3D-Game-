import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WORLDS } from '../../config/worlds';
import { useGameStore } from '../../store/gameStore';

export const Environment: React.FC = () => {
  const worldId = useGameStore((state) => state.activeEpisode.world);
  const playerZ = useGameStore((state) => state.playerZ);
  const theme = WORLDS[worldId] || WORLDS['sky-islands'];

  const particlesRef = useRef<THREE.Points>(null);

  // Background floating scenery props along the track
  const sceneryProps = useMemo(() => {
    const items = [];
    for (let i = 0; i < 28; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (12 + (i % 5) * 4);
      const y = -2 + (i % 4) * 3;
      const z = -i * 22;
      const scale = 0.8 + (i % 3) * 0.4;
      items.push({ id: i, position: [x, y, z] as [number, number, number], scale });
    }
    return items;
  }, []);

  // Ambient floating particle positions (clouds/sparkles/snow/embers)
  const [particleGeo, particleCount] = useMemo(() => {
    const count = theme.particleCount || 60;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20 - 2;
      positions[i * 3 + 2] = -Math.random() * 400;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return [geo, count];
  }, [theme]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle particle drift
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] += Math.sin(t + i) * 0.01;
      // Keep particles near player in Z
      if (positions[i * 3 + 2] > playerZ + 20) {
        positions[i * 3 + 2] -= 350;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      {/* Background color and atmospheric depth */}
      <color attach="background" args={[theme.skyColor]} />
      <fog attach="fog" args={[theme.fogColor, theme.fogNear, theme.fogFar]} />

      {/* Main Lighting Setup */}
      <ambientLight color={theme.ambientColor} intensity={0.9} />
      <directionalLight
        position={[15, 25, playerZ + 15]}
        intensity={1.4}
        color={theme.sunColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <hemisphereLight
        color={theme.skyColor}
        groundColor={theme.fogColor}
        intensity={0.4}
      />

      {/* Floating Scenery Elements */}
      {sceneryProps.map((prop) => {
        if (theme.propsType === 'islands') {
          return (
            <group key={prop.id} position={prop.position} scale={prop.scale}>
              {/* Floating Island Grass Top */}
              <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[4, 2, 2.5, 8]} />
                <meshStandardMaterial color="#22c55e" roughness={0.6} />
              </mesh>
              {/* Island Rock Base */}
              <mesh position={[0, -2, 0]} castShadow>
                <coneGeometry args={[2, 3, 7]} />
                <meshStandardMaterial color="#78716c" roughness={0.8} />
              </mesh>
              {/* Fantasy Tower */}
              <mesh position={[0.5, 2.2, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.8, 2.5, 8]} />
                <meshStandardMaterial color="#fef08a" roughness={0.3} />
              </mesh>
              <mesh position={[0.5, 3.8, 0]} castShadow>
                <coneGeometry args={[1.0, 1.5, 8]} />
                <meshStandardMaterial color="#0284c7" roughness={0.2} />
              </mesh>
            </group>
          );
        }

        if (theme.propsType === 'candies') {
          return (
            <group key={prop.id} position={prop.position} scale={prop.scale}>
              {/* Giant Gumdrop */}
              <mesh position={[0, 1.2, 0]} castShadow>
                <sphereGeometry args={[2.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.1} />
              </mesh>
              {/* Lollipop Stick */}
              <mesh position={[0, -1, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 4, 12]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        }

        if (theme.propsType === 'crystals') {
          return (
            <group key={prop.id} position={prop.position} scale={prop.scale}>
              {/* Sapphire Ice Crystal Spire */}
              <mesh position={[0, 3, 0]} rotation={[0, prop.id, 0.15]} castShadow>
                <coneGeometry args={[1.4, 7, 6]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#0284c7"
                  emissiveIntensity={0.3}
                  roughness={0.1}
                  metalness={0.6}
                />
              </mesh>
            </group>
          );
        }

        // Lava World: Volcanic basalts and lava glow
        return (
          <group key={prop.id} position={prop.position} scale={prop.scale}>
            {/* Basalt Rock Column */}
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[1.8, 2.5, 6, 6]} />
              <meshStandardMaterial color="#1c1917" roughness={0.9} />
            </mesh>
            {/* Fiery Magma Core */}
            <mesh position={[0, 4.2, 0]}>
              <sphereGeometry args={[0.8, 12, 12]} />
              <meshStandardMaterial color="#ea580c" emissive="#f97316" emissiveIntensity={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Ambient Floating Particles */}
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          size={0.35}
          color={theme.particleColor}
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>
    </>
  );
};
