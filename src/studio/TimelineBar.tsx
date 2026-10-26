import React from 'react';
import { Eye, Flame, ShieldAlert, Sparkles, Trophy, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const TimelineBar: React.FC = () => {
  const elapsedTime = useGameStore((state) => state.elapsedTime);
  const duration = useGameStore((state) => state.activeEpisode.durationSeconds);
  const activeBeat = useGameStore((state) => state.activeBeat);

  const progressPercent = Math.min(100, (elapsedTime / duration) * 100);

  // Scaled proportions for the 6 narrative beats
  const beats = [
    { id: 'hook', label: '1. HOOK', time: '0-3s', percent: 10, icon: Eye, color: 'border-cyan-400 bg-cyan-950/40 text-cyan-300' },
    { id: 'collect', label: '2. COLLECT', time: '3-8s', percent: 17, icon: Sparkles, color: 'border-sky-400 bg-sky-950/40 text-sky-300' },
    { id: 'twist', label: '3. TWIST', time: '8-14s', percent: 20, icon: Zap, color: 'border-purple-400 bg-purple-950/40 text-purple-300' },
    { id: 'hard-obstacle', label: '4. HARD OBSTACLES', time: '14-22s', percent: 27, icon: ShieldAlert, color: 'border-rose-400 bg-rose-950/40 text-rose-300' },
    { id: 'final-run', label: '5. FINAL RUN', time: '22-28s', percent: 19, icon: Flame, color: 'border-amber-400 bg-amber-950/40 text-amber-300' },
    { id: 'result', label: '6. RESULT', time: '28-30s', percent: 7, icon: Trophy, color: 'border-emerald-400 bg-emerald-950/40 text-emerald-300' }
  ];

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3 shadow-xl font-['Outfit']">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            6-Beat Episode Timeline
          </span>
          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
            {duration}s Challenge
          </span>
        </div>
        <div className="text-xs font-mono font-bold text-slate-300">
          {elapsedTime.toFixed(1)}s / {duration}s
        </div>
      </div>

      {/* Progress track */}
      <div className="relative w-full h-11 bg-slate-900 rounded-xl overflow-hidden flex border border-slate-800">
        {/* Beats segments */}
        {beats.map((b) => {
          const isCurrent = activeBeat === b.id;
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              style={{ width: `${b.percent}%` }}
              className={`h-full border-r border-slate-800/60 p-1.5 flex flex-col justify-between transition-colors ${
                isCurrent ? `${b.color} font-bold` : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1">
                <Icon className={`w-3 h-3 ${isCurrent ? 'animate-bounce' : ''}`} />
                <span className="text-[10px] font-bold tracking-tight truncate">
                  {b.label}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                {b.time}
              </span>
            </div>
          );
        })}

        {/* Live playhead line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-white to-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all duration-75 pointer-events-none"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
