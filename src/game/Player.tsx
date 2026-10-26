import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Pause,
  Play,
  Volume2,
  VolumeX,
  FlaskConical,
  RotateCcw,
} from "lucide-react";
import { GameScene } from "./GameScene";
import { useGameStore } from "../store/gameStore";
import { useStudioStore } from "../store/studioStore";
import { EPISODE_PRESETS } from "../config/episodes";
export function Player() {
  const s = useGameStore(),
    studio = useStudioStore();
  const touch = useRef<[number, number] | null>(null);
  const [quality, setQuality] = useState(false);
  useEffect(() => {
    const hide = () => {
      if (document.hidden && useGameStore.getState().status === "running")
        useGameStore.getState().pauseRun();
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);
  const start = () => {
    s.resetRun();
    s.startRun();
  };
  const result = s.status === "victory" || s.status === "defeat";
  return (
    <main
      className={"player " + (quality ? "low-quality" : "")}
      onTouchStart={(e) => {
        touch.current = [e.touches[0].clientX, e.touches[0].clientY];
      }}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current[0],
          dy = e.changedTouches[0].clientY - touch.current[1];
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 35) {
          if (Math.abs(dx) > Math.abs(dy)) s.moveLane(dx > 0 ? 1 : -1);
          else if (dy < 0) s.triggerJump();
          else s.triggerSlide();
        }
        touch.current = null;
      }}
    >
      <GameScene lowQuality={quality} />
      <div className="game-vignette" />
      <header className="play-header">
        <a className="wordmark" href="/">
          GLOOP’S <span>GLITCH LAB</span>
        </a>
        <div className="header-actions">
          <button aria-label="Toggle audio" onClick={studio.toggleMute}>
            {studio.settings.muted ? <VolumeX /> : <Volume2 />}
          </button>
          <button
            aria-label={
              s.status === "idle" ? "Toggle lower effects" : "Pause game"
            }
            onClick={() =>
              s.status === "running"
                ? s.pauseRun()
                : s.status === "paused"
                  ? s.resumeRun()
                  : setQuality(!quality)
            }
          >
            {s.status === "paused" ? <Play /> : <Pause />}
          </button>
          <a href="/studio" aria-label="Open creator studio">
            <FlaskConical />
          </a>
        </div>
      </header>
      {(s.status === "running" || s.status === "paused") && (
        <div className="run-hud">
          <span className="eyebrow">
            {s.activeEpisode.world.replaceAll("-", " ")} ·{" "}
            {s.activeBeat.replaceAll("-", " ")}
          </span>
          <strong>
            Collect {s.activeEpisode.targetOrbs} orbs. Reach the portal.
          </strong>
          <div className="score-row">
            <span>
              🔵 {s.orbsCollected}
              <small> / {s.activeEpisode.targetOrbs}</small>
            </span>
            <span className="lives">
              {"♥".repeat(
                Math.max(0, s.activeEpisode.allowedHits + 1 - s.hitsTaken),
              )}
            </span>
            <span>
              {Math.max(
                0,
                Math.ceil(s.activeEpisode.durationSeconds - s.elapsedTime),
              )}
              s
            </span>
          </div>
          <div className="progress">
            <i
              style={{
                width:
                  Math.min(
                    100,
                    (s.orbsCollected / s.activeEpisode.targetOrbs) * 100,
                  ) + "%",
              }}
            />
          </div>
        </div>
      )}
      {s.status === "running" && s.elapsedTime >= 10 && s.elapsedTime < 13 && (
        <div className="twist-toast">
          ⚡ RULE FLIP!
          <small>
            {s.activeEpisode.twist === "low-gravity"
              ? "Lighter jumps. Longer airtime."
              : s.activeEpisode.twist === "speed-rush"
                ? "The pace just picked up!"
                : s.activeEpisode.twist === "glitchmaker-attack"
                  ? "Watch the Glitchmaker’s hammers!"
                  : "Red orbs are safe now. Blue costs one!"}
          </small>
        </div>
      )}
      {s.status === "idle" && (
        <section className="launch-card">
          <span className="eyebrow">
            ONE CHALLENGE. ONE RUN. THIRTY SECONDS.
          </span>
          <h1>
            Small blob.
            <br />
            <em>Big adventure.</em>
          </h1>
          <p>
            Collect. Dodge. Defy the glitch.
            <br />
            The sky is your playground.
          </p>
          <div className="world-pills">
            {EPISODE_PRESETS.filter((_, i) => i !== 2).map((ep) => (
              <button
                key={ep.id}
                className={s.activeEpisode.world === ep.world ? "selected" : ""}
                onClick={() => s.setEpisode(ep)}
              >
                {ep.world === "sky-islands"
                  ? "☁ Sky"
                  : ep.world === "candy-world"
                    ? "🍬 Candy"
                    : ep.world === "ice-world"
                      ? "❄ Ice"
                      : "🔥 Lava"}
              </button>
            ))}
          </div>
          <button className="play-cta" onClick={start}>
            <Play fill="currentColor" size={21} /> LET’S GLOOP <span>→</span>
          </button>
          <div className="control-hint">
            ← → move &nbsp; SPACE jump &nbsp; ↓ slide
            <br />
            <small>On mobile, swipe or use the controls.</small>
          </div>
        </section>
      )}
      {s.status === "paused" && (
        <section className="result-card">
          <span className="eyebrow">TAKE A BREATHER</span>
          <h1>Paused.</h1>
          <button className="play-cta" onClick={s.resumeRun}>
            <Play /> Keep running
          </button>
          <button onClick={s.resetRun}>Back to start</button>
        </section>
      )}
      {result && (
        <section className="result-card">
          <span className="eyebrow">
            {s.status === "victory"
              ? "CHALLENGE COMPLETE"
              : "ANOTHER RUN, ANOTHER CHANCE"}
          </span>
          <h1>{s.status === "victory" ? "GLOOP DID IT!" : "So close!"}</h1>
          <p>
            {s.orbsCollected} / {s.activeEpisode.targetOrbs} orbs ·{" "}
            {s.score.toLocaleString()} points
          </p>
          <p>
            {s.status === "victory"
              ? "A little jelly. A lot of courage."
              : "Find your rhythm and try again."}
          </p>
          <button className="play-cta" onClick={start}>
            <RotateCcw /> Run it again
          </button>
          <button onClick={s.resetRun}>Choose another world</button>
        </section>
      )}
      {s.status === "running" && (
        <nav className="touch-controls">
          <button aria-label="Move left" onClick={() => s.moveLane(-1)}>
            <ArrowLeft />
          </button>
          <button aria-label="Move right" onClick={() => s.moveLane(1)}>
            <ArrowRight />
          </button>
          <button aria-label="Slide" onClick={() => s.triggerSlide()}>
            <ChevronDown />
          </button>
          <button aria-label="Jump" onClick={() => s.triggerJump()}>
            <ArrowUp />
          </button>
        </nav>
      )}
      <footer className="play-footer">
        <span>
          GLOOP’S GLITCH LAB <b> / </b> EPISODE{" "}
          {s.activeEpisode.id.replace("ep-", "")}
        </span>
        <span>RUN. FALL. LEARN. AGAIN.</span>
      </footer>
    </main>
  );
}
