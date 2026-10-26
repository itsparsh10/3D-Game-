import { describe, it, expect, vi } from "vitest";
vi.mock("../src/game/audio/SoundManager", () => ({
  SoundManager: new Proxy({}, { get: () => () => {} }),
}));
import { useGameStore as game } from "../src/store/gameStore";
import { useStudioStore as studio } from "../src/store/studioStore";
import { botStep } from "../src/game/physics/useBotController";
import { EPISODE_PRESETS } from "../src/config/episodes";
import { validateEpisode } from "../src/utils/rules";
function run(duration: number) {
  game
    .getState()
    .setEpisode({ ...EPISODE_PRESETS[0], durationSeconds: duration });
  studio.setState((s) => ({ settings: { ...s.settings, botAutoplay: true } }));
  game.getState().startRun();
  for (
    let n = 0;
    n < duration * 60 && game.getState().status === "running";
    n++
  ) {
    botStep();
    game.getState().tick(1 / 60);
  }
  const s = game.getState();
  return { result: s.status, orbs: s.orbsCollected, events: s.events };
}
describe("Shared fixed-step simulation", () => {
  it.each([30, 45, 60])(
    "automated %i-second challenge reaches a genuine win",
    (duration) => {
      const r = run(duration);
      expect(r.result).toBe("victory");
      expect(r.orbs).toBeGreaterThanOrEqual(20);
    },
  );
  it("seed and controller reproduce identical event logs", () => {
    expect(run(30)).toEqual(run(30));
  });
  it("paused simulation cannot move or score", () => {
    run(30);
    game.getState().startRun();
    game.getState().pauseRun();
    const before = game.getState().playerZ;
    game.getState().tick(1);
    game.getState().collectOrb("orb-0", 1);
    expect(game.getState().playerZ).toBe(before);
    expect(game.getState().orbsCollected).toBe(0);
  });
  it("restarting resets all pickups and hazard state", () => {
    run(30);
    game.getState().startRun();
    expect(game.getState().levelData.orbs.every((o) => !o.collected)).toBe(
      true,
    );
    expect(game.getState().levelData.obstacles.every((o) => !o.cleared)).toBe(
      true,
    );
  });
  it("invalid configurations are rejected", () => {
    expect(() =>
      validateEpisode({ ...EPISODE_PRESETS[0], durationSeconds: 0 }),
    ).toThrow();
  });
  it("rule flip changes blue orbs from reward to penalty", () => {
    game.getState().setEpisode(EPISODE_PRESETS[0]);
    game.getState().startRun();
    game.getState().collectOrb("orb-0", 1);
    expect(game.getState().orbsCollected).toBe(1);
    game.setState({ elapsedTime: 11 });
    game.getState().collectOrb("orb-1", 1);
    expect(game.getState().orbsCollected).toBe(0);
  });
});

import { reproduceRun } from "../src/utils/replay";
it("replays the recorded inputs to the same actual outcome", () => {
  const original = run(30);
  const s = game.getState();
  const replay = reproduceRun({
    episode: s.activeEpisode,
    result: s.status,
    orbs: s.orbsCollected,
    score: s.score,
    events: s.events,
    duration: 30,
    landscape: false,
  });
  expect(replay.status).toBe(original.result);
  expect(replay.orbs).toBe(original.orbs);
});
