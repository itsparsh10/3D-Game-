# Gloop implementation and verification

## Run locally

- `npm install`
- `npm run dev` — player at http://localhost:5173, creator at http://localhost:5173/studio
- `npm run server` — local render service on 127.0.0.1:4174. Requires FFmpeg/ffprobe and Chrome. Set `CHROME_PATH` if Chrome is installed elsewhere.
- `npm test`, `npm run build`

## Actual implementation

Existing Vite/React/Three project retained. Standalone player, touch buttons/swipes, keyboard controls, pause on visibility loss, four environment palettes/props, rounded procedural Gloop with articulated run/jump/slide/turn/result poses, segmented road, floating scenery, seeded generation, fixed 60 Hz simulation, analytic collision shapes, moving pendulum hammers, full-width jumping rollers, rotating padded barriers, closing doors, sliding blocks, bounce pads, positive/negative gates, color-sensitive pickups, speed and gravity twists. No external API key required.

Studio keeps its episode library, world selection, duration/difficulty/seed controls, audio controls, viewport selection, and adds a constrained topic parser, an eight-beat timeline, master volume and local external-music loading. The parser recognizes world, target, duration and gravity/speed/color mechanics; it is not an unrestricted natural-language level generator.

Manual recording respects the selected control mode. Choose Bot Autoplay before recording for automatic production. Canvas capture is scaled to portrait 1080×1920 or landscape 1920×1080 and records the shared Web Audio mix. It automatically stops two seconds after the real result. Preview the capture in Shorts Export, then render an MP4. Remotion adds the challenge, event-driven progress, twist label, actual result and branding. The server validates H.264, yuv420p, 30 FPS, dimensions, duration and presence of audio with ffprobe before declaring completion. Jobs, source captures, input/event metadata and outputs are stored under `output/`. Cancel and error states are persistent. `output/` is ignored by Git.

`src/utils/replay.ts` reproduces saved inputs using the same simulation. Level generation, bot decisions and hazard movement share deterministic simulation time. Live synthesized music and cosmetic idle animation are not offline frame-driven. Remotion is an offline compositor of real captured footage; there is no offline 3D rerenderer yet.

## Art replacement interface

`src/game/characters/Gloop.tsx` owns the canonical character, palette and articulated hierarchy. A future GLB should preserve approximately 2-unit height, origin at ground contact, +Z facing direction and the state's playerX/Y/Z transform. Replace the mesh hierarchy without changing simulation/collision rules. Current assets are procedural geometry, not production sculpted models or the reference artwork. SoundManager's synthesized soundtrack is a functional original prototype; it is not a studio-recorded soundtrack.

## Known scope gaps

The entire master prompt is larger than the implemented game. Not yet implemented: remaining hazard families (moving platforms, real gaps, disappearing tiles), imported production art, all thirteen distinct animation states, a full pooled VFX library, arbitrary obstacle-count editing, and offline deterministic 3D video rendering. Current renderer captures real gameplay before compositing; browser capture frame pacing depends on the machine. Mobile/Safari performance requires device testing. Browser MP4 capture depends on codec support; server exports H.264 MP4.

These are remaining production tasks, not completed acceptance items. The game is a playable procedural-art implementation and must not be described as a match for the reference render quality.

## Verified in this environment

- TypeScript and Vite production build pass. Vite reports the Three.js bundle exceeds its 500 KB warning threshold.
- Fourteen Vitest checks pass, including 30/45/60-second wins, deterministic controller logs, input replay, pause, reset and color-flip scoring.
- Desktop and 390×844 browser views exercised with Playwright; collection, twist, hazard and result screenshots captured.
- A real 30-second-class automated run was captured at 1080×1920 with VP8 and Opus; Remotion composited the recorded events and result.
- Final normalization produces H.264/yuv420p at 30 FPS with AAC; FFmpeg detected non-silent audio.
- Actual Safari, physical mobile devices, imported production models, and all requested animation/VFX families have not been verified or completed.
