import type { EpisodeConfig, ObstacleInstance } from "../types/game";
export const STEP = 1 / 60;
export function hammerPose(o: ObstacleInstance, t: number) {
  const angle =
    (Math.sin(t * (o.swingSpeed || 2.2) + o.position[2] * 0.05) * Math.PI) / 3;
  return {
    angle,
    x: o.position[0] + Math.sin(angle) * 3.6,
    y: 4.8 - Math.cos(angle) * 3.6,
  };
}
export function flipped(c: EpisodeConfig, t: number) {
  return t >= 10 && c.twist === "color-gate-choice";
}
export function orbColor(lane: number) {
  return lane === 1 ? "red" : "blue";
}
export function validateEpisode(c: EpisodeConfig) {
  if (![30, 45, 60].includes(c.durationSeconds))
    throw Error("Duration must be 30, 45, or 60 seconds.");
  if (!Number.isInteger(c.seed) || c.seed < 0)
    throw Error("Seed must be a non-negative integer.");
  if (!Number.isInteger(c.targetOrbs) || c.targetOrbs < 1 || c.targetOrbs > 100)
    throw Error("Target must be 1–100 orbs.");
  if (
    !["sky-islands", "candy-world", "ice-world", "lava-world"].includes(c.world)
  )
    throw Error("Unsupported world.");
  if (!["easy", "medium", "hard", "chaos"].includes(c.difficulty))
    throw Error("Unsupported difficulty.");
  return c;
}
export function parseTopic(topic: string, base: EpisodeConfig): EpisodeConfig {
  const s = topic.toLowerCase();
  return validateEpisode({
    ...base,
    id: "custom",
    title: topic.slice(0, 90) || base.title,
    world: s.includes("lava")
      ? "lava-world"
      : s.includes("ice")
        ? "ice-world"
        : s.includes("candy")
          ? "candy-world"
          : "sky-islands",
    targetOrbs: Math.min(
      100,
      Math.max(1, Number(s.match(/(\d+)\s*(?:blue |red )?orbs/)?.[1] || 20)),
    ),
    durationSeconds: Number(s.match(/(30|45|60)\s*(?:seconds|s\b)/)?.[1] || 30),
    twist: s.includes("gravity")
      ? "low-gravity"
      : s.includes("speed")
        ? "speed-rush"
        : "color-gate-choice",
  });
}
export function mechanicalPose(o: ObstacleInstance, t: number) {
  return {
    x:
      o.position[0] +
      (o.type === "sliding-block" ? Math.sin(t * 2 + o.position[2]) * 0.5 : 0),
    y:
      o.type === "closing-door"
        ? 1.2 + Math.max(0, Math.sin(t * 1.8)) * 2.5
        : 1.1,
    rotation: o.type === "rotating-barrier" ? t * 2 : 0,
  };
}
