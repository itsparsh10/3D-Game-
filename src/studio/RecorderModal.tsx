import React, { useState } from 'react';
import { Check, Copy, Download, Film, Sparkles, Video, Youtube } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useStudioStore } from '../store/studioStore';

export const RecorderModal: React.FC = () => {
  const recording = useStudioStore((state) => state.recording);
  const activeEpisode = useGameStore((state) => state.activeEpisode);
  const [copiedFfmpeg, setCopiedFfmpeg] = useState(false);

  const ffmpegCommand = `ffmpeg -i gloop_short.webm -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k gloop_short_1080x1920.mp4`;

  const handleCopyFfmpeg = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopiedFfmpeg(true);
    setTimeout(() => setCopiedFfmpeg(false), 2000);
  };

  const handleDownload = () => {
    if (!recording.videoUrl) return;
    const a = document.createElement('a');
    a.href = recording.videoUrl;
    const sanitizedTitle = activeEpisode.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `gloop_short_${sanitizedTitle}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto font-['Outfit'] select-none">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white font-['Fredoka']">
              YouTube Shorts Recording & Export
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Recorded in 9:16 vertical viewport with synchronized 3D graphics & audio.
            </p>
          </div>
          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Youtube className="w-4 h-4 text-red-500" />
            1080 × 1920 Format
          </span>
        </div>

        {/* --- MAIN PREVIEW & CONTROLS --- */}
        {recording.videoUrl ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* 9:16 Video Player Container */}
            <div className="md:col-span-5 flex justify-center">
              <div className="w-64 aspect-[9/16] bg-slate-900 border-2 border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.25)] relative">
                <video
                  src={recording.videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Video Metadata & Export Actions */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* Info Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400" />
                  Recording Metadata
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Episode Title</span>
                    <span className="text-white font-bold">{activeEpisode.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Duration</span>
                    <span className="text-cyan-300 font-mono font-bold">
                      {(recording.durationMs / 1000).toFixed(1)} seconds
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Aspect Ratio</span>
                    <span className="text-white font-mono font-bold">9:16 Vertical</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">File Size</span>
                    <span className="text-amber-300 font-mono font-bold">
                      {(recording.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 font-['Fredoka']"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                Download Video (.webm)
              </button>

              {/* FFmpeg Conversion Helper */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Convert to H.264 MP4 (Mac Terminal)
                  </span>
                  <button
                    onClick={handleCopyFfmpeg}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedFfmpeg ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Command
                      </>
                    )}
                  </button>
                </div>
                <code className="text-[11px] bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-300 font-mono block overflow-x-auto select-all">
                  {ffmpegCommand}
                </code>
              </div>

              {/* Suggested YouTube Shorts Metadata */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 text-xs">
                <span className="text-slate-400 font-bold block mb-1">
                  Ready-to-Post Shorts Title & Tags:
                </span>
                <p className="text-cyan-300 font-medium select-all">
                  {activeEpisode.title} 🏃‍♂️💨 | Gloop's Glitch Lab #Shorts #Gaming #3DRunner
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State when no recording has taken place yet */
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-md">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-['Fredoka']">
              No Recording Generated Yet
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Head to the <strong>Studio Dashboard</strong>, configure your episode challenge, and click{' '}
              <strong className="text-rose-400">"Record YouTube Short"</strong>. The studio will capture the complete 30-second run with audio in vertical 9:16 format!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
