import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useStudioStore } from '../../store/studioStore';
import { LANE_WIDTH } from '../../utils/levelGenerator';

export function useBotController() {
  const botAutoplay = useStudioStore((state) => state.settings.botAutoplay);
  const status = useGameStore((state) => state.status);
  const playerLane = useGameStore((state) => state.playerLane);
  const playerZ = useGameStore((state) => state.playerZ);
  const isJumping = useGameStore((state) => state.isJumping);
  const levelData = useGameStore((state) => state.levelData);
  const moveLane = useGameStore((state) => state.moveLane);
  const triggerJump = useGameStore((state) => state.triggerJump);
  const triggerSlide = useGameStore((state) => state.triggerSlide);

  useEffect(() => {
    if (!botAutoplay || status !== 'running') return;

    const interval = setInterval(() => {
      // 1. Look ahead for spike rollers within jump distance (~8 units)
      const upcomingSpike = levelData.obstacles.find(
        (obs) =>
          obs.type === 'spike-roller' &&
          obs.position[2] < playerZ &&
          obs.position[2] > playerZ - 8.5
      );

      if (upcomingSpike && !isJumping) {
        triggerJump();
        return;
      }

      // 2. Look ahead for choice gates (~16 units)
      const upcomingGate = levelData.obstacles.find(
        (obs) =>
          obs.type === 'choice-gate' &&
          obs.position[2] < playerZ &&
          obs.position[2] > playerZ - 18
      );

      if (upcomingGate && upcomingGate.choiceData) {
        const bestLane = upcomingGate.choiceData.leftValue >= upcomingGate.choiceData.rightValue ? -1 : 1;
        if (playerLane !== bestLane) {
          moveLane(bestLane > playerLane ? 1 : -1);
          return;
        }
      }

      // 3. Look ahead for swinging hammers (~12 units)
      const upcomingHammer = levelData.obstacles.find(
        (obs) =>
          obs.type === 'swinging-hammer' &&
          obs.position[2] < playerZ &&
          obs.position[2] > playerZ - 12
      );

      if (upcomingHammer) {
        // Safe lane is usually sides (e.g. -1 or 1)
        if (playerLane === 0) {
          moveLane(1);
          return;
        }
      }

      // 4. Steer towards nearby uncollected orbs
      const nearbyOrb = levelData.orbs.find(
        (orb) =>
          !orb.collected &&
          orb.position[2] < playerZ &&
          orb.position[2] > playerZ - 14
      );

      if (nearbyOrb) {
        const targetLane = Math.round(nearbyOrb.position[0] / LANE_WIDTH) as -1 | 0 | 1;
        if (targetLane !== playerLane) {
          moveLane(targetLane > playerLane ? 1 : -1);
        }
      }
    }, 120);

    return () => clearInterval(interval);
  }, [
    botAutoplay,
    status,
    playerLane,
    playerZ,
    isJumping,
    levelData,
    moveLane,
    triggerJump,
    triggerSlide
  ]);
}
