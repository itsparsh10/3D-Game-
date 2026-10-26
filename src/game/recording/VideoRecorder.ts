import { SoundManager } from "../audio/SoundManager";
import { useStudioStore } from "../../store/studioStore";
import { useGameStore } from "../../store/gameStore";
export interface RunMetadata {
  episode: ReturnType<typeof useGameStore.getState>["activeEpisode"];
  result: string;
  orbs: number;
  score: number;
  events: ReturnType<typeof useGameStore.getState>["events"];
  duration: number;
  landscape: boolean;
}
class VideoRecorderEngine {
  private recorder: MediaRecorder | null = null;
  private frame = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private unsubscribe: (() => void) | null = null;
  metadata: RunMetadata | null = null;
  startRecording(canvas: HTMLCanvasElement, fps = 30) {
    try {
      if (this.recorder?.state === "recording") return false;
      SoundManager.getAudioStream();
      SoundManager.resume();
      const mime = [
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ].find((t) => MediaRecorder.isTypeSupported(t));
      if (!mime) throw Error("This browser cannot record video.");
      const output = document.createElement("canvas");
      const landscape = canvas.clientWidth > canvas.clientHeight;
      output.width = landscape ? 1920 : 1080;
      output.height = landscape ? 1080 : 1920;
      const ctx = output.getContext("2d")!;
      const draw = () => {
        ctx.drawImage(canvas, 0, 0, output.width, output.height);
        this.frame = requestAnimationFrame(draw);
      };
      draw();
      const video = output.captureStream(fps);
      const audio = SoundManager.getAudioStream();
      const stream = new MediaStream([
        ...video.getVideoTracks(),
        ...(audio?.getAudioTracks() || []),
      ]);
      const chunks: Blob[] = [];
      const started = performance.now();
      this.metadata = null;
      this.recorder = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 8_000_000,
      });
      this.recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      this.recorder.onerror = () => {
        useStudioStore
          .getState()
          .setRecordingState({
            error: "Browser recording failed.",
            isRecording: false,
          });
        this.stopRecording();
      };
      this.recorder.onstop = () => {
        cancelAnimationFrame(this.frame);
        video.getTracks().forEach((t) => t.stop());
        this.unsubscribe?.();
        if (this.timer) clearTimeout(this.timer);
        const duration = (performance.now() - started) / 1000;
        const s = useGameStore.getState();
        this.metadata = {
          episode: s.activeEpisode,
          result: s.status,
          orbs: s.orbsCollected,
          score: s.score,
          events: s.events,
          duration,
          landscape,
        };
        const blob = new Blob(chunks, { type: mime });
        const old = useStudioStore.getState().recording.videoUrl;
        if (old) URL.revokeObjectURL(old);
        useStudioStore
          .getState()
          .setRecordingState({
            isRecording: false,
            recordedBlob: blob,
            videoUrl: URL.createObjectURL(blob),
            durationMs: duration * 1000,
            fileSizeBytes: blob.size,
            error: null,
          });
        try {
          localStorage.setItem("gloop-last-run", JSON.stringify(this.metadata));
        } catch {}
      };
      this.recorder.start(250);
      useStudioStore
        .getState()
        .setRecordingState({
          isRecording: true,
          error: null,
          videoUrl: null,
          recordedBlob: null,
        });
      this.unsubscribe = useGameStore.subscribe((s, prev) => {
        if (
          s.status !== prev.status &&
          ["victory", "defeat"].includes(s.status)
        )
          this.timer = setTimeout(() => this.stopRecording(), 2000);
      });
      return true;
    } catch (e) {
      useStudioStore
        .getState()
        .setRecordingState({ isRecording: false, error: String(e) });
      return false;
    }
  }
  stopRecording() {
    if (this.recorder && this.recorder.state !== "inactive")
      this.recorder.stop();
  }
}
export const VideoRecorder = new VideoRecorderEngine();
