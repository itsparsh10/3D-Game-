import React, { useState } from "react";
import { SoundManager } from "../game/audio/SoundManager";
import { Camera, Volume2, VolumeX, Youtube } from "lucide-react";
import { useStudioStore } from "../store/studioStore";

export const SettingsView: React.FC = () => {
  const [master, setMaster] = useState(1),
    [music, setMusic] = useState("Synthesized prototype soundtrack");
  const settings = useStudioStore((state) => state.settings);
  const setBgmVolume = useStudioStore((state) => state.setBgmVolume);
  const setSfxVolume = useStudioStore((state) => state.setSfxVolume);
  const toggleMute = useStudioStore((state) => state.toggleMute);
  const toggleSafeOverlay = useStudioStore((state) => state.toggleSafeOverlay);

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-['Outfit'] select-none">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white font-['Fredoka']">
            Studio Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audio levels, procedural synthesizer mixing, and YouTube Shorts
            viewport overlays.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Audio Mixing Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {settings.muted ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                )}
                Audio & Procedural Synthesizer
              </h3>
              <button
                onClick={toggleMute}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  settings.muted
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                {settings.muted ? "Unmute Audio" : "Mute All"}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-xs">
                Master volume · {Math.round(master * 100)}%
                <input
                  aria-label="Master volume"
                  type="range"
                  min="0"
                  max="1"
                  step=".05"
                  value={master}
                  onChange={(e) => {
                    setMaster(+e.target.value);
                    SoundManager.setMasterVolume(+e.target.value);
                  }}
                  className="w-full accent-cyan-400"
                />
              </label>
              <label className="text-xs text-cyan-300">
                Load your own music
                <input
                  type="file"
                  accept="audio/*"
                  className="block mt-2"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      try {
                        await SoundManager.loadMusic(file);
                        setMusic(file.name + " · starts on next run");
                      } catch (error) {
                        setMusic(String(error));
                      }
                  }}
                />
                <span className="block text-slate-400 mt-2">{music}</span>
              </label>
              {/* BGM Volume */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-slate-300">
                    Background Synth Loop
                  </span>
                  <span className="font-mono text-cyan-400">
                    {Math.round(settings.bgmVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.bgmVolume}
                  onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* SFX Volume */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-slate-300">
                    Sound Effects & Fanfare
                  </span>
                  <span className="font-mono text-cyan-400">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Viewport & Overlay Guides */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              YouTube Shorts Overlays & Guides
            </h3>

            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">
                  YouTube Shorts Safe Area Border
                </span>
                <span className="text-[11px] text-slate-400">
                  Displays like/comment buttons and title safe zones over 9:16
                  viewport
                </span>
              </div>
              <button
                onClick={toggleSafeOverlay}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  settings.showSafeOverlay
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {settings.showSafeOverlay ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
