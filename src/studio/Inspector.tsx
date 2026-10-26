import { parseTopic } from "../utils/rules";
import React, { useState } from "react";
import { Dices, Play, RotateCcw, Video, Zap } from "lucide-react";
import { WORLDS } from "../config/worlds";
import { useGameStore } from "../store/gameStore";
import { useStudioStore } from "../store/studioStore";
import { EpisodeDifficulty, EpisodeTwist, WorldId } from "../types/game";
import { VideoRecorder } from "../game/recording/VideoRecorder";
import { findWinningSeed } from "../game/physics/useBotController";

interface InspectorProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const Inspector: React.FC<InspectorProps> = ({ canvasRef }) => {
  const [topic, setTopic] = useState("");
  const [topicError, setTopicError] = useState("");
  const activeEpisode = useGameStore((state) => state.activeEpisode);
  const setEpisode = useGameStore((state) => state.setEpisode);
  const status = useGameStore((state) => state.status);
  const startCountdown = useGameStore((state) => state.startCountdown);
  const pauseRun = useGameStore((state) => state.pauseRun);
  const resumeRun = useGameStore((state) => state.resumeRun);
  const resetRun = useGameStore((state) => state.resetRun);

  const isRecording = useStudioStore((state) => state.recording.isRecording);
  const botAutoplay = useStudioStore((state) => state.settings.botAutoplay);
  const toggleBotAutoplay = useStudioStore((state) => state.toggleBotAutoplay);

  // Handler to start synchronized video recording run
  const handleRecordRun = () => {
    if (!canvasRef.current) return;
    if (!botAutoplay) {
      toggleBotAutoplay();
    }
    const winningSeed = findWinningSeed(activeEpisode);
    if (winningSeed !== activeEpisode.seed) {
      setEpisode({ ...activeEpisode, seed: winningSeed });
    }
    resetRun();
    if (VideoRecorder.startRecording(canvasRef.current, 30)) {
      useGameStore.getState().startRun();
    }
  };

  const handleStopRecording = () => {
    VideoRecorder.stopRecording();
  };

  const randomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 90000) + 1000;
    setEpisode({ ...activeEpisode, seed: newSeed });
  };

  return (
    <div className="w-80 bg-slate-950 border-l border-slate-800/80 flex flex-col justify-between p-4 shrink-0 overflow-y-auto font-['Outfit'] select-none">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
            Episode Inspector
          </h2>
          <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-mono">
            SEED: #{activeEpisode.seed}
          </span>
        </div>

        <div className="mb-4">
          <label className="text-xs text-cyan-300">Describe a challenge</label>
          <textarea
            aria-label="Challenge topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Collect 20 orbs in candy world, 45 seconds"
            className="w-full rounded-xl bg-slate-900 p-2 text-xs mt-2"
          />
          <button
            className="text-xs text-cyan-300"
            onClick={() => {
              try {
                setEpisode(parseTopic(topic, activeEpisode));
                setTopicError("");
              } catch (e) {
                setTopicError(String(e));
              }
            }}
          >
            Apply supported preset →
          </button>
          {topicError && <p>{topicError}</p>}
        </div>
        {/* --- FORM FIELDS --- */}
        <div className="flex flex-col gap-3.5 text-xs">
          {/* Episode Title */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Episode Title
            </label>
            <input
              type="text"
              value={activeEpisode.title}
              onChange={(e) =>
                setEpisode({ ...activeEpisode, title: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* World Selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
              World Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(WORLDS) as WorldId[]).map((wId) => {
                const w = WORLDS[wId];
                const isSelected = activeEpisode.world === wId;
                return (
                  <button
                    key={wId}
                    onClick={() => setEpisode({ ...activeEpisode, world: wId })}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <span className="text-[11px] font-bold block truncate">
                      {w.name}
                    </span>
                    <span className="text-[9px] text-slate-500 capitalize">
                      {w.propsType}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Collectible Orbs */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-400">
                Target Orbs
              </label>
              <span className="text-cyan-400 font-extrabold font-['Fredoka']">
                {activeEpisode.targetOrbs} ORBS
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="2"
              value={activeEpisode.targetOrbs}
              onChange={(e) =>
                setEpisode({
                  ...activeEpisode,
                  targetOrbs: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Challenge Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 45, 60].map((dur) => (
                <button
                  key={dur}
                  onClick={() =>
                    setEpisode({ ...activeEpisode, durationSeconds: dur })
                  }
                  className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    activeEpisode.durationSeconds === dur
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-300"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Tier */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["easy", "medium", "hard", "chaos"] as EpisodeDifficulty[]).map(
                (diff) => (
                  <button
                    key={diff}
                    onClick={() =>
                      setEpisode({ ...activeEpisode, difficulty: diff })
                    }
                    className={`py-1.5 rounded-lg border text-[11px] font-extrabold uppercase transition-all ${
                      activeEpisode.difficulty === diff
                        ? "border-amber-400 bg-amber-500/10 text-amber-300"
                        : "border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {diff}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Narrative Twist */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Episode Twist
            </label>
            <select
              value={activeEpisode.twist}
              onChange={(e) =>
                setEpisode({
                  ...activeEpisode,
                  twist: e.target.value as EpisodeTwist,
                })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="color-gate-choice">
                Color / Math Choice Gates (+5 / -3)
              </option>
              <option value="glitchmaker-attack">
                Glitchmaker Cube Ambush
              </option>
              <option value="speed-rush">Speed Boost Overdrive</option>
              <option value="low-gravity">Super Spring Low Gravity</option>
            </select>
          </div>

          {/* Seed with Randomizer */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-400">
                Level Seed
              </label>
              <button
                onClick={randomizeSeed}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
              >
                <Dices className="w-3 h-3" /> New Seed
              </button>
            </div>
            <input
              type="number"
              value={activeEpisode.seed}
              onChange={(e) =>
                setEpisode({
                  ...activeEpisode,
                  seed: parseInt(e.target.value, 10) || 1,
                })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* --- RUN CONTROL ACTION BUTTONS --- */}
      <div className="flex flex-col gap-2 pt-4 border-t border-slate-800/80">
        {/* Record Short Button */}
        {isRecording ? (
          <button
            onClick={handleStopRecording}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 animate-pulse"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            Stop & Save Recording
          </button>
        ) : (
          <button
            onClick={handleRecordRun}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-[0_0_18px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Video className="w-4 h-4" />
            Record YouTube Short (9:16)
          </button>
        )}

        {/* Start / Pause / Reset Buttons */}
        <div className="flex items-center gap-2">
          {status === "running" ? (
            <button
              onClick={pauseRun}
              className="flex-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all"
            >
              Pause
            </button>
          ) : status === "paused" ? (
            <button
              onClick={resumeRun}
              className="flex-1 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={startCountdown}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 font-['Fredoka']"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Start Run
            </button>
          )}

          <button
            onClick={resetRun}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-all"
            title="Reset Run"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
