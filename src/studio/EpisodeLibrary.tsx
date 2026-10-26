import React from 'react';
import { Check, Play, Sparkles } from 'lucide-react';
import { EPISODE_PRESETS } from '../config/episodes';
import { useGameStore } from '../store/gameStore';
import { useStudioStore } from '../store/studioStore';
import { EpisodeConfig } from '../types/game';

export const EpisodeLibrary: React.FC = () => {
  const activeEpisode = useGameStore((state) => state.activeEpisode);
  const setEpisode = useGameStore((state) => state.setEpisode);
  const setActiveTab = useStudioStore((state) => state.setActiveTab);

  const handleSelectEpisode = (ep: EpisodeConfig) => {
    setEpisode(ep);
    setActiveTab('studio');
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-['Outfit'] select-none">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white font-['Fredoka']">
            Episode Library
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose from curated challenge episodes designed for viral YouTube Shorts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EPISODE_PRESETS.map((ep, idx) => {
            const isActive = activeEpisode.id === ep.id;
            return (
              <div
                key={ep.id}
                className={`bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  isActive
                    ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      EP {idx + 1 < 10 ? `00${idx + 1}` : `0${idx + 1}`}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full capitalize">
                      {ep.world.replace('-', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white font-['Fredoka'] mb-1">
                    {ep.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {ep.subtitle}
                  </p>

                  <div className="flex items-center gap-2 mb-4 text-[11px] font-semibold text-slate-300">
                    <span className="bg-slate-800/80 px-2 py-1 rounded-lg">
                      🎯 {ep.targetOrbs} Orbs
                    </span>
                    <span className="bg-slate-800/80 px-2 py-1 rounded-lg">
                      ⏱️ {ep.durationSeconds}s
                    </span>
                    <span className="bg-slate-800/80 px-2 py-1 rounded-lg uppercase">
                      ⚡ {ep.difficulty}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectEpisode(ep)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-cyan-400" /> Active in Studio
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Load Episode
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
