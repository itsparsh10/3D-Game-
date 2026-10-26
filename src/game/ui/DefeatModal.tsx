import React from 'react';
import { AlertTriangle, RotateCcw, XCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const DefeatModal: React.FC = () => {
  const status = useGameStore((state) => state.status);
  const orbsCollected = useGameStore((state) => state.orbsCollected);
  const targetOrbs = useGameStore((state) => state.activeEpisode.targetOrbs);
  const resetRun = useGameStore((state) => state.resetRun);
  const startCountdown = useGameStore((state) => state.startCountdown);

  if (status !== 'defeat') return null;

  const neededMore = Math.max(0, targetOrbs - orbsCollected);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-500/80 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(244,63,94,0.35)] relative overflow-hidden font-['Outfit']">
        {/* Glow backdrop ring */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Fail Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.5)] mb-3">
          <XCircle className="w-9 h-9 stroke-[2.5]" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-rose-400">
          RUN FAILED
        </p>
        <h2 className="text-3xl font-black text-white font-['Fredoka'] mt-0.5 mb-2">
          SO CLOSE!
        </h2>

        <p className="text-sm text-slate-300 mb-6">
          {neededMore > 0 ? (
            <>
              Gloop needed <span className="text-cyan-400 font-bold">{neededMore} more orbs</span> to unlock the golden portal!
            </>
          ) : (
            'Gloop collided with a hazard along the obstacle track!'
          )}
        </p>

        {/* Stats */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 mb-6 flex justify-around">
          <div>
            <span className="text-[10px] text-slate-400 block">ORBS COLLECTED</span>
            <span className="text-lg font-black text-cyan-300 font-['Fredoka']">
              {orbsCollected} / {targetOrbs}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">RESULT</span>
            <span className="text-xs font-extrabold text-rose-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Defeated
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              resetRun();
              startCountdown();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 font-['Fredoka']"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={resetRun}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700/60 transition-all"
          >
            Adjust Episode Settings
          </button>
        </div>
      </div>
    </div>
  );
};
