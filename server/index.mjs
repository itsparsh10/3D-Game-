import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderMedia,
  makeCancelSignal,
} from "@remotion/renderer";
const root = path.resolve("output");
fs.mkdirSync(root, { recursive: true });
const db = path.join(root, "jobs.json");
let jobs = fs.existsSync(db) ? JSON.parse(fs.readFileSync(db, "utf8")) : [];
for (const j of jobs)
  if (["rendering", "queued"].includes(j.status)) {
    j.status = "error";
    j.error = "Server restarted. Submit the recording again.";
  }
const save = () => fs.writeFileSync(db, JSON.stringify(jobs, null, 2));
save();
const cancels = new Map();
let bundlePromise;
const browserExecutable =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
async function render(job) {
  try {
    job.status = "rendering";
    save();
    bundlePromise ||= bundle({
      entryPoint: path.resolve("src/video/Composition.tsx"),
    });
    const serveUrl = await bundlePromise;
    const inputProps = job.props;
    const composition = await selectComposition({
      serveUrl,
      id: "GloopEpisode",
      inputProps,
      browserExecutable,
    });
    const { cancel, cancelSignal } = makeCancelSignal();
    cancels.set(job.id, cancel);
    if (job.status === "cancelled") {
      cancel();
      return;
    }
    await renderMedia({
      serveUrl,
      composition,
      inputProps,
      outputLocation: path.join(root, job.id + ".mp4"),
      codec: "h264",
      pixelFormat: "yuv420p",
      audioCodec: "aac",
      browserExecutable,
      cancelSignal,
      concurrency: 2,
      onProgress: ({ progress }) => {
        job.progress = Math.round(progress * 100);
        save();
      },
    });
    const normalized = path.join(root, job.id + "-normalized.mp4");
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        path.join(root, job.id + ".mp4"),
        "-vf",
        "scale=in_range=full:out_range=limited",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-pix_fmt",
        "yuv420p",
        "-color_range",
        "tv",
        "-c:a",
        "copy",
        "-movflags",
        "+faststart",
        normalized,
      ],
      { stdio: "ignore" },
    );
    fs.renameSync(normalized, path.join(root, job.id + ".mp4"));
    const info = JSON.parse(
      execFileSync(
        "ffprobe",
        [
          "-v",
          "error",
          "-show_streams",
          "-show_format",
          "-of",
          "json",
          path.join(root, job.id + ".mp4"),
        ],
        { encoding: "utf8" },
      ),
    );
    const v = info.streams.find((s) => s.codec_type === "video"),
      a = info.streams.find((s) => s.codec_type === "audio");
    if (
      !v ||
      v.codec_name !== "h264" ||
      v.pix_fmt !== "yuv420p" ||
      v.width !== composition.width ||
      v.height !== composition.height ||
      v.avg_frame_rate !== "30/1" ||
      !a ||
      Math.abs(Number(info.format.duration) - inputProps.duration) > 0.2
    )
      throw Error("Output validation failed");
    job.status = "complete";
    job.progress = 100;
    job.validation = {
      width: v.width,
      height: v.height,
      fps: v.avg_frame_rate,
      codec: v.codec_name,
      audio: a.codec_name,
      duration: info.format.duration,
    };
    job.url = "/media/" + job.id + ".mp4";
    save();
  } catch (e) {
    job.status = job.status === "cancelled" ? "cancelled" : "error";
    job.error = String(e);
    save();
  } finally {
    cancels.delete(job.id);
  }
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:4174");
  const origin = req.headers.origin;
  if (
    origin &&
    !/^http:\/\/(127\.0\.0\.1|localhost):(5173|4174)$/.test(origin)
  ) {
    res.writeHead(403).end();
    return;
  }
  const json = (data, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  if (req.method === "GET" && url.pathname === "/api/jobs") return json(jobs);
  if (req.method === "POST" && url.pathname === "/api/jobs") {
    try {
      const meta = JSON.parse(
        decodeURIComponent(req.headers["x-gloop-meta"] || ""),
      );
      if (
        !meta.episode ||
        !["victory", "defeat"].includes(meta.result) ||
        !Number.isFinite(meta.duration) ||
        meta.duration <= 0 ||
        meta.duration > 90
      )
        throw Error("Record a finished run before export.");
      const chunks = [];
      let bytes = 0;
      for await (const c of req) {
        bytes += c.length;
        if (bytes > 150 * 1024 * 1024) throw Error("Recording exceeds 150 MB");
        chunks.push(c);
      }
      const id = crypto.randomUUID();
      fs.writeFileSync(path.join(root, id + ".webm"), Buffer.concat(chunks));
      fs.writeFileSync(
        path.join(root, id + ".json"),
        JSON.stringify(meta, null, 2),
      );
      const job = {
        id,
        status: "queued",
        progress: 0,
        created: new Date().toISOString(),
        props: {
          src: `http://127.0.0.1:4174/media/${id}.webm`,
          title: meta.episode.title,
          duration: meta.episode.durationSeconds,
          target: meta.episode.targetOrbs,
          score: meta.orbs,
          result: meta.result,
          events: meta.events,
          landscape: meta.landscape,
        },
      };
      jobs.unshift(job);
      save();
      json(job, 202);
      void render(job);
    } catch (e) {
      json({ error: String(e) }, 400);
    }
    return;
  }
  if (req.method === "POST" && url.pathname.startsWith("/api/cancel/")) {
    const id = url.pathname.split("/").pop(),
      job = jobs.find((j) => j.id === id);
    if (job && ["queued", "rendering"].includes(job.status)) {
      job.status = "cancelled";
      cancels.get(id)?.();
      save();
    }
    return json({ ok: true });
  }
  if (
    req.method === "GET" &&
    /^\/media\/[a-f0-9-]+\.(mp4|webm|json)$/.test(url.pathname)
  ) {
    const file = path.join(root, path.basename(url.pathname));
    if (!fs.existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    const size = fs.statSync(file).size;
    const type = file.endsWith(".mp4")
      ? "video/mp4"
      : file.endsWith(".webm")
        ? "video/webm"
        : "application/json";
    const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    if (range) {
      const start = Number(range[1]),
        end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      res.writeHead(206, {
        "Content-Type": type,
        "Content-Length": end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
      });
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Type": type,
        "Content-Length": size,
        "Accept-Ranges": "bytes",
      });
      fs.createReadStream(file).pipe(res);
    }
    return;
  }
  res.writeHead(404).end();
});
server.listen(4174, "127.0.0.1", () =>
  console.log("Gloop render API: http://127.0.0.1:4174"),
);
