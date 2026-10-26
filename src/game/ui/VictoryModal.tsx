import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, Share2, Sparkles, Video } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useStudioStore } from '../../store/studioStore';

export const VictoryModal: React.FC = () => {
  const status = useGameStore((state) => state.status);
  const score = useGameStore((state) => state.score);
  const orbsCollected = useGameStore((state) => state.orbsCollected);
  const targetOrbs = useGameStore((state) => state.activeEpisode.targetOrbs);
  const elapsedTime = useGameStore((state) => state.elapsedTime);
  const resetRun = useGameStore((state) => state.resetRun);
  const startCountdown = useGameStore((state) => state.startCountdown);

  const recordedBlob = useStudioStore((state) => state.recording.recordedBlob);
  const setActiveTab = useStudioStore((state) => state.setActiveTab);

  useEffect(() => {
    if (status === 'victory') {
      // Fire vibrant victory confetti cannon!
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff']
      });

      const timeout = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#06b6d4', '#f59e0b', '#38bdf8']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#06b6d4', '#f59e0b', '#38bdf8']
        });
      }, 350);

      return () => clearTimeout(timeout);
    }
  }, [status]);

  if (status !== 'victory') return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.35)] relative overflow-hidden font-['Outfit']">
        {/* Glow backdrop ring */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Trophy Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.6)] mb-3 animate-bounce">
          <Award className="w-9 h-9 stroke-[2.5]" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
          CHALLENGE CLEARED!
        </p>
        <h2 className="text-3xl font-black text-white font-['Fredoka'] mt-0.5 mb-4">
          GLOOP WINS!
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 block">
              ORBS COLLECTED
            </span>
            <span className="text-xl font-black text-cyan-300 font-['Fredoka']">
              {orbsCollected} / {targetOrbs}
            </span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 block">
              FINAL SCORE
            </span>
            <span className="text-xl font-black text-amber-300 font-['Fredoka']">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 block">
              RUN DURATION
            </span>
            <span className="text-xl font-black text-white font-mono">
              {elapsedTime.toFixed(1)}s
            </span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3">
            <span className="text-[11px] font-semibold text-slate-400 block">
              STATUS
            </span>
            <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" /> 100% CLEAN
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {recordedBlob && (
            <button
              onClick={() => setActiveTab('recorder')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold text-sm shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Video className="w-4 h-4" />
              Preview & Export Short (9:16)
            </button>
          )}

          <button
            onClick={() => {
              resetRun();
              startCountdown();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 font-['Fredoka']"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>

          <button
            onClick={resetRun}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700/60 transition-all"
          >
            Back to Studio
          </button>
        </div>
      </div>
    </div>
  );
};
