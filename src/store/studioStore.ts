import { create } from 'zustand';
import { SoundManager } from '../game/audio/SoundManager';
import { RecordingState, StudioLogEvent, StudioSettings, ViewportMode } from '../types/studio';

interface StudioStoreState {
  settings: StudioSettings;
  recording: RecordingState;
  events: StudioLogEvent[];
  activeTab: 'studio' | 'episodes' | 'worlds' | 'recorder' | 'settings';

  setViewportMode: (mode: ViewportMode) => void;
  toggleSafeOverlay: () => void;
  toggleBotAutoplay: () => void;
  setBgmVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  toggleMute: () => void;
  setRecordingState: (state: Partial<RecordingState>) => void;
  addLogEvent: (event: Omit<StudioLogEvent, 'id' | 'timestamp'>) => void;
  clearLogEvents: () => void;
  setActiveTab: (tab: 'studio' | 'episodes' | 'worlds' | 'recorder' | 'settings') => void;
}

export const useStudioStore = create<StudioStoreState>((set, get) => ({
  settings: {
    viewportMode: 'shorts', // Default to 9:16 vertical Shorts preview!
    showSafeOverlay: true,
    botAutoplay: false,
    bgmVolume: 0.45,
    sfxVolume: 0.8,
    muted: false,
    cameraTilt: true,
    recordingFps: 30,
    recordWithAudio: true
  },
  recording: {
    isRecording: false,
    countdown: null,
    recordedBlob: null,
    videoUrl: null,
    durationMs: 0,
    fileSizeBytes: 0,
    error: null
  },
  events: [
    {
      id: 'init-1',
      timestamp: '00:00',
      beat: 'SYSTEM',
      type: 'system',
      message: "Gloop's Glitch Lab Studio initialized. Ready for 9:16 Shorts run."
    }
  ],
  activeTab: 'studio',

  setViewportMode: (mode) =>
    set((state) => ({ settings: { ...state.settings, viewportMode: mode } })),

  toggleSafeOverlay: () =>
    set((state) => ({
      settings: { ...state.settings, showSafeOverlay: !state.settings.showSafeOverlay }
    })),

  toggleBotAutoplay: () =>
    set((state) => ({
      settings: { ...state.settings, botAutoplay: !state.settings.botAutoplay }
    })),

  setBgmVolume: (vol) => {
    const { settings } = get();
    SoundManager.setVolumes(vol, settings.sfxVolume, settings.muted);
    set({ settings: { ...settings, bgmVolume: vol } });
  },

  setSfxVolume: (vol) => {
    const { settings } = get();
    SoundManager.setVolumes(settings.bgmVolume, vol, settings.muted);
    set({ settings: { ...settings, sfxVolume: vol } });
  },

  toggleMute: () => {
    const { settings } = get();
    const nextMuted = !settings.muted;
    SoundManager.setVolumes(settings.bgmVolume, settings.sfxVolume, nextMuted);
    set({ settings: { ...settings, muted: nextMuted } });
  },

  setRecordingState: (partial) =>
    set((state) => ({ recording: { ...state.recording, ...partial } })),

  addLogEvent: (event) => {
    const now = new Date();
    const ts = `${now.getMinutes().toString().padStart(2, '0')}:${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
    const newEntry: StudioLogEvent = {
      ...event,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: ts
    };
    set((state) => ({
      events: [newEntry, ...state.events.slice(0, 49)]
    }));
  },

  clearLogEvents: () => set({ events: [] }),

  setActiveTab: (tab) => set({ activeTab: tab })
}));
