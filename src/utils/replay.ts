import { useGameStore } from "../store/gameStore";
import { useStudioStore } from "../store/studioStore";
import type { RunMetadata } from "../game/recording/VideoRecorder";
/** Replays actual logged inputs through exactly the same fixed-step rules. No result override. */
export function reproduceRun(run: RunMetadata) {
  const studio = useStudioStore.getState();
  const wasBot = studio.settings.botAutoplay;
  useStudioStore.setState({
    settings: { ...studio.settings, botAutoplay: false },
  });
  const game = useGameStore.getState();
  game.setEpisode(run.episode);
  game.startRun();
  const inputs = run.events.filter((e) =>
    ["lane", "jump", "slide"].includes(e.type),
  );
  let cursor = 0;
  for (let frame = 0; frame < run.episode.durationSeconds * 60; frame++) {
    const s = useGameStore.getState();
    if (s.status !== "running") break;
    while (
      cursor < inputs.length &&
      inputs[cursor].time <= s.elapsedTime + 1e-7
    ) {
      const e = inputs[cursor++];
      if (e.type === "lane") s.moveLane(e.value as -1 | 1);
      if (e.type === "jump") s.triggerJump(e.value);
      if (e.type === "slide") s.triggerSlide();
    }
    s.tick(1 / 60);
  }
  const result = useGameStore.getState();
  useStudioStore.setState({
    settings: { ...studio.settings, botAutoplay: wasBot },
  });
  return {
    status: result.status,
    orbs: result.orbsCollected,
    score: result.score,
    events: result.events,
  };
}
