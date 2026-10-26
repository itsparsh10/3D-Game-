import { useEffect, useState } from "react";
import { useStudioStore } from "../store/studioStore";
import { VideoRecorder } from "../game/recording/VideoRecorder";
type Job = {
  id: string;
  status: string;
  progress: number;
  error?: string;
  url?: string;
  validation?: { width: number; height: number; audio: string };
};
export function ExportPanel() {
  const recording = useStudioStore((s) => s.recording);
  const [jobs, setJobs] = useState<Job[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const refresh = () =>
    fetch("/api/jobs")
      .then((r) => {
        if (!r.ok) throw Error("Start the render service with npm run server.");
        return r.json();
      })
      .then(setJobs)
      .catch((e) => setError(String(e)));
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2500);
    return () => clearInterval(id);
  }, []);
  async function render() {
    if (!recording.recordedBlob || !VideoRecorder.metadata) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Gloop-Meta": encodeURIComponent(
            JSON.stringify(VideoRecorder.metadata),
          ),
        },
        body: recording.recordedBlob,
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const metadata = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(VideoRecorder.metadata, null, 2)], {
        type: "application/json",
      }),
    );
    a.download = "gloop-run.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  return (
    <section className="my-6 p-5 rounded-2xl border border-cyan-800 bg-slate-900">
      <h3 className="font-bold text-lg">Production render · Remotion</h3>
      <p className="text-xs text-slate-400 my-2">
        Real footage + event-driven score + actual result. H.264 MP4, 30 FPS,
        mixed audio.
      </p>
      <div className="flex gap-3 my-4">
        <button
          disabled={busy || !recording.recordedBlob}
          onClick={render}
          className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold disabled:opacity-40"
        >
          {busy ? "Uploading…" : "Render MP4"}
        </button>
        <button disabled={!VideoRecorder.metadata} onClick={metadata}>
          Save replay metadata
        </button>
      </div>
      {error && (
        <p role="alert" className="text-amber-300 text-sm">
          {error}
        </p>
      )}
      {jobs.map((j) => (
        <div key={j.id} className="border-t border-slate-700 py-4">
          <strong>
            {j.status} · {j.progress}%
          </strong>
          {["queued", "rendering"].includes(j.status) && (
            <button
              className="ml-4 text-rose-300"
              onClick={async () => {
                await fetch("/api/cancel/" + j.id, { method: "POST" });
                refresh();
              }}
            >
              Cancel
            </button>
          )}
          {j.error && (
            <p className="text-xs text-rose-300 break-all">{j.error}</p>
          )}
          {j.url && (
            <>
              <video className="max-h-80 my-3" src={j.url} controls />
              <a className="text-cyan-300" href={j.url} download>
                Download validated MP4
              </a>
              <p className="text-xs">
                {j.validation?.width} × {j.validation?.height} ·{" "}
                {j.validation?.audio} audio
              </p>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
