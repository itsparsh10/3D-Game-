import React, { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { GameCamera } from "./camera/GameCamera";
import { Gloop } from "./characters/Gloop";
import { Glitchmaker } from "./characters/Glitchmaker";
import { Pip } from "./characters/Pip";
import { BouncePad } from "./obstacles/BouncePad";
import { ChoiceGate } from "./obstacles/ChoiceGate";
import { SpikeRoller } from "./obstacles/SpikeRoller";
import { SwingingHammer } from "./obstacles/SwingingHammer";
import { MechanicalHazard } from "./obstacles/MechanicalHazard";
import { BlueOrb } from "./pickups/BlueOrb";
import { OrbChain } from "./pickups/OrbChain";
import { useBotController, botStep } from "./physics/useBotController";
import { Environment } from "./worlds/Environment";
import { Track } from "./worlds/Track";
import { Effects } from "./Effects";

// Inner game loop executing at 60Hz fixed physics step
const GameLoop: React.FC = () => {
  const tick = useGameStore((state) => state.tick);
  const accumulated = useRef(0);

  useFrame((_, delta) => {
    accumulated.current += Math.min(delta, 0.25);
    while (accumulated.current >= 1 / 60) {
      botStep();
      tick(1 / 60);
      accumulated.current -= 1 / 60;
    }
  });

  return null;
};

// Directional sun light that tracks Gloop's Z position so shadows never vanish
const PlayerTrackingSun: React.FC = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useFrame(() => {
    const pz = useGameStore.getState().playerZ;
    if (lightRef.current && targetRef.current) {
      lightRef.current.position.set(8, 14, pz + 6);
      targetRef.current.position.set(0, 0, pz - 10);
      targetRef.current.updateMatrixWorld();
    }
  });

  return (
    <>
      <object3D ref={targetRef} position={[0, 0, -10]} />
      <directionalLight
        ref={lightRef}
        castShadow
        position={[8, 14, 6]}
        intensity={2.4}
        color="#fff3dc"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
    </>
  );
};

interface GameSceneProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  lowQuality?: boolean;
}

export const GameScene: React.FC<GameSceneProps> = ({
  canvasRef,
  lowQuality = false,
}) => {
  const levelData = useGameStore((state) => state.levelData);
  const status = useGameStore((state) => state.status);
  const moveLane = useGameStore((state) => state.moveLane);
  const triggerJump = useGameStore((state) => state.triggerJump);
  const triggerSlide = useGameStore((state) => state.triggerSlide);
  const pauseRun = useGameStore((state) => state.pauseRun);
  const resumeRun = useGameStore((state) => state.resumeRun);

  // Activate automated bot logic when enabled
  useBotController();

  // Desktop Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      )
        return;
      if (
        ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          e.code
        )
      )
        e.preventDefault();

      switch (e.code) {
        case "KeyA":
        case "ArrowLeft":
          moveLane(-1);
          break;
        case "KeyD":
        case "ArrowRight":
          moveLane(1);
          break;
        case "Space":
        case "KeyW":
        case "ArrowUp":
          triggerJump();
          break;
        case "KeyS":
        case "ArrowDown":
          triggerSlide();
          break;
        case "Escape":
          if (status === "running") {
            pauseRun();
          } else if (status === "paused") {
            resumeRun();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveLane, triggerJump, triggerSlide, status, pauseRun, resumeRun]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <Canvas
        ref={canvasRef}
        flat
        shadows
        dpr={lowQuality ? 1 : [1, 2]}
        camera={{ position: [0, 4, 7], fov: 52, near: 0.1, far: 400 }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }}
      >
        <GameLoop />
        <GameCamera />

        {/* Dynamic Studio Lighting */}
        <hemisphereLight args={["#cfeaff", "#ffe9c9", 0.6]} />
        <PlayerTrackingSun />

        {/* 3D World Environment & Checkered Track */}
        <Environment />
        <Track />

        {/* Characters & Visual Effects */}
        <Gloop />
        <OrbChain />
        <Effects />
        <Pip />
        <Glitchmaker />

        {/* Obstacles */}
        {levelData.obstacles.map((obs) => {
          if (obs.type === "swinging-hammer") {
            return (
              <SwingingHammer
                key={`${levelData.finishZ}-${levelData.orbs[0]?.id}-${obs.id}`}
                id={obs.id}
                position={obs.position}
                swingSpeed={obs.swingSpeed}
                swingAmplitude={obs.swingAmplitude}
              />
            );
          }
          if (obs.type === "spike-roller") {
            return (
              <SpikeRoller
                key={`${levelData.finishZ}-${levelData.orbs[0]?.id}-${obs.id}`}
                id={obs.id}
                position={obs.position}
                rotationSpeed={obs.rotationSpeed}
              />
            );
          }
          if (obs.type === "choice-gate") {
            return (
              <ChoiceGate
                key={`${levelData.finishZ}-${levelData.orbs[0]?.id}-${obs.id}`}
                id={obs.id}
                position={obs.position}
                choiceData={obs.choiceData}
              />
            );
          }
          if (obs.type === "bounce-pad") {
            return (
              <BouncePad
                key={`${levelData.finishZ}-${levelData.orbs[0]?.id}-${obs.id}`}
                id={obs.id}
                position={obs.position}
              />
            );
          }
          if (
            ["rotating-barrier", "closing-door", "sliding-block"].includes(
              obs.type
            )
          ) {
            return <MechanicalHazard key={obs.id} obstacle={obs} />;
          }
          return null;
        })}

        {/* Collectible Blue Orbs */}
        {levelData.orbs.map((orb) => (
          <BlueOrb
            key={orb.id}
            id={orb.id}
            position={orb.position}
            value={orb.value}
          />
        ))}

        {/* Post-Processing Render Pipeline (Bloom, Vignette, ToneMapping) */}
        {!lowQuality && (
          <EffectComposer multisampling={4}>
            <Bloom intensity={0.45} luminanceThreshold={0.85} mipmapBlur />
            <Vignette darkness={0.25} offset={0.3} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};
