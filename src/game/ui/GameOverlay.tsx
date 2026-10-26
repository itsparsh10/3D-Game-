import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Disc, Flame, Heart, Sparkles, Timer } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useStudioStore } from '../../store/studioStore';

export const GameOverlay: React.FC = () => {
  const status = useGameStore((state) => state.status);
  const countdown = useGameStore((state) => state.countdown);
  const orbsCollected = useGameStore((state) => state.orbsCollected);
  const targetOrbs = useGameStore((state) => state.activeEpisode.targetOrbs);
  const combo = useGameStore((state) => state.combo);
  const score = useGameStore((state) => state.score);
  const elapsedTime = useGameStore((state) => state.elapsedTime);
  const duration = useGameStore((state) => state.activeEpisode.durationSeconds);
  const activeBeat = useGameStore((state) => state.activeBeat);
  const allowedHits = useGameStore((state) => state.activeEpisode.allowedHits);
  const hitsTaken = useGameStore((state) => state.hitsTaken);

  const moveLane = useGameStore((state) => state.moveLane);
  const triggerJump = useGameStore((state) => state.triggerJump);
  const triggerSlide = useGameStore((state) => state.triggerSlide);

  const showSafeOverlay = useStudioStore((state) => state.settings.showSafeOverlay);
  const viewportMode = useStudioStore((state) => state.settings.viewportMode);

  const timeRemaining = Math.max(0, Math.ceil(duration - elapsedTime));
  const orbProgress = Math.min(100, Math.round((orbsCollected / targetOrbs) * 100));

  const beatLabels: Record<string, string> = {
    hook: '1. HOOK',
    collect: '2. COLLECT',
    twist: '3. TWIST',
    'hard-obstacle': '4. HARD OBSTACLE',
    'final-run': '5. FINAL RUN',
    result: '6. RESULT'
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10 font-['Outfit']">
      {/* --- TOP HUD BAR --- */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Beat badge & Lives */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              {beatLabels[activeBeat] || activeBeat}
            </span>
          </div>

          {/* Hearts / Allowed Hits */}
          {allowedHits > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-700/50 w-fit">
              {Array.from({ length: allowedHits + 1 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < (allowedHits + 1 - hitsTaken)
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Center: Glowing Target Orbs Counter */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-slate-950/90 via-cyan-950/90 to-slate-950/90 backdrop-blur-md border-2 border-cyan-400/60 px-5 py-2 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping" />
            <div className="flex items-baseline gap-1 font-['Fredoka']">
              <span className="text-2xl font-extrabold text-cyan-200 tracking-tight">
                {orbsCollected}
              </span>
              <span className="text-sm font-semibold text-cyan-500">
                / {targetOrbs} ORBS
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-36 h-2 bg-slate-900/80 rounded-full mt-1.5 p-0.5 border border-cyan-900/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-300 rounded-full transition-all duration-300 shadow-[0_0_8px_#38bdf8]"
              style={{ width: `${orbProgress}%` }}
            />
          </div>
        </div>

        {/* Right: Timer & Combo */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-full text-white shadow-lg">
            <Timer className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold font-mono text-amber-300">
              {timeRemaining}s
            </span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500/90 to-amber-500/90 px-2.5 py-0.5 rounded-full text-white font-extrabold text-xs shadow-md animate-bounce">
              <Flame className="w-3.5 h-3.5 text-yellow-200" />
              <span>{combo}x STREAK!</span>
            </div>
          )}
        </div>
      </div>

      {/* --- BEAT 1 HOOK OVERLAY BANNER (First 3 seconds) --- */}
      {status === 'running' && activeBeat === 'hook' && (
        <div className="self-center bg-gradient-to-r from-cyan-600/95 via-sky-500/95 to-cyan-600/95 backdrop-blur-md px-8 py-4 rounded-3xl border-2 border-white/60 shadow-[0_0_35px_rgba(6,182,212,0.6)] animate-pulse text-center">
          <p className="text-xs font-black uppercase tracking-widest text-white/80">
            CHALLENGE OBJECTIVE
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-['Fredoka'] drop-shadow-md">
            CAN GLOOP GET {targetOrbs} ORBS?
          </h2>
          <p className="text-xs text-cyan-100 font-semibold mt-0.5">
            ONE RUN · 30 SECONDS
          </p>
        </div>
      )}

      {/* --- COUNTDOWN OVERLAY --- */}
      {status === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-600 font-['Fredoka'] animate-ping drop-shadow-[0_0_40px_rgba(34,211,238,0.8)]">
            {countdown}
          </div>
        </div>
      )}

      {/* --- YOUTUBE SHORTS SAFE AREA GUIDES --- */}
      {viewportMode === 'shorts' && showSafeOverlay && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-red-500/20 rounded-2xl flex flex-col justify-between p-6">
          {/* Top Shorts UI Zone (sound name / search) */}
          <div className="text-right text-[10px] text-slate-400/50 uppercase tracking-widest">
            YouTube Shorts Safe Zone
          </div>
          {/* Right side Shorts Action Buttons Area (Like, Comments, Share) */}
          <div className="self-end flex flex-col items-center gap-4 opacity-25 pr-1">
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-[10px] text-white">❤️</div>
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-[10px] text-white">💬</div>
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-[10px] text-white">↗️</div>
            <Disc className="w-7 h-7 text-white animate-spin" />
          </div>
          {/* Bottom Title & Channel Area */}
          <div className="text-[10px] text-slate-400/40">
            @GloopsGlitchLab · Can Gloop survive? #shorts #gaming
          </div>
        </div>
      )}

      {/* --- MOBILE TOUCH CONTROLS (Active on touch / mobile) --- */}
      <div className="w-full flex items-end justify-between pointer-events-auto pb-2 px-1">
        {/* Left / Right Lane Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => moveLane(-1)}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/50 text-cyan-300 flex items-center justify-center active:scale-90 active:bg-cyan-500 active:text-white transition-all shadow-lg"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <button
            onClick={() => moveLane(1)}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/50 text-cyan-300 flex items-center justify-center active:scale-90 active:bg-cyan-500 active:text-white transition-all shadow-lg"
            aria-label="Move Right"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

        {/* Jump / Slide Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={triggerSlide}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-amber-500/50 text-amber-300 flex items-center justify-center active:scale-90 active:bg-amber-500 active:text-white transition-all shadow-lg"
            aria-label="Slide"
          >
            <ArrowDown className="w-7 h-7" />
          </button>
          <button
            onClick={() => triggerJump()}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 text-slate-950 font-bold flex items-center justify-center active:scale-90 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all"
            aria-label="Jump"
          >
            <ArrowUp className="w-8 h-8 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
