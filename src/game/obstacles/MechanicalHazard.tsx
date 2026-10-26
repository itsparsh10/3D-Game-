import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import type { ObstacleInstance } from "../../types/game";
import { useGameStore } from "../../store/gameStore";
import { mechanicalPose } from "../../utils/rules";
export function MechanicalHazard({
  obstacle: o,
}: {
  obstacle: ObstacleInstance;
}) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const p = mechanicalPose(o, useGameStore.getState().elapsedTime);
    ref.current.position.set(p.x, p.y, o.position[2]);
    ref.current.rotation.z = p.rotation;
  });
  return (
    <group>
      <group ref={ref}>
        <RoundedBox
          args={[
            o.type === "rotating-barrier" ? 2.6 : 1.65,
            o.type === "rotating-barrier" ? 0.45 : 2,
            1,
          ]}
          radius={0.2}
          castShadow
        >
          <meshPhysicalMaterial
            color={o.type === "closing-door" ? "#a654e8" : "#ff575d"}
            roughness={0.25}
            clearcoat={1}
          />
        </RoundedBox>
        <RoundedBox
          args={[0.3, o.type === "rotating-barrier" ? 0.48 : 2.03, 1.03]}
          radius={0.05}
        >
          <meshStandardMaterial color="#fff1bd" />
        </RoundedBox>
      </group>
      <mesh
        position={[o.position[0], 0.03, o.position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2.3, 3]} />
        <meshStandardMaterial color="#ffc445" />
      </mesh>
    </group>
  );
}
