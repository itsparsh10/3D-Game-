# Gloop’s Glitch Lab

A playable Three.js obstacle runner and local video-production studio, upgraded in the existing React / TypeScript / Vite project.

## Start

```sh
npm install
npm run dev
```

Open **http://localhost:5173/** to play or **http://localhost:5173/studio** for the creator studio.

- Left/right arrows or A/D: change lane
- Space/up/W: jump
- Down/S: slide
- Escape: pause/resume
- Mobile: swipe or use the on-screen controls

The player is manual by default. Collect the safe-colored orbs, choose reward gates, jump rollers and avoid moving hazards. A run ends with its real score and result.

## Make a video

In a second terminal:

```sh
npm run server
```

The local renderer requires Chrome and FFmpeg/ffprobe. On macOS it defaults to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; override with `CHROME_PATH` on another installation.

1. Open the studio. Choose an episode, world, duration, seed and difficulty.
2. Choose Manual Controls or Bot Autoplay explicitly.
3. Select the portrait or landscape preview and click **Record YouTube Short**.
4. Play or let the deterministic controller run. Capture stops after the actual result.
5. Open **Shorts Export**, preview the recording and click **Render MP4**.
6. Review the validated output and download it. Cancel or inspect errors in the same panel.

Remotion composites real gameplay footage with the event-driven score and actual result. FFmpeg normalizes H.264/yuv420p and ffprobe checks the finished file. Jobs, captures, metadata and MP4s persist under `output/`. No paid API or language-model provider is needed. The topic box is a constrained preset parser.

## Checks

```sh
npm test
npm run build
```

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for implemented features, reproduction details, art replacement interfaces, verification and explicit remaining scope. The visuals and synthesized audio are procedural prototypes; this repository does not claim to reproduce the cinematic reference artwork or complete every production feature in the master prompt.
