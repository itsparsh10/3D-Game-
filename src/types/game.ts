export type WorldId = 'sky-islands' | 'candy-world' | 'ice-world' | 'lava-world';

export type EpisodeDifficulty = 'easy' | 'medium' | 'hard' | 'chaos';

export type EpisodeTwist =
  | 'color-gate-choice'
  | 'glitchmaker-attack'
  | 'speed-rush'
  | 'low-gravity'
  | 'disappearing-path';

export type EpisodeBeat =
  | 'hook'          // 0-3s
  | 'collect'       // 3-8s
  | 'twist'         // 8-14s
  | 'hard-obstacle' // 14-22s
  | 'final-run'     // 22-28s
  | 'result';       // 28-30s

export type GameStatus =
  | 'idle'
  | 'countdown'
  | 'running'
  | 'paused'
  | 'victory'
  | 'defeat';

export type ObstacleType =
  | 'swinging-hammer'
  | 'spike-roller'
  | 'choice-gate'
  | 'bounce-pad'
  | 'moving-gap';

export interface ChoiceGateData {
  leftType: 'bonus' | 'penalty' | 'blue' | 'red';
  leftValue: number; // e.g. +5
  leftLabel: string;
  rightType: 'bonus' | 'penalty' | 'blue' | 'red';
  rightValue: number; // e.g. -3
  rightLabel: string;
}

export interface ObstacleInstance {
  id: string;
  type: ObstacleType;
  position: [number, number, number]; // [x, y, z]
  lane: -1 | 0 | 1; // Left, Center, Right or spanning
  width?: number;
  rotationSpeed?: number;
  swingSpeed?: number;
  swingAmplitude?: number;
  choiceData?: ChoiceGateData;
  active: boolean;
  cleared?: boolean;
}

export interface OrbPickup {
  id: string;
  position: [number, number, number];
  lane: -1 | 0 | 1;
  value: number;
  collected: boolean;
}

export interface EpisodeConfig {
  id: string;
  title: string;
  subtitle: string;
  world: WorldId;
  durationSeconds: number; // 30, 45, 60
  targetOrbs: number; // e.g. 20
  difficulty: EpisodeDifficulty;
  seed: number;
  twist: EpisodeTwist;
  allowedHits: number; // 1 hit ends run, or multi-life
  mechanics: string[];
}

export interface WorldThemeConfig {
  id: WorldId;
  name: string;
  description: string;
  skyColor: string;
  skyGradientTop: string;
  skyGradientBottom: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  sunColor: string;
  ambientColor: string;
  trackColor: string;
  trackEdgeColor: string;
  laneDividerColor: string;
  accentColor: string;
  particleColor: string;
  particleCount: number;
  propsType: 'islands' | 'candies' | 'crystals' | 'volcanoes';
}

export interface CharacterAnimationState {
  current: 'idle' | 'run' | 'jump' | 'slide' | 'hit' | 'victory' | 'defeat';
  lane: -1 | 0 | 1;
  laneTargetX: number;
  x: number;
  y: number;
  z: number;
  isGrounded: boolean;
  jumpVelocity: number;
  squashStretch: number; // scaleY
  tiltZ: number;
}
