import { describe, it, expect } from "vitest";
import { SeededRNG } from "../src/utils/rng";
import { generateLevel, RUN_SPEED } from "../src/utils/levelGenerator";
import { EPISODE_PRESETS } from "../src/config/episodes";
import { WORLDS } from "../src/config/worlds";

describe("Gloop's Glitch Lab - Core Engine Tests", () => {
  it("Deterministic PRNG produces identical sequence for same seed", () => {
    const rng1 = new SeededRNG(1337);
    const rng2 = new SeededRNG(1337);

    const seq1 = [
      rng1.next(),
      rng1.nextInt(1, 100),
      rng1.choice(["A", "B", "C"]),
    ];
    const seq2 = [
      rng2.next(),
      rng2.nextInt(1, 100),
      rng2.choice(["A", "B", "C"]),
    ];

    expect(seq1).toEqual(seq2);
  });

  it("Different seeds produce different sequences", () => {
    const rng1 = new SeededRNG(1001);
    const rng2 = new SeededRNG(9999);

    expect(rng1.next()).not.toEqual(rng2.next());
  });

  it("Level Generator produces valid 6-beat track geometry", () => {
    const ep = EPISODE_PRESETS[0];
    const level = generateLevel(ep);

    expect(level.finishZ).toBeLessThan(0);
    expect(level.trackLength).toBeGreaterThan(Math.abs(level.finishZ));

    // Check beat boundaries ordering
    const { hookZ, collectZ, twistZ, hardZ, finalZ, resultZ } =
      level.beatCheckpoints;
    expect(hookZ).toBeGreaterThan(collectZ);
    expect(collectZ).toBeGreaterThan(twistZ);
    expect(twistZ).toBeGreaterThan(hardZ);
    expect(hardZ).toBeGreaterThan(finalZ);
    expect(finalZ).toBeGreaterThanOrEqual(resultZ);

    // Verify collectible orbs exist and exceed target to guarantee solvability
    const totalOrbValue = level.orbs.reduce((acc, o) => acc + o.value, 0);
    expect(totalOrbValue).toBeGreaterThanOrEqual(ep.targetOrbs);

    // Verify key obstacles exist (hammers, gates, pads)
    const types = level.obstacles.map((o) => o.type);
    expect(types).toContain("swinging-hammer");
    expect(types).toContain("choice-gate");
    expect(types).toContain("bounce-pad");
  });

  it("All 4 World Themes are defined with complete lighting and palettes", () => {
    const worldIds = [
      "sky-islands",
      "candy-world",
      "ice-world",
      "lava-world",
    ] as const;

    worldIds.forEach((id) => {
      const w = WORLDS[id];
      expect(w).toBeDefined();
      expect(w.skyColor).toBeTruthy();
      expect(w.trackColor).toBeTruthy();
      expect(w.accentColor).toBeTruthy();
      expect(w.fogNear).toBeGreaterThan(0);
      expect(w.fogFar).toBeGreaterThan(w.fogNear);
    });
  });

  it("Episode Presets satisfy the 30-60s Short requirements", () => {
    EPISODE_PRESETS.forEach((ep) => {
      expect(ep.durationSeconds).toBeGreaterThanOrEqual(30);
      expect(ep.durationSeconds).toBeLessThanOrEqual(60);
      expect(ep.targetOrbs).toBeGreaterThan(0);
      expect(ep.seed).toBeGreaterThan(0);
      expect(["easy", "medium", "hard", "chaos"]).toContain(ep.difficulty);
    });
  });
});
