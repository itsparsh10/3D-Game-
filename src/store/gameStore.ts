import { useStudioStore } from "./studioStore";
import {
  hammerPose,
  mechanicalPose,
  flipped,
  validateEpisode,
} from "../utils/rules";
import { create } from "zustand";
import { DEFAULT_EPISODE } from "../config/episodes";
import { SoundManager } from "../game/audio/SoundManager";
import { EpisodeBeat, EpisodeConfig, GameStatus } from "../types/game";
import {
  GeneratedLevel,
  generateLevel,
  LANE_WIDTH,
  RUN_SPEED,
} from "../utils/levelGenerator";

interface GameState {
  events: { time: number; type: string; value: number }[];
  slideUntil: number;
  countdownUntil: number;
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
  events: [],
  slideUntil: 0,
  countdownUntil: 0,
  status: "idle",
  countdown: 3,
  activeEpisode: DEFAULT_EPISODE,
  score: 0,
  orbsCollected: 0,
  combo: 0,
  hitsTaken: 0,
  elapsedTime: 0,
  activeBeat: "hook",
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
    validateEpisode(episode);
    SoundManager.stopBGM();
    const levelData = generateLevel(episode);
    set({
      activeEpisode: episode,
      levelData,
      events: [],
      slideUntil: 0,
      countdownUntil: 0,
      status: "idle",
      score: 0,
      orbsCollected: 0,
      combo: 0,
      hitsTaken: 0,
      elapsedTime: 0,
      activeBeat: "hook",
      playerLane: 0,
      playerX: 0,
      playerY: 0,
      playerZ: 0,
      isJumping: false,
      isSliding: false,
      jumpVelocity: 0,
      shakeIntensity: 0,
    });
  },

  startCountdown: () => {
    SoundManager.resume();
    set({ status: "countdown", countdown: 3 });
    set({ countdownUntil: 2.4 });
  },

  startRun: () => {
    SoundManager.resume();
    SoundManager.startBGM();
    set({
      levelData: generateLevel(get().activeEpisode),
      events: [],
      slideUntil: 0,
      jumpVelocity: 0,
      status: "running",
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
      activeBeat: "hook",
    });
  },

  pauseRun: () => {
    SoundManager.stopBGM();
    set({ status: "paused" });
  },

  resumeRun: () => {
    SoundManager.startBGM();
    set({ status: "running" });
  },

  resetRun: () => {
    SoundManager.stopBGM();
    const { activeEpisode } = get();
    const levelData = generateLevel(activeEpisode);
    set({
      events: [],
      slideUntil: 0,
      countdownUntil: 0,
      status: "idle",
      levelData,
      score: 0,
      orbsCollected: 0,
      combo: 0,
      hitsTaken: 0,
      elapsedTime: 0,
      activeBeat: "hook",
      playerLane: 0,
      playerX: 0,
      playerY: 0,
      playerZ: 0,
      isJumping: false,
      isSliding: false,
      jumpVelocity: 0,
      shakeIntensity: 0,
    });
  },

  moveLane: (direction) => {
    const { status, playerLane } = get();
    if (status !== "running") return;
    const nextLane = Math.max(-1, Math.min(1, playerLane + direction)) as
      -1 | 0 | 1;
    if (nextLane !== playerLane) {
      SoundManager.playLaneSwitch();
      set({
        playerLane: nextLane,
        events: [
          ...get().events,
          { time: get().elapsedTime, type: "lane", value: direction },
        ],
      });
    }
  },

  triggerJump: (force = 13.5) => {
    const { status, isJumping } = get();
    if (status !== "running" || isJumping) return;
    SoundManager.playJump();
    set({
      isJumping: true,
      jumpVelocity: force,
      events: [
        ...get().events,
        { time: get().elapsedTime, type: "jump", value: force },
      ],
    });
  },

  triggerSlide: () => {
    const { status, isSliding } = get();
    if (status !== "running" || isSliding) return;
    SoundManager.playLand();
    set({
      isSliding: true,
      slideUntil: get().elapsedTime + 0.6,
      events: [
        ...get().events,
        { time: get().elapsedTime, type: "slide", value: 0 },
      ],
    });
  },

  collectOrb: (orbId, value) => {
    const { levelData, orbsCollected, score, combo } = get();
    const orb = levelData.orbs.find((o) => o.id === orbId);
    if (get().status !== "running" || !orb || orb.collected) return;
    orb.collected = true;

    const safe =
      orb.value >= 2 ||
      (orb.lane === 1) === flipped(get().activeEpisode, get().elapsedTime);
    value = safe ? value : -1;
    const nextOrbs = Math.max(0, orbsCollected + value);
    const nextCombo = combo + 1;
    const nextScore = Math.max(
      0,
      score + value * 100 + (value > 0 ? nextCombo * 10 : 0),
    );

    SoundManager.playOrbPickup(nextCombo);
    set({
      events: [
        ...get().events,
        {
          time: get().elapsedTime,
          type: value > 0 ? "collect" : "penalty",
          value,
        },
      ],
      orbsCollected: nextOrbs,
      score: nextScore,
      combo: nextCombo,
    });
  },

  hitObstacle: (_obstacleId) => {
    const { status, hitsTaken, activeEpisode, triggerDefeat } = get();
    if (status !== "running") return;

    SoundManager.playHit();
    const nextHits = hitsTaken + 1;
    set({ hitsTaken: nextHits, shakeIntensity: 1.0, combo: 0 });

    if (nextHits > activeEpisode.allowedHits) {
      triggerDefeat("Collision with Hazard!");
    }
  },

  passGate: (value, _label) => {
    const { orbsCollected, score, status } = get();
    if (status !== "running") return;
    if (value >= 0) {
      SoundManager.playGateBonus();
    } else {
      SoundManager.playGatePenalty();
    }
    const nextOrbs = Math.max(0, orbsCollected + value);
    set({
      orbsCollected: nextOrbs,
      events: [
        ...get().events,
        { time: get().elapsedTime, type: "gate", value },
      ],
      score: Math.max(0, score + value * 100),
    });
  },

  triggerVictory: () => {
    SoundManager.stopBGM();
    SoundManager.playVictory();
    set({
      status: "victory",
      activeBeat: "result",
      events: [
        ...get().events,
        {
          time: get().elapsedTime,
          type: "victory",
          value: get().orbsCollected,
        },
      ],
    });
  },

  triggerDefeat: (_reason) => {
    SoundManager.stopBGM();
    SoundManager.playDefeat();
    set({
      status: "defeat",
      activeBeat: "result",
      events: [
        ...get().events,
        { time: get().elapsedTime, type: "defeat", value: get().orbsCollected },
      ],
    });
  },

  tick: (delta) => {
    if (!Number.isFinite(delta) || delta <= 0) return;
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
      triggerDefeat,
    } = get();

    if (status === "countdown") {
      const left = get().countdownUntil - delta;
      set({
        countdownUntil: left,
        countdown: Math.max(1, Math.ceil(left / 0.8)),
      });
      if (left <= 0) get().startRun();
      return;
    }
    if (status !== "running") return;

    const nextElapsed = elapsedTime + delta;

    // Advance forward
    const nextZ =
      playerZ -
      RUN_SPEED *
        delta *
        (activeEpisode.twist === "speed-rush" && elapsedTime >= 10 ? 1.18 : 1);

    // Smooth horizontal lane interpolation
    const targetX = playerLane * LANE_WIDTH;
    const nextX = playerX + (targetX - playerX) * Math.min(1, delta * 14);

    // Jump physics
    let nextY = playerY;
    let nextVel = jumpVelocity;
    let nextJumping = isJumping;

    if (isJumping) {
      nextVel -=
        (activeEpisode.twist === "low-gravity" && elapsedTime >= 10 ? 20 : 32) *
        delta; // Gravity
      nextY += nextVel * delta;
      if (nextY <= 0) {
        nextY = 0;
        nextVel = 0;
        nextJumping = false;
        SoundManager.playLand();
      }
    }

    const phase = (nextElapsed * 30) / activeEpisode.durationSeconds;
    const beat: EpisodeBeat =
      phase < 2
        ? "hook"
        : phase < 6
          ? "collect"
          : phase < 10
            ? "groove"
            : phase < 14
              ? "twist"
              : phase < 17
                ? "hard-obstacle"
                : phase < 19
                  ? "reaction"
                  : "final-run";
    // Decay camera shake
    const nextShake = Math.max(0, shakeIntensity - delta * 2.5);

    // Check finish line
    if (nextZ <= levelData.finishZ) {
      if (orbsCollected >= activeEpisode.targetOrbs) {
        triggerVictory();
      } else {
        triggerDefeat(
          `Needed ${activeEpisode.targetOrbs} Orbs, got ${orbsCollected}!`,
        );
      }
      return;
    }

    // Check time limit
    if (nextElapsed >= activeEpisode.durationSeconds) {
      if (orbsCollected >= activeEpisode.targetOrbs) {
        triggerVictory();
      } else {
        triggerDefeat("Time Expired!");
      }
      return;
    }

    set({
      isSliding: nextElapsed < get().slideUntil,
      elapsedTime: nextElapsed,
      playerZ: nextZ,
      playerX: nextX,
      playerY: nextY,
      isJumping: nextJumping,
      jumpVelocity: nextVel,
      activeBeat: beat,
      shakeIntensity: nextShake,
    });
    for (const orb of levelData.orbs) {
      if (
        !orb.collected &&
        Math.abs(nextZ - orb.position[2]) < 1.2 &&
        Math.abs(nextX - orb.position[0]) < 0.95 &&
        Math.abs(nextY + 0.9 - orb.position[1]) < 1
      )
        get().collectOrb(orb.id, orb.value);
    }
    for (const o of levelData.obstacles) {
      if (o.cleared || Math.abs(nextZ - o.position[2]) > 1.1) continue;
      if (o.type === "choice-gate") {
        o.cleared = true;
        const d = o.choiceData!;
        get().passGate(nextX < 0 ? d.leftValue : d.rightValue, "Gate");
      } else if (
        o.type === "bounce-pad" &&
        Math.abs(nextX - o.position[0]) < 1 &&
        !get().isJumping
      ) {
        o.cleared = true;
        get().triggerJump(18);
      } else if (o.type === "spike-roller" && nextY < 0.9) {
        o.cleared = true;
        get().hitObstacle(o.id);
      } else if (
        ["rotating-barrier", "closing-door", "sliding-block"].includes(o.type)
      ) {
        const h = mechanicalPose(o, nextElapsed);
        const reach =
          o.type === "rotating-barrier"
            ? Math.abs(Math.cos(h.rotation)) * 1.3 + 0.3
            : 1.1;
        if (
          Math.abs(nextX - h.x) < reach &&
          Math.abs(nextY + (get().isSliding ? 0.3 : 0.9) - h.y) <
            (o.type === "rotating-barrier" ? 0.5 : 1.2)
        ) {
          o.cleared = true;
          get().hitObstacle(o.id);
        }
      } else if (o.type === "swinging-hammer") {
        const h = hammerPose(o, nextElapsed);
        if (
          Math.abs(nextX - h.x) < 1.25 &&
          Math.abs(nextY + (get().isSliding ? 0.35 : 0.95) - h.y) < 0.85
        ) {
          o.cleared = true;
          get().hitObstacle(o.id);
        }
      }
    }
  },
}));
