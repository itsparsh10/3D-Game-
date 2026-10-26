import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";
export const GLOOP_BODY_COLOR = "#00cde5";
export const GLOOP_SNEAKER_ORANGE = "#ff701a";
export const GLOOP_SNEAKER_WHITE = "#fff9ed";
const jelly = new THREE.MeshPhysicalMaterial({
  color: GLOOP_BODY_COLOR,
  roughness: 0.19,
  metalness: 0.08,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
});
function Ball({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  color,
}: {
  position?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={[1, 32, 24]} />
      {color ? (
        <meshStandardMaterial color={color} roughness={0.25} />
      ) : (
        <primitive object={jelly} attach="material" />
      )}
    </mesh>
  );
}
export function Gloop() {
  const root = useRef<THREE.Group>(null),
    body = useRef<THREE.Group>(null),
    limbs = useRef<THREE.Group[]>([]);
  useFrame(({ clock }, dt) => {
    const s = useGameStore.getState();
    if (!root.current || !body.current) return;
    const t = s.status === "running" ? s.elapsedTime : clock.elapsedTime;
    const run = s.status === "running";
    root.current.position.set(s.playerX, s.playerY, s.playerZ);
    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      run ? Math.PI : 0,
      8,
      dt,
    );
    const b = body.current;
    b.position.y =
      1.18 + (run ? Math.abs(Math.sin(t * 13)) * 0.1 : Math.sin(t * 3) * 0.04);
    b.scale.set(
      1,
      s.isSliding
        ? 0.58
        : s.isJumping
          ? 1.12
          : s.status === "defeat"
            ? 0.75
            : 1,
      1,
    );
    b.rotation.z = THREE.MathUtils.damp(
      b.rotation.z,
      (s.playerX - s.playerLane * 2.4) * 0.16,
      12,
      dt,
    );
    b.rotation.x = s.shakeIntensity * 0.2;
    limbs.current.forEach((l, i) => {
      if (!l) return;
      l.rotation.x = run
        ? Math.sin(t * 13 + (i % 2) * Math.PI) * (s.isJumping ? 0.15 : 0.65)
        : 0;
      l.rotation.z = s.status === "victory" && i > 1 ? (i === 2 ? -2 : 2) : 0;
    });
  });
  return (
    <group ref={root}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={[0.7, 0.48, 1]}
      >
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial
          color="#12466c"
          transparent
          opacity={0.17}
          depthWrite={false}
        />
      </mesh>
      <group ref={body}>
        <Ball scale={[0.69, 0.79, 0.55]} />
        <Ball
          position={[-0.2, 0.53, -0.39]}
          scale={[0.16, 0.08, 0.035]}
          color="#8cf1fa"
        />
        <Ball position={[0, -0.48, 0]} scale={[0.48, 0.45, 0.4]} />
        {[-1, 1].map((side, i) => (
          <group key={side}>
            <Ball
              position={[side * 0.29, 0.19, 0.47]}
              scale={[0.24, 0.3, 0.12]}
              color="#ffffff"
            />
            <Ball
              position={[side * 0.27, 0.17, 0.57]}
              scale={[0.125, 0.18, 0.06]}
              color="#082436"
            />
            <Ball
              position={[side * 0.27 - 0.035, 0.24, 0.62]}
              scale={[0.043, 0.055, 0.022]}
              color="#ffffff"
            />
            <mesh
              position={[side * 0.3, 0.56, 0.46]}
              rotation={[0, 0, side * -0.2]}
            >
              <capsuleGeometry args={[0.035, 0.18, 6, 12]} />
              <meshStandardMaterial color="#075069" />
            </mesh>
            <Ball
              position={[side * 0.47, -0.08, 0.42]}
              scale={[0.095, 0.045, 0.025]}
              color="#b6a6f9"
            />
            <group
              ref={(el) => {
                if (el) limbs.current[i + 2] = el;
              }}
              position={[side * 0.61, -0.23, 0]}
              rotation={[0, 0, side * 0.35]}
            >
              <Ball
                position={[side * 0.08, -0.12, 0]}
                scale={[0.16, 0.3, 0.17]}
              />
              <Ball
                position={[side * 0.13, -0.32, 0.02]}
                scale={[0.21, 0.18, 0.2]}
              />
              {[0, 1, 2].map((f) => (
                <Ball
                  key={f}
                  position={[side * (0.08 + f * 0.075), -0.4, 0.1]}
                  scale={[0.055, 0.1, 0.07]}
                />
              ))}
            </group>
          </group>
        ))}
        <Ball
          position={[0, -0.18, 0.525]}
          scale={[0.22, 0.19, 0.035]}
          color="#062739"
        />
        <Ball
          position={[0.025, -0.28, 0.56]}
          scale={[0.12, 0.065, 0.014]}
          color="#ff6396"
        />
      </group>
      {[-1, 1].map((side, i) => (
        <group
          key={side}
          position={[side * 0.28, 0.38, 0]}
          ref={(el) => {
            if (el) limbs.current[i] = el;
          }}
        >
          <Ball scale={[0.14, 0.27, 0.15]} />
          <RoundedBox
            args={[0.38, 0.25, 0.65]}
            radius={0.11}
            position={[0, -0.18, 0.12]}
            castShadow
          >
            <meshStandardMaterial
              color={GLOOP_SNEAKER_ORANGE}
              roughness={0.25}
            />
          </RoundedBox>
          <RoundedBox
            args={[0.41, 0.09, 0.69]}
            radius={0.04}
            position={[0, -0.3, 0.12]}
          >
            <meshStandardMaterial color="white" />
          </RoundedBox>
          {[0, 1, 2].map((n) => (
            <RoundedBox
              key={n}
              args={[0.25, 0.035, 0.045]}
              radius={0.015}
              position={[0, -0.045, 0.13 + n * 0.075]}
            >
              <meshStandardMaterial color="white" />
            </RoundedBox>
          ))}
        </group>
      ))}
    </group>
  );
}
