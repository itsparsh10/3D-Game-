import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

export type Mood = "happy" | "surprised" | "determined" | "scared" | "sad" | "win";

const FACE_CONFIG: Record<
  Mood,
  { eye: number; brow: number; mouth: "smile" | "o" | "flat" | "frown" | "grin" }
> = {
  happy: { eye: 1.0, brow: 0, mouth: "smile" },
  surprised: { eye: 1.25, brow: -0.15, mouth: "o" },
  determined: { eye: 0.85, brow: 0.3, mouth: "flat" },
  scared: { eye: 1.2, brow: -0.25, mouth: "o" },
  sad: { eye: 1.0, brow: -0.2, mouth: "frown" },
  win: { eye: 1.0, brow: 0, mouth: "grin" },
};

function drawFace(m: Mood): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const f = FACE_CONFIG[m];

  // Draw two eyes
  for (const sx of [-1, 1]) {
    const x = 256 + sx * 90;
    const y = 210;
    const r = 62 * f.eye;

    // White sclera
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();

    // Dark pupil
    g.fillStyle = "#0f172a";
    g.beginPath();
    g.arc(x, y + 6, r * 0.55, 0, Math.PI * 2);
    g.fill();

    // Catchlight highlight
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.arc(x + r * 0.2, y - r * 0.15, r * 0.18, 0, Math.PI * 2);
    g.fill();

    // Expressive eyebrows
    g.strokeStyle = "#0b3a52";
    g.lineWidth = 14;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(x - 40, y - r - 18 + sx * f.brow * 42);
    g.lineTo(x + 40, y - r - 18 - sx * f.brow * 42);
    g.stroke();
  }

  // Draw mouth
  g.fillStyle = "#5a0f2a";
  g.strokeStyle = "#5a0f2a";
  g.lineWidth = 12;
  g.lineCap = "round";
  const mx = 256;
  const my = 350;

  if (f.mouth === "o") {
    g.beginPath();
    g.ellipse(mx, my, 34, 44, 0, 0, Math.PI * 2);
    g.fill();
  } else if (f.mouth === "grin") {
    g.beginPath();
    g.arc(mx, my - 20, 72, 0, Math.PI);
    g.fill();
  } else if (f.mouth === "smile") {
    g.beginPath();
    g.arc(mx, my - 20, 52, 0.15, Math.PI - 0.15);
    g.stroke();
  } else if (f.mouth === "frown") {
    g.beginPath();
    g.arc(mx, my + 44, 50, Math.PI + 0.2, -0.2);
    g.stroke();
  } else {
    // flat
    g.beginPath();
    g.moveTo(mx - 42, my);
    g.lineTo(mx + 42, my);
    g.stroke();
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const GLOOP_SNEAKER_ORANGE = "#ff701a";
export const GLOOP_SNEAKER_WHITE = "#fff9ed";

export const Gloop: React.FC = () => {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const limbs = useRef<THREE.Group[]>([]);
  const crownRef = useRef<THREE.Group>(null);

  // Pre-generate face textures for all 6 moods
  const faceTextures = useMemo(() => {
    return (Object.keys(FACE_CONFIG) as Mood[]).reduce(
      (acc, m) => {
        acc[m] = drawFace(m);
        return acc;
      },
      {} as Record<Mood, THREE.CanvasTexture>
    );
  }, []);

  const [currentMood, setCurrentMood] = React.useState<Mood>("determined");

  useFrame(({ clock }, dt) => {
    const s = useGameStore.getState();
    if (!root.current || !body.current) return;

    const t = s.status === "running" ? s.elapsedTime : clock.elapsedTime;
    const run = s.status === "running";

    // 1. Derive Mood from sim events (View-layer only!)
    let nextMood: Mood = "happy";
    if (s.status === "victory") {
      nextMood = "win";
    } else if (s.status === "defeat") {
      nextMood = "sad";
    } else if (s.shakeIntensity > 0.3) {
      nextMood = "scared";
    } else if (s.activeBeat === "twist") {
      nextMood = "surprised";
    } else if (s.activeBeat === "hard-obstacle") {
      nextMood = "determined";
    } else if (s.status === "idle" || s.status === "countdown") {
      nextMood = "determined";
    } else {
      nextMood = s.combo > 2 ? "win" : "happy";
    }
    if (nextMood !== currentMood) {
      setCurrentMood(nextMood);
    }

    // 2. Victory Stack Height lift (Gloop stands crowned on top of the orb chain)
    const targetLiftY = s.status === "victory" ? Math.min(s.orbsCollected, 40) * 0.48 : 0;
    root.current.position.y = THREE.MathUtils.damp(
      root.current.position.y,
      s.playerY + targetLiftY,
      6,
      dt
    );
    root.current.position.x = s.playerX;
    root.current.position.z = s.playerZ;

    // Slight rotation towards camera during run/hook so face is visible
    const targetRotY =
      s.status === "victory"
        ? Math.sin(t * 2) * 0.3
        : s.elapsedTime < 2.5
        ? 0.15
        : 0;
    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      targetRotY,
      6,
      dt
    );

    // 3. Body squash & stretch animation
    const b = body.current;
    const bounce = run ? Math.abs(Math.sin(t * 13)) * 0.12 : Math.sin(t * 3) * 0.04;
    b.position.y = 1.05 + bounce;

    const scaleY = s.isSliding
      ? 0.55
      : s.isJumping
      ? 1.25
      : s.status === "defeat"
      ? 0.75
      : s.status === "victory"
      ? 1.08 + Math.sin(t * 8) * 0.05
      : 1.0;

    const scaleXZ = s.isSliding ? 1.25 : s.isJumping ? 0.88 : 1.0;
    b.scale.set(scaleXZ, scaleY, scaleXZ);

    b.rotation.z = THREE.MathUtils.damp(
      b.rotation.z,
      (s.playerX - s.playerLane * 2.4) * 0.18,
      12,
      dt
    );
    b.rotation.x = s.shakeIntensity * 0.2;

    // 4. Limbs motion
    limbs.current.forEach((l, i) => {
      if (!l) return;
      if (s.status === "victory") {
        l.rotation.x = 0;
        l.rotation.z = i >= 2 ? (i === 2 ? -2.2 : 2.2) : 0; // Raised victory hands!
      } else if (run) {
        l.rotation.x =
          Math.sin(t * 13 + (i % 2) * Math.PI) * (s.isJumping ? 0.2 : 0.7);
        l.rotation.z = 0;
      } else {
        l.rotation.x = 0;
        l.rotation.z = 0;
      }
    });

    // 5. Crown on win
    if (crownRef.current) {
      crownRef.current.visible = s.status === "victory";
      if (s.status === "victory") {
        crownRef.current.rotation.y = t * 2;
      }
    }
  });

  return (
    <group ref={root}>
      {/* Dynamic Drop Shadow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={[0.7, 0.48, 1]}
      >
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial
          color="#082436"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>

      <group ref={body}>
        {/* Main Jelly Torso with Pixar-Toy Glossy PBR Material */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.62, 36, 32]} />
          <meshPhysicalMaterial
            color="#27c3f2"
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.05}
            sheen={1}
            sheenColor="#9fe9ff"
            emissive="#0a5f8f"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Dynamic Front Face Cap with procedural Mood Expression Texture */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry
            args={[
              0.625,
              48,
              32,
              Math.PI / 2 - 0.85,
              1.7,
              Math.PI / 2 - 0.65,
              1.3,
            ]}
          />
          <meshBasicMaterial
            map={faceTextures[currentMood]}
            transparent
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>

        {/* Arms */}
        {[-1, 1].map((side, i) => (
          <group
            key={`arm-${side}`}
            ref={(el) => {
              if (el) limbs.current[i + 2] = el;
            }}
            position={[side * 0.62, 0.05, 0]}
            rotation={[0, 0, side * 0.25]}
          >
            <mesh castShadow>
              <capsuleGeometry args={[0.08, 0.26, 12, 12]} />
              <meshPhysicalMaterial
                color="#27c3f2"
                roughness={0.15}
                clearcoat={1}
                emissive="#0a5f8f"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        ))}

        {/* Victory Golden Crown */}
        <group ref={crownRef} position={[0, 0.72, 0]} visible={false}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.2, 0.18, 5]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.6}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </group>

      {/* Legs & Orange-and-White Sneakers */}
      {[-1, 1].map((side, i) => (
        <group
          key={`leg-${side}`}
          position={[side * 0.26, 0.36, 0]}
          ref={(el) => {
            if (el) limbs.current[i] = el;
          }}
        >
          {/* Leg stalk */}
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.22, 12]} />
            <meshPhysicalMaterial color="#27c3f2" roughness={0.15} clearcoat={1} />
          </mesh>

          {/* Orange Sneaker Body */}
          <RoundedBox
            args={[0.36, 0.22, 0.58]}
            radius={0.09}
            position={[0, -0.16, 0.08]}
            castShadow
          >
            <meshStandardMaterial
              color={GLOOP_SNEAKER_ORANGE}
              roughness={0.25}
            />
          </RoundedBox>

          {/* White Sole */}
          <RoundedBox
            args={[0.39, 0.08, 0.62]}
            radius={0.03}
            position={[0, -0.27, 0.08]}
            receiveShadow
          >
            <meshStandardMaterial color={GLOOP_SNEAKER_WHITE} roughness={0.2} />
          </RoundedBox>

          {/* Laces */}
          {[0, 1, 2].map((n) => (
            <RoundedBox
              key={n}
              args={[0.22, 0.03, 0.04]}
              radius={0.01}
              position={[0, -0.045, 0.08 + n * 0.07]}
            >
              <meshStandardMaterial color="white" />
            </RoundedBox>
          ))}
        </group>
      ))}
    </group>
  );
};
