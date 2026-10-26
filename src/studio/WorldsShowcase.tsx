import React from "react";
import { Check, Sparkles } from "lucide-react";
import { WORLDS } from "../config/worlds";
import { useGameStore } from "../store/gameStore";
import { useStudioStore } from "../store/studioStore";
import { WorldId } from "../types/game";

export const WorldsShowcase: React.FC = () => {
  const activeEpisode = useGameStore((state) => state.activeEpisode);
  const setEpisode = useGameStore((state) => state.setEpisode);
  const setActiveTab = useStudioStore((state) => state.setActiveTab);

  const handleApplyWorld = (worldId: WorldId) => {
    setEpisode({ ...activeEpisode, world: worldId });
    setActiveTab("studio");
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-['Outfit'] select-none">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white font-['Fredoka']">
            World Themes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven stylized 3D environments with tailored palettes,
            lighting, fog, and particle systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(Object.keys(WORLDS) as WorldId[]).map((wId) => {
            const w = WORLDS[wId];
            const isCurrent = activeEpisode.world === wId;
            return (
              <div
                key={wId}
                className={`bg-slate-900/80 border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-extrabold text-white font-['Fredoka']">
                      {w.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: w.skyColor }}
                        title="Sky Color"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: w.accentColor }}
                        title="Accent Color"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: w.trackEdgeColor }}
                        title="Curb Color"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {w.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-5">
                    <div>
                      <span className="text-slate-500 block text-[10px]">
                        SCENERY PROPS
                      </span>
                      <span className="text-slate-200 font-semibold capitalize">
                        {w.propsType}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">
                        ATMOSPHERIC FOG
                      </span>
                      <span className="text-slate-200 font-semibold">
                        {w.fogNear}m - {w.fogFar}m
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyWorld(wId)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isCurrent
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white"
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-4 h-4 text-cyan-400" /> Active in
                      Current Run
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Apply World Theme
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
