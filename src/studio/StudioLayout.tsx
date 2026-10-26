import React, { useRef } from "react";
import { Maximize2, Monitor, Smartphone, Video } from "lucide-react";
import { GameScene } from "../game/GameScene";
import { DefeatModal } from "../game/ui/DefeatModal";
import { GameOverlay } from "../game/ui/GameOverlay";
import { VictoryModal } from "../game/ui/VictoryModal";
import { useGameStore } from "../store/gameStore";
import { useStudioStore } from "../store/studioStore";
import { EpisodeLibrary } from "./EpisodeLibrary";
import { Inspector } from "./Inspector";
import { RecorderModal } from "./RecorderModal";
import { SettingsView } from "./SettingsView";
import { Sidebar } from "./Sidebar";
import { TimelineBar } from "./TimelineBar";
import { WorldsShowcase } from "./WorldsShowcase";

export const StudioLayout: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeTab = useStudioStore((state) => state.activeTab);
  const viewportMode = useStudioStore((state) => state.settings.viewportMode);
  const setViewportMode = useStudioStore((state) => state.setViewportMode);
  const isRecording = useStudioStore((state) => state.recording.isRecording);

  const status = useGameStore((state) => state.status);
  const activeBeat = useGameStore((state) => state.activeBeat);

  return (
    <div className="studio-shell flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-['Outfit']">
      {/* --- LEFT SIDEBAR --- */}
      <Sidebar />

      {/* --- MAIN CENTER WORKSPACE --- */}
      {activeTab === "episodes" ? (
        <EpisodeLibrary />
      ) : activeTab === "worlds" ? (
        <WorldsShowcase />
      ) : activeTab === "recorder" ? (
        <RecorderModal />
      ) : activeTab === "settings" ? (
        <SettingsView />
      ) : (
        <main className="flex-1 flex flex-col justify-between p-4 overflow-hidden bg-slate-900/30">
          {/* Top Viewport Header Bar */}
          <div className="flex items-center justify-between pb-3 select-none">
            {/* Viewport Aspect Ratio Switcher */}
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-2xl shadow-lg">
              <button
                onClick={() => setViewportMode("shorts")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewportMode === "shorts"
                    ? "bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Shorts (9:16)
              </button>
              <button
                onClick={() => setViewportMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewportMode === "desktop"
                    ? "bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop (16:9)
              </button>
              <button
                onClick={() => setViewportMode("cinematic")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewportMode === "cinematic"
                    ? "bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Full Canvas
              </button>
            </div>

            {/* Live Recording / Game Status Badge */}
            <div className="flex items-center gap-3">
              {isRecording && (
                <div className="flex items-center gap-2 bg-red-950/80 border border-red-500/60 text-red-300 px-3 py-1.5 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  REC · 1080×1920 (30 FPS)
                </div>
              )}

              <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  STATE:{" "}
                  <strong className="text-white uppercase">{status}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 3D Canvas Viewport Frame */}
          <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 relative">
            <div
              className={`relative overflow-hidden transition-all duration-300 shadow-2xl ${
                viewportMode === "shorts"
                  ? "h-full aspect-[9/16] rounded-3xl border-4 border-slate-800/90 shadow-[0_0_40px_rgba(0,0,0,0.8)]"
                  : viewportMode === "desktop"
                    ? "w-full aspect-[16/9] max-h-full rounded-2xl border-2 border-slate-800"
                    : "w-full h-full rounded-2xl border-2 border-slate-800"
              }`}
            >
              {/* 3D Game Scene */}
              <GameScene canvasRef={canvasRef} />

              {/* In-Game HUD Overlay */}
              <GameOverlay />

              {/* Victory Celebration Modal */}
              <VictoryModal />

              {/* Defeat Result Modal */}
              <DefeatModal />
            </div>
          </div>

          {/* 6-Beat Episode Timeline Bar */}
          <div className="pt-3">
            <TimelineBar />
          </div>
        </main>
      )}

      {/* --- RIGHT INSPECTOR PANEL --- */}
      {activeTab === "studio" && <Inspector canvasRef={canvasRef} />}
    </div>
  );
};
