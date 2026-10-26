import { useGameStore } from "../../store/gameStore";
import { useStudioStore } from "../../store/studioStore";
import { flipped, hammerPose } from "../../utils/rules";
export function botStep() {
  const s = useGameStore.getState();
  if (!useStudioStore.getState().settings.botAutoplay || s.status !== "running")
    return;
  const nearby = s.levelData.obstacles.filter(
    (o) =>
      !o.cleared && o.position[2] < s.playerZ && o.position[2] > s.playerZ - 18,
  );
  let lane = s.playerLane;
  const gate = nearby.find((o) => o.type === "choice-gate");
  const hammer = nearby.find((o) => o.type === "swinging-hammer");
  const roller = nearby.find((o) => o.type === "spike-roller");
  if (roller && s.playerZ - roller.position[2] < 8 && !s.isJumping)
    s.triggerJump();
  if (
    nearby.some((o) =>
      ["rotating-barrier", "closing-door", "sliding-block"].includes(o.type),
    )
  )
    lane = 1;
  else if (gate)
    lane = gate.choiceData!.leftValue > gate.choiceData!.rightValue ? -1 : 1;
  else if (hammer) {
    const h = hammerPose(
      hammer,
      s.elapsedTime + (s.playerZ - hammer.position[2]) / 18,
    );
    lane = h.x > 0 ? -1 : 1;
  } else {
    const orb = s.levelData.orbs.find(
      (o) =>
        !o.collected &&
        o.position[2] < s.playerZ &&
        o.position[2] > s.playerZ - 18 &&
        (o.value >= 2 ||
          (o.lane === 1) === flipped(s.activeEpisode, s.elapsedTime)),
    );
    if (orb) lane = orb.lane;
  }
  if (lane !== s.playerLane) s.moveLane(lane > s.playerLane ? 1 : -1);
}
export function useBotController() {} // Controller runs on the shared fixed simulation step.
