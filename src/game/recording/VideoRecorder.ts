import { SoundManager } from '../audio/SoundManager';
import { useStudioStore } from '../../store/studioStore';

class VideoRecorderEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private startTime = 0;

  /** Checks supported mime types on current browser */
  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  /** Starts recording the 3D Canvas stream + Procedural Audio */
  public startRecording(canvas: HTMLCanvasElement, fps: number = 30) {
    try {
      const mimeType = this.getSupportedMimeType();
      if (!mimeType) {
        useStudioStore.getState().setRecordingState({
          error: 'Browser does not support MediaRecorder canvas stream capture.'
        });
        return false;
      }

      // Capture 30 or 60 FPS from Three.js canvas
      const videoStream = canvas.captureStream(fps);
      const audioStream = SoundManager.getAudioStream();

      // Combine video + procedural audio into one unified MediaStream
      const combinedStream = new MediaStream();
      videoStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
      if (audioStream) {
        audioStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
      }

      this.recordedChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6_000_000 // 6 Mbps high quality
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const finalBlob = new Blob(this.recordedChunks, { type: mimeType });
        const videoUrl = URL.createObjectURL(finalBlob);
        const durationMs = Date.now() - this.startTime;

        useStudioStore.getState().setRecordingState({
          isRecording: false,
          recordedBlob: finalBlob,
          videoUrl,
          durationMs,
          fileSizeBytes: finalBlob.size,
          error: null
        });

        useStudioStore.getState().addLogEvent({
          beat: 'RECORDER',
          type: 'victory',
          message: `Recorded vertical Short: ${(finalBlob.size / (1024 * 1024)).toFixed(2)} MB (${(durationMs / 1000).toFixed(1)}s)`
        });
      };

      this.mediaRecorder.start(250); // Emit chunk every 250ms
      useStudioStore.getState().setRecordingState({
        isRecording: true,
        recordedBlob: null,
        videoUrl: null,
        durationMs: 0,
        fileSizeBytes: 0,
        error: null
      });

      useStudioStore.getState().addLogEvent({
        beat: 'RECORDER',
        type: 'info',
        message: `Started recording 9:16 vertical Short at ${fps} FPS.`
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      useStudioStore.getState().setRecordingState({
        isRecording: false,
        error: `Recording initialization failed: ${message}`
      });
      return false;
    }
  }

  /** Stops recording and triggers blob generation */
  public stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
}

export const VideoRecorder = new VideoRecorderEngine();
