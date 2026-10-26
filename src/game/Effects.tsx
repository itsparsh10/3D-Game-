import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
/** Fixed-size particle pool: never allocates meshes during collection. */
export function Effects() {
  const root = useRef<THREE.Group>(null);
  const start = useRef(-100);
  const seen = useRef("");
  useFrame(() => {
    const s = useGameStore.getState();
    const last = s.events.at(-1);
    if (!root.current) return;
    const key = last ? `${last.time}-${last.type}` : "";
    if (
      key !== seen.current &&
      last &&
      ["collect", "victory"].includes(last.type)
    ) {
      seen.current = key;
      start.current = s.elapsedTime;
      root.current.position.set(s.playerX, s.playerY + 1, s.playerZ);
    }
    const age = s.elapsedTime - start.current;
    root.current.visible = age >= 0 && age < 0.55;
    if (!root.current.visible) return;
    root.current.children.forEach((m, i) => {
      const angle = i * 2.399;
      m.position.set(
        Math.cos(angle) * age * 4,
        Math.sin(i * 3) * age * 3 - age * age * 3,
        Math.sin(angle) * age * 4,
      );
      m.scale.setScalar(1 - age / 0.55);
    });
  });
  return (
    <group ref={root}>
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.065, 6, 6]} />
          <meshBasicMaterial color={i % 2 ? "#ffe277" : "#91ffff"} />
        </mesh>
      ))}
    </group>
  );
}
