import { create } from 'zustand';
import { DEFAULT_EPISODE } from '../config/episodes';
import { SoundManager } from '../game/audio/SoundManager';
import { EpisodeBeat, EpisodeConfig, GameStatus } from '../types/game';
import { GeneratedLevel, generateLevel, LANE_WIDTH, RUN_SPEED } from '../utils/levelGenerator';

interface GameState {
  status: GameStatus;
  countdown: number;
  activeEpisode: EpisodeConfig;
  score: number;
  orbsCollected: number;
  combo: number;
  hitsTaken: number;
  elapsedTime: number;
  activeBeat: EpisodeBeat;
  playerLane: -1 | 0 | 1;
  playerX: number;
  playerY: number;
  playerZ: number;
  isJumping: boolean;
  isSliding: boolean;
  jumpVelocity: number;
  levelData: GeneratedLevel;
  shakeIntensity: number;

  // Actions
  setEpisode: (episode: EpisodeConfig) => void;
  startCountdown: () => void;
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  resetRun: () => void;
  tick: (delta: number) => void;
  moveLane: (direction: -1 | 1) => void;
  triggerJump: (force?: number) => void;
  triggerSlide: () => void;
  collectOrb: (orbId: string, value: number) => void;
  hitObstacle: (obstacleId: string) => void;
  passGate: (value: number, label: string) => void;
  triggerVictory: () => void;
  triggerDefeat: (reason?: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'idle',
  countdown: 3,
  activeEpisode: DEFAULT_EPISODE,
  score: 0,
  orbsCollected: 0,
  combo: 0,
  hitsTaken: 0,
  elapsedTime: 0,
  activeBeat: 'hook',
  playerLane: 0,
  playerX: 0,
  playerY: 0,
  playerZ: 0,
  isJumping: false,
  isSliding: false,
  jumpVelocity: 0,
  levelData: generateLevel(DEFAULT_EPISODE),
  shakeIntensity: 0,

  setEpisode: (episode) => {
    const levelData = generateLevel(episode);
    set({
      activeEpisode: episode,
      levelData,
      status: 'idle',
      score: 0,
      orbsCollected: 0,
      combo: 0,
      hitsTaken: 0,
      elapsedTime: 0,
      activeBeat: 'hook',
      playerLane: 0,
      playerX: 0,
      playerY: 0,
      playerZ: 0,
      isJumping: false,
      isSliding: false,
      jumpVelocity: 0,
      shakeIntensity: 0
    });
  },

  startCountdown: () => {
    SoundManager.resume();
    set({ status: 'countdown', countdown: 3 });
    const interval = setInterval(() => {
      const { countdown, startRun } = get();
      if (countdown > 1) {
        set({ countdown: countdown - 1 });
        SoundManager.playClick();
      } else {
        clearInterval(interval);
        startRun();
      }
    }, 800);
  },

  startRun: () => {
    SoundManager.resume();
    SoundManager.startBGM();
    set({
      status: 'running',
      elapsedTime: 0,
      score: 0,
      orbsCollected: 0,
      combo: 0,
      hitsTaken: 0,
      playerLane: 0,
      playerX: 0,
      playerY: 0,
      playerZ: 0,
      isJumping: false,
      isSliding: false,
      activeBeat: 'hook'
    });
  },

  pauseRun: () => {
    SoundManager.stopBGM();
    set({ status: 'paused' });
  },

  resumeRun: () => {
    SoundManager.startBGM();
    set({ status: 'running' });
  },

  resetRun: () => {
    SoundManager.stopBGM();
    const { activeEpisode } = get();
    const levelData = generateLevel(activeEpisode);
    set({
      status: 'idle',
      levelData,
      score: 0,
      orbsCollected: 0,
      combo: 0,
      hitsTaken: 0,
      elapsedTime: 0,
      activeBeat: 'hook',
      playerLane: 0,
      playerX: 0,
      playerY: 0,
      playerZ: 0,
      isJumping: false,
      isSliding: false,
      jumpVelocity: 0,
      shakeIntensity: 0
    });
  },

  moveLane: (direction) => {
    const { status, playerLane } = get();
    if (status !== 'running') return;
    const nextLane = Math.max(-1, Math.min(1, playerLane + direction)) as -1 | 0 | 1;
    if (nextLane !== playerLane) {
      SoundManager.playLaneSwitch();
      set({ playerLane: nextLane });
    }
  },

  triggerJump: (force = 13.5) => {
    const { status, isJumping } = get();
    if (status !== 'running' || isJumping) return;
    SoundManager.playJump();
    set({ isJumping: true, jumpVelocity: force });
  },

  triggerSlide: () => {
    const { status, isSliding } = get();
    if (status !== 'running' || isSliding) return;
    SoundManager.playLand();
    set({ isSliding: true });
    setTimeout(() => {
      set({ isSliding: false });
    }, 600);
  },

  collectOrb: (orbId, value) => {
    const { levelData, orbsCollected, score, combo } = get();
    const orb = levelData.orbs.find((o) => o.id === orbId);
    if (!orb || orb.collected) return;
    orb.collected = true;

    const nextOrbs = orbsCollected + value;
    const nextCombo = combo + 1;
    const nextScore = score + value * 100 + nextCombo * 10;

    SoundManager.playOrbPickup(nextCombo);
    set({
      orbsCollected: nextOrbs,
      score: nextScore,
      combo: nextCombo
    });
  },

  hitObstacle: (_obstacleId) => {
    const { status, hitsTaken, activeEpisode, triggerDefeat } = get();
    if (status !== 'running') return;

    SoundManager.playHit();
    const nextHits = hitsTaken + 1;
    set({ hitsTaken: nextHits, shakeIntensity: 1.0, combo: 0 });

    if (nextHits > activeEpisode.allowedHits) {
      triggerDefeat('Collision with Hazard!');
    }
  },

  passGate: (value, _label) => {
    const { orbsCollected, score } = get();
    if (value >= 0) {
      SoundManager.playGateBonus();
    } else {
      SoundManager.playGatePenalty();
    }
    const nextOrbs = Math.max(0, orbsCollected + value);
    set({
      orbsCollected: nextOrbs,
      score: Math.max(0, score + value * 100)
    });
  },

  triggerVictory: () => {
    SoundManager.stopBGM();
    SoundManager.playVictory();
    set({ status: 'victory', activeBeat: 'result' });
  },

  triggerDefeat: (_reason) => {
    SoundManager.stopBGM();
    SoundManager.playDefeat();
    set({ status: 'defeat', activeBeat: 'result' });
  },

  tick: (delta) => {
    const {
      status,
      elapsedTime,
      playerZ,
      playerX,
      playerY,
      playerLane,
      isJumping,
      jumpVelocity,
      levelData,
      activeEpisode,
      orbsCollected,
      shakeIntensity,
      triggerVictory,
      triggerDefeat
    } = get();

    if (status !== 'running') return;

    const nextElapsed = elapsedTime + delta;

    // Advance forward
    const nextZ = playerZ - RUN_SPEED * delta;

    // Smooth horizontal lane interpolation
    const targetX = playerLane * LANE_WIDTH;
    const nextX = playerX + (targetX - playerX) * Math.min(1, delta * 14);

    // Jump physics
    let nextY = playerY;
    let nextVel = jumpVelocity;
    let nextJumping = isJumping;

    if (isJumping) {
      nextVel -= 32 * delta; // Gravity
      nextY += nextVel * delta;
      if (nextY <= 0) {
        nextY = 0;
        nextVel = 0;
        nextJumping = false;
        SoundManager.playLand();
      }
    }

    // Determine current narrative beat
    const { hookZ, collectZ, twistZ, hardZ, finalZ } = levelData.beatCheckpoints;
    let beat: EpisodeBeat = 'hook';
    if (nextZ <= finalZ) {
      beat = 'final-run';
    } else if (nextZ <= hardZ) {
      beat = 'hard-obstacle';
    } else if (nextZ <= twistZ) {
      beat = 'twist';
    } else if (nextZ <= collectZ) {
      beat = 'collect';
    } else if (nextZ <= hookZ) {
      beat = 'hook';
    }

    // Decay camera shake
    const nextShake = Math.max(0, shakeIntensity - delta * 2.5);

    // Check finish line
    if (nextZ <= levelData.finishZ) {
      if (orbsCollected >= activeEpisode.targetOrbs) {
        triggerVictory();
      } else {
        triggerDefeat(`Needed ${activeEpisode.targetOrbs} Orbs, got ${orbsCollected}!`);
      }
      return;
    }

    // Check time limit
    if (nextElapsed >= activeEpisode.durationSeconds) {
      if (orbsCollected >= activeEpisode.targetOrbs) {
        triggerVictory();
      } else {
        triggerDefeat('Time Expired!');
      }
      return;
    }

    set({
      elapsedTime: nextElapsed,
      playerZ: nextZ,
      playerX: nextX,
      playerY: nextY,
      isJumping: nextJumping,
      jumpVelocity: nextVel,
      activeBeat: beat,
      shakeIntensity: nextShake
    });
  }
}));
