export type ViewportMode = 'shorts' | 'desktop' | 'cinematic';

export interface StudioSettings {
  viewportMode: ViewportMode;
  showSafeOverlay: boolean;
  botAutoplay: boolean;
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
  cameraTilt: boolean;
  recordingFps: 30 | 60;
  recordWithAudio: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  countdown: number | null;
  recordedBlob: Blob | null;
  videoUrl: string | null;
  durationMs: number;
  fileSizeBytes: number;
  error: string | null;
}

export interface StudioLogEvent {
  id: string;
  timestamp: string;
  beat: string;
  type: 'info' | 'pickup' | 'choice' | 'obstacle' | 'victory' | 'defeat' | 'system';
  message: string;
}
