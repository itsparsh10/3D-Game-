import { EpisodeConfig, ObstacleInstance, OrbPickup } from '../types/game';
import { SeededRNG } from './rng';

export interface GeneratedLevel {
  trackLength: number;
  finishZ: number;
  orbs: OrbPickup[];
  obstacles: ObstacleInstance[];
  beatCheckpoints: {
    hookZ: number;
    collectZ: number;
    twistZ: number;
    hardZ: number;
    finalZ: number;
    resultZ: number;
  };
}

export const RUN_SPEED = 18; // units per second
export const LANE_WIDTH = 2.4; // X distance between lanes (-2.4, 0, +2.4)

export function generateLevel(config: EpisodeConfig): GeneratedLevel {
  const rng = new SeededRNG(config.seed);
  const totalDuration = config.durationSeconds;
  const finishZ = -(totalDuration - 2) * RUN_SPEED; // Finish line reached at (duration - 2s)
  const trackLength = Math.abs(finishZ) + 50;

  // Calculate beat Z boundaries based on duration proportion
  const p = totalDuration / 30; // scaling factor
  const hookZ = -3 * p * RUN_SPEED;
  const collectZ = -8 * p * RUN_SPEED;
  const twistZ = -14 * p * RUN_SPEED;
  const hardZ = -22 * p * RUN_SPEED;
  const finalZ = -28 * p * RUN_SPEED;
  const resultZ = finishZ;

  const orbs: OrbPickup[] = [];
  const obstacles: ObstacleInstance[] = [];

  let orbIdCounter = 0;
  let obstacleIdCounter = 0;

  // 1. BEAT 1: HOOK (0 to hookZ)
  // Gentle initial run with welcome orb trail in center lane
  for (let z = -12; z >= hookZ; z -= 3.5) {
    orbs.push({
      id: `orb-${orbIdCounter++}`,
      position: [0, 0.9, z],
      lane: 0,
      value: 1,
      collected: false
    });
  }

  // 2. BEAT 2: COLLECT (hookZ to collectZ)
  // Joyful trails switching lanes, plus a bounce pad
  let currentLane: -1 | 0 | 1 = 0;
  for (let z = hookZ - 6; z >= collectZ; z -= 3.0) {
    if (rng.chance(0.25)) {
      const lanes: (-1 | 0 | 1)[] = [-1, 0, 1];
      currentLane = rng.choice(lanes);
    }
    orbs.push({
      id: `orb-${orbIdCounter++}`,
      position: [currentLane * LANE_WIDTH, 0.9, z],
      lane: currentLane,
      value: 1,
      collected: false
    });
  }

  // Add a bounce pad with high arc of orbs
  const bouncePadZ = (hookZ + collectZ) / 2;
  obstacles.push({
    id: `obstacle-${obstacleIdCounter++}`,
    type: 'bounce-pad',
    position: [0, 0.05, bouncePadZ],
    lane: 0,
    active: true
  });
  // Arc of bonus orbs over the bounce pad
  for (let i = 1; i <= 3; i++) {
    orbs.push({
      id: `orb-${orbIdCounter++}`,
      position: [0, 2.5 + i * 0.6, bouncePadZ - i * 3],
      lane: 0,
      value: 1,
      collected: false
    });
  }

  // 3. BEAT 3: TWIST (collectZ to twistZ)
  // Choice gates (+5 Green vs -3 Red) or color gate split
  const gateZ = (collectZ + twistZ) * 0.5;
  obstacles.push({
    id: `obstacle-${obstacleIdCounter++}`,
    type: 'choice-gate',
    position: [0, 0, gateZ],
    lane: 0,
    choiceData: {
      leftType: 'bonus',
      leftValue: 5,
      leftLabel: '+5 ORBS',
      rightType: 'penalty',
      rightValue: -3,
      rightLabel: '-3 ORBS'
    },
    active: true
  });

  // Trails on both lanes after choice gate
  for (let z = gateZ - 6; z >= twistZ; z -= 3.2) {
    orbs.push({
      id: `orb-${orbIdCounter++}`,
      position: [-1 * LANE_WIDTH, 0.9, z],
      lane: -1,
      value: 1,
      collected: false
    });
    orbs.push({
      id: `orb-${orbIdCounter++}`,
      position: [1 * LANE_WIDTH, 0.9, z],
      lane: 1,
      value: 1,
      collected: false
    });
  }

  // 4. BEAT 4: HARD OBSTACLES (twistZ to hardZ)
  // Swinging hammers, spike rollers, moving gaps
  const hardSectionLength = Math.abs(twistZ - hardZ);
  const numHazards = config.difficulty === 'easy' ? 2 : config.difficulty === 'medium' ? 3 : 5;
  const hazardStep = hardSectionLength / (numHazards + 1);

  for (let i = 1; i <= numHazards; i++) {
    const hz = twistZ - i * hazardStep;
    const hazardType = i % 2 === 0 ? 'swinging-hammer' : 'spike-roller';

    obstacles.push({
      id: `obstacle-${obstacleIdCounter++}`,
      type: hazardType,
      position: [0, 0, hz],
      lane: 0,
      swingSpeed: 2.2 + (config.difficulty === 'chaos' ? 1.5 : 0.5),
      swingAmplitude: 3.2,
      rotationSpeed: 3.0,
      active: true
    });

    // Provide safe path orbs
    const safeLane: -1 | 0 | 1 = i % 2 === 0 ? 1 : -1;
    orbs.push({
      id: `orb-${orbIdCounter++}`,
      position: [safeLane * LANE_WIDTH, 0.9, hz - 2],
      lane: safeLane,
      value: 1,
      collected: false
    });
  }

  // Add a second choice gate near end of hard section
  const gate2Z = hardZ + 15;
  obstacles.push({
    id: `obstacle-${obstacleIdCounter++}`,
    type: 'choice-gate',
    position: [0, 0, gate2Z],
    lane: 0,
    choiceData: {
      leftType: 'penalty',
      leftValue: -2,
      leftLabel: '-2 ORBS',
      rightType: 'bonus',
      rightValue: 4,
      rightLabel: '+4 ORBS'
    },
    active: true
  });

  // 5. BEAT 5: FINAL RUN (hardZ to finalZ)
  // High-speed frenzy of orbs leading to finish gate!
  for (let z = hardZ - 5; z >= finalZ; z -= 2.8) {
    const lane = (Math.sin(z * 0.2) > 0 ? 1 : -1) as -1 | 1;
    orbs.push({
      id: `orb-${orbIdCounter++}`,
      position: [lane * LANE_WIDTH, 0.9, z],
      lane: lane,
      value: 1,
      collected: false
    });
  }

  // Final swinging hammer right before portal for dramatic tension
  obstacles.push({
    id: `obstacle-${obstacleIdCounter++}`,
    type: 'swinging-hammer',
    position: [0, 0, finalZ + 12],
    lane: 0,
    swingSpeed: 2.5,
    swingAmplitude: 3.0,
    active: true
  });

  // Crown orb cluster right before the gate
  for (let i = 0; i < 3; i++) {
    const lane = (i - 1) as -1 | 0 | 1;
    orbs.push({
      id: `orb-${orbIdCounter++}`,
      position: [lane * LANE_WIDTH, 1.2, finishZ + 6],
      lane,
      value: 2,
      collected: false
    });
  }

  return {
    trackLength,
    finishZ,
    orbs,
    obstacles,
    beatCheckpoints: {
      hookZ,
      collectZ,
      twistZ,
      hardZ,
      finalZ,
      resultZ
    }
  };
}
