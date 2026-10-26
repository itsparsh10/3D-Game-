import { Environment as Reflections, Lightformer } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";
import { WORLDS } from "../../config/worlds";
function Sphere({
  p,
  s,
  c,
}: {
  p: [number, number, number];
  s: [number, number, number];
  c: string;
}) {
  return (
    <mesh position={p} scale={s} castShadow>
      <sphereGeometry args={[1, 16, 12]} />
      <meshStandardMaterial color={c} roughness={0.65} />
    </mesh>
  );
}
export function Environment() {
  const world = useGameStore((s) => s.activeEpisode.world),
    z = useGameStore((s) => s.playerZ);
  const theme = WORLDS[world];
  const lava = world === "lava-world",
    candy = world === "candy-world",
    ice = world === "ice-world";
  const props = useMemo(
    () =>
      Array.from({ length: 38 }, (_, i) => ({
        x: (i % 2 ? 1 : -1) * (13 + (i % 4) * 5),
        z: 15 - i * 30,
        y: -4 + (i % 3) * 2,
        i,
      })),
    [],
  );
  return (
    <>
      <Reflections resolution={128} frames={1}>
        <Lightformer intensity={3} position={[0, 5, 4]} scale={[8, 3, 1]} />
        <Lightformer
          intensity={2}
          position={[-5, 2, -3]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 6, 1]}
        />
        <Lightformer
          intensity={1}
          position={[5, 4, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[5, 5, 1]}
        />
      </Reflections>
      <color attach="background" args={[theme.skyColor]} />
      <mesh position={[0, 0, z]} scale={400}>
        <sphereGeometry args={[1, 32, 24]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            top: {
              value: new THREE.Color(
                lava ? "#33162e" : candy ? "#8c9bff" : "#158bea",
              ),
            },
            bottom: {
              value: new THREE.Color(
                lava ? "#ef8648" : candy ? "#ffe3ef" : "#b8edff",
              ),
            },
          }}
          vertexShader="varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
          fragmentShader="uniform vec3 top;uniform vec3 bottom;varying vec3 v;void main(){gl_FragColor=vec4(mix(bottom,top,smoothstep(-.2,.65,v.y)),1.);}"
        />
      </mesh>
      <fog
        attach="fog"
        args={[lava ? "#743947" : candy ? "#e8c7ec" : "#b7e6fa", 75, 220]}
      />
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#d7f8ff", "#7977a0", 1.5]} />
      <directionalLight
        position={[15, 30, z + 10]}
        intensity={2.8}
        color="#fff3d6"
      />
      {props
        .filter((p) => p.z < z + 45 && p.z > z - 190)
        .map((p) => (
          <group key={p.i} position={[p.x, p.y, p.z]}>
            <Sphere
              p={[0, -2, 0]}
              s={[5, 3.2, 4]}
              c={lava ? "#463944" : "#bc9e85"}
            />
            <Sphere
              p={[0, 0, 0]}
              s={[5.3, 0.8, 4.3]}
              c={
                lava
                  ? "#ff7e21"
                  : ice
                    ? "#dbfaff"
                    : candy
                      ? "#f6a0d5"
                      : "#8ccf55"
              }
            />
            {[-1, 1].map((s, i) => (
              <group key={s} position={[s * 2, 0, i * 2]}>
                <mesh position={[0, 2, 0]} castShadow>
                  <cylinderGeometry args={[0.7, 1, 4, 20]} />
                  <meshStandardMaterial
                    color={ice ? "#a6e4ff" : candy ? "#ffdf9b" : "#fff1ce"}
                  />
                </mesh>
                {[0.35, 3.4].map((y) => (
                  <mesh key={y} position={[0, y, 0]}>
                    <cylinderGeometry args={[1.04, 1.04, 0.22, 24]} />
                    <meshStandardMaterial color="#f7bd57" />
                  </mesh>
                ))}
                <mesh position={[0, 4.6, 0]}>
                  <coneGeometry args={[1.3, 2, 24]} />
                  <meshStandardMaterial
                    color={lava ? "#ff5c30" : candy ? "#d45fd5" : "#5593eb"}
                    roughness={0.25}
                  />
                </mesh>
                <mesh position={[0, 2.5, 0.81]}>
                  <boxGeometry args={[0.3, 0.8, 0.08]} />
                  <meshStandardMaterial color="#375785" />
                </mesh>
                <mesh position={[0, 6, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
                  <meshStandardMaterial color="#ffc757" />
                </mesh>
                <mesh position={[0.35, 6.2, 0]}>
                  <boxGeometry args={[0.7, 0.35, 0.03]} />
                  <meshStandardMaterial color="#ff9a37" />
                </mesh>
              </group>
            ))}
            {[0, 1, 2].map((i) => (
              <group key={i} position={[-3 + i * 2, 0, 2.5]}>
                <mesh position={[0, 0.8, 0]}>
                  <cylinderGeometry args={[0.12, 0.2, 1.6, 8]} />
                  <meshStandardMaterial color="#ae7956" />
                </mesh>
                <Sphere
                  p={[0, 2, 0]}
                  s={[0.85, 1.1, 0.85]}
                  c={candy ? "#f07bc3" : ice ? "#e7fbff" : "#56b76b"}
                />
                <Sphere
                  p={[0.5, 1.65, 0]}
                  s={[0.7, 0.7, 0.7]}
                  c={candy ? "#dda5ff" : ice ? "#b7eaff" : "#84d45a"}
                />
              </group>
            ))}
            {!lava &&
              [0, 1, 2, 3].map((i) => (
                <Sphere
                  key={i}
                  p={[-3 + i * 2, -5 + (i % 2) * 0.4, 3]}
                  s={[2.7, 1.1, 2]}
                  c="#ffffff"
                />
              ))}
            {candy && (
              <mesh position={[0, 4, -2]}>
                <torusGeometry args={[2, 0.65, 16, 32]} />
                <meshStandardMaterial color="#ff8ec9" roughness={0.22} />
              </mesh>
            )}
            {ice && (
              <mesh position={[0, 2, -2]}>
                <octahedronGeometry args={[3, 0]} />
                <meshPhysicalMaterial
                  color="#5ecbff"
                  metalness={0.3}
                  roughness={0.15}
                />
              </mesh>
            )}
          </group>
        ))}
      {!lava &&
        Array.from({ length: 16 }, (_, i) => (
          <group
            key={i}
            position={[
              (i % 2 ? 1 : -1) * (22 + (i % 3) * 12),
              9 + (i % 4) * 3,
              z - 30 - i * 12,
            ]}
          >
            {[0, 1, 2].map((j) => (
              <Sphere
                key={j}
                p={[j * 3, Math.sin(j) * 1, 0]}
                s={[4, 2.6, 2.5]}
                c="#ffffff"
              />
            ))}
          </group>
        ))}
      {lava && (
        <mesh position={[0, -9, z - 80]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial
            color="#ff6f19"
            emissive="#ff3b09"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </>
  );
}
