import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import { GameCamera } from './camera/GameCamera';
import { Gloop } from './characters/Gloop';
import { Glitchmaker } from './characters/Glitchmaker';
import { Pip } from './characters/Pip';
import { BouncePad } from './obstacles/BouncePad';
import { ChoiceGate } from './obstacles/ChoiceGate';
import { SpikeRoller } from './obstacles/SpikeRoller';
import { SwingingHammer } from './obstacles/SwingingHammer';
import { BlueOrb } from './pickups/BlueOrb';
import { useBotController } from './physics/useBotController';
import { Environment } from './worlds/Environment';
import { Track } from './worlds/Track';

// Inner game loop component executing within R3F context
const GameLoop: React.FC = () => {
  const tick = useGameStore((state) => state.tick);

  useFrame((_, delta) => {
    // Clamp delta to avoid massive leaps on frame drops
    const clampedDelta = Math.min(delta, 0.05);
    tick(clampedDelta);
  });

  return null;
};

interface GameSceneProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export const GameScene: React.FC<GameSceneProps> = ({ canvasRef }) => {
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
      if (e.repeat) return;

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          moveLane(-1);
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveLane(1);
          break;
        case 'Space':
        case 'KeyW':
        case 'ArrowUp':
          triggerJump();
          break;
        case 'KeyS':
        case 'ArrowDown':
          triggerSlide();
          break;
        case 'Escape':
          if (status === 'running') {
            pauseRun();
          } else if (status === 'paused') {
            resumeRun();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLane, triggerJump, triggerSlide, status, pauseRun, resumeRun]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]} // Performance optimization for retina/mobile displays
        camera={{ position: [0, 4, 7], fov: 60 }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true, // Crucial for canvas.captureStream() in MediaRecorder!
          powerPreference: 'high-performance'
        }}
      >
        <GameLoop />
        <GameCamera />
        <Environment />
        <Track />

        {/* Characters */}
        <Gloop />
        <Pip />
        <Glitchmaker />

        {/* Obstacles */}
        {levelData.obstacles.map((obs) => {
          if (obs.type === 'swinging-hammer') {
            return (
              <SwingingHammer
                key={obs.id}
                id={obs.id}
                position={obs.position}
                swingSpeed={obs.swingSpeed}
                swingAmplitude={obs.swingAmplitude}
              />
            );
          }
          if (obs.type === 'spike-roller') {
            return (
              <SpikeRoller
                key={obs.id}
                id={obs.id}
                position={obs.position}
                rotationSpeed={obs.rotationSpeed}
              />
            );
          }
          if (obs.type === 'choice-gate') {
            return (
              <ChoiceGate
                key={obs.id}
                id={obs.id}
                position={obs.position}
                choiceData={obs.choiceData}
              />
            );
          }
          if (obs.type === 'bounce-pad') {
            return <BouncePad key={obs.id} id={obs.id} position={obs.position} />;
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
      </Canvas>
    </div>
  );
};
