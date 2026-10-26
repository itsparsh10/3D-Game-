import React from "react";
import {
  Bot,
  Clapperboard,
  Globe,
  LayoutDashboard,
  Settings,
  Sparkles,
  User,
  Video,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useStudioStore } from "../store/studioStore";

export const Sidebar: React.FC = () => {
  const activeTab = useStudioStore((state) => state.activeTab);
  const setActiveTab = useStudioStore((state) => state.setActiveTab);
  const botAutoplay = useStudioStore((state) => state.settings.botAutoplay);
  const toggleBotAutoplay = useStudioStore((state) => state.toggleBotAutoplay);

  const activeEpisode = useGameStore((state) => state.activeEpisode);

  const navItems = [
    { id: "studio", label: "Studio Dashboard", icon: LayoutDashboard },
    { id: "episodes", label: "Episode Library", icon: Clapperboard },
    { id: "worlds", label: "World Themes", icon: Globe },
    { id: "recorder", label: "Shorts Export", icon: Video },
    { id: "settings", label: "Studio Settings", icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 font-['Outfit'] select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight font-['Fredoka']">
              GLOOP'S GLITCH LAB
            </h1>
            <p className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
              3D Shorts Studio
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic mb-5 pl-1">
          "One challenge. One run. Thirty seconds."
        </p>

        <a href="/" className="block text-sm text-cyan-300 mb-5">
          ← Open playable game
        </a>
        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Active Episode Card & Bot Toggle */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
        {/* Active Episode Summary */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Episode
          </span>
          <p className="text-xs font-bold text-white truncate">
            {activeEpisode.title}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-md font-semibold capitalize">
              {activeEpisode.world.replace("-", " ")}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeEpisode.durationSeconds}s · {activeEpisode.targetOrbs} Orbs
            </span>
          </div>
        </div>

        {/* Control Mode Toggle (Manual vs Bot Autoplay) */}
        <button
          onClick={toggleBotAutoplay}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
            botAutoplay
              ? "bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/50 text-purple-200"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850"
          }`}
        >
          <div className="flex items-center gap-2">
            {botAutoplay ? (
              <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
            ) : (
              <User className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {botAutoplay ? "Bot Autoplay (Demo)" : "Manual Controls"}
            </span>
          </div>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
              botAutoplay
                ? "bg-purple-500/20 text-purple-300"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {botAutoplay ? "BOT" : "PLAYER"}
          </span>
        </button>
      </div>
    </aside>
  );
};
