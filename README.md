# Gloop's Glitch Lab 🎮✨
> **One challenge. One run. Thirty seconds.**  
> A premium 3D browser-game and YouTube Shorts studio.

---

## 🌟 Overview
**Gloop's Glitch Lab** is a 3D browser game and creator studio engineered to produce original, playable challenge worlds and turn each run into a vertical (9:16) video ready for YouTube Shorts.

The audience sees a tiny turquoise jelly hero (**Gloop**) facing an impossible obstacle course: collecting glowing blue energy orbs, surviving giant swinging hammers and spinning spike rollers, making split-second decisions at mathematical choice gates, encountering the villain **Glitchmaker**, and racing toward the grand golden portal.

---

## 🚀 Key Features

### 1. Stylized 3D Character & Procedural Animation
- **Gloop**: Translucent turquoise jelly body, orange sneakers with white soles, large expressive eyes with catchlights, and cute eyebrows.
- **Procedural squash & stretch**: Dynamic running cycles, bouncy stretch during jumps, pancake squashes when sliding, and ecstatic victory dances.
- **Pip**: The golden floating star guide who hovers near Gloop giving encouragement.
- **Glitchmaker**: The floating purple voxel-glitch villain with angry glowing yellow eyes.

### 2. Four Data-Driven World Themes
- **Sky Islands**: Floating emerald platforms, blue skies, distant castles, waterfalls, and golden finish portals.
- **Candy World**: Pastel pink roadways, oversized gumdrop hills, lollipop spires, and playful colors.
- **Ice World**: Frosted platforms, deep blue sapphire ice crystal spires, and falling snow particles.
- **Lava World**: Obsidian bridges hovering above churning fiery magma and crackling embers.

### 3. Reusable Obstacles & Mechanics
- **Swinging Hammers**: Heavy pendulums swinging across lanes (requires lane switches or slide ducks).
- **Spike Rollers**: Spinning spiky axles on the ground (must be jumped over).
- **Choice Gates**: Split-second math and color decisions (+5 Orbs vs -3 Orbs).
- **Bounce Pads**: High-velocity launch pads with bonus orb arcs.
- **Finish Portal**: Golden arch with swirling portal vortex, crown emblem, and victory trigger.

### 4. Six-Beat Narrative Timeline (~30s Short)
1. **Beat 1 — HOOK (0–3s)**: High-tension objective display (`"20 ORBS? ONE RUN."`).
2. **Beat 2 — COLLECT (3–8s)**: Fast orb pickups, escalating combo counter, bright chimes.
3. **Beat 3 — TWIST (8–14s)**: Decision gates or Glitchmaker appearance.
4. **Beat 4 — HARD OBSTACLES (14–22s)**: Moving hammers, spike rollers, rapid reflexes.
5. **Beat 5 — FINAL RUN (22–28s)**: Golden portal in sight, score closing in on target.
6. **Beat 6 — RESULT (28–30s)**: Unambiguous victory fanfare with confetti or defeat cue.

### 5. Creator Studio Dashboard & 9:16 Shorts Viewport
- **Viewport Switcher**: Switch between **Shorts (9:16)** with YouTube mobile safe area guides, **Desktop (16:9)**, and **Full Canvas**.
- **Episode Inspector**: Customize Title, World Theme, Target Orbs, Challenge Duration (30s/45s/60s), Difficulty (Easy/Medium/Hard/Chaos), Twist, and Deterministic Seed.
- **Automated Bot Controller**: Toggle between manual gameplay and automated bot autoplay for recording hands-free pristine runs.
- **Audio Synthesizer**: Procedural Web Audio API sound effects and upbeat synth BGM, fully routable to the video stream.
- **Shorts Recorder**: Captures the canvas and synchronized audio into a 9:16 vertical video with instant in-browser playback and `.webm` download.

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript + Vite
- **3D Engine**: Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)
- **State Management**: Zustand
- **Styling**: Tailwind CSS + Custom Design System
- **Audio**: Web Audio API (procedural synthesis & audio routing)
- **Video Capture**: HTML5 Canvas Stream + MediaRecorder API
- **Testing**: Vitest

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🎮 Controls

### Desktop Keyboard
- `A` / `D` or `←` / `→`: Switch Lanes (Left / Right)
- `Space` / `W` / `↑`: Jump
- `S` / `↓`: Slide / Duck under swinging hammers
- `Esc`: Pause / Resume

### Mobile / Touch
- Responsive on-screen directional and action buttons located safely at the bottom of the viewport.

### Automated Demo Mode
- Click **"Bot Autoplay (Demo)"** in the studio sidebar or inspector to let the bot pilot Gloop through the challenge automatically.

---

## 📹 Recording & Exporting YouTube Shorts

1. Set your preferred episode parameters (or pick one of the 5 presets in **Episode Library**).
2. Click **"Record YouTube Short (9:16)"** in the Inspector panel.
3. The studio automatically synchronizes a 3-second countdown, starts the run, and captures the 3D graphics and procedural audio.
4. When Gloop reaches the finish portal, the recording automatically stops.
5. In the **Shorts Export** tab:
   - Preview the vertical video inside the 9:16 player.
   - Click **Download Video (.webm)**.
   - To convert to standard H.264 MP4 using FFmpeg on your Mac terminal:
     ```bash
     ffmpeg -i gloop_short.webm -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k gloop_short_1080x1920.mp4
     ```

---

## 📂 Project Architecture
```
gloops-glitch-lab/
├── public/
│   └── assets/
│       ├── models/
│       ├── textures/
│       └── audio/
├── src/
│   ├── config/
│   │   ├── episodes.ts        # Presets EP 001 - 005
│   │   └── worlds.ts          # 4 World themes (Sky Islands, Candy, Ice, Lava)
│   ├── game/
│   │   ├── audio/
│   │   │   └── SoundManager.ts# Web Audio API synthesizer + stream routing
│   │   ├── camera/
│   │   │   └── GameCamera.tsx # Chase camera, lookahead, shake, victory orbit
│   │   ├── characters/
│   │   │   ├── Gloop.tsx      # Procedural 3D Gloop character + sneakers
│   │   │   ├── Pip.tsx        # Floating star guide
│   │   │   └── Glitchmaker.tsx# Purple glitch-cube villain
│   │   ├── obstacles/
│   │   │   ├── SwingingHammer.tsx
│   │   │   ├── SpikeRoller.tsx
│   │   │   ├── ChoiceGate.tsx # +5 / -3 math/color choice gates
│   │   │   └── BouncePad.tsx
│   │   ├── pickups/
│   │   │   └── BlueOrb.tsx    # Luminous collectible blue orbs
│   │   ├── physics/
│   │   │   └── useBotController.ts # Automated demo autopilot
│   │   ├── recording/
│   │   │   └── VideoRecorder.ts # Canvas + WebAudio MediaRecorder engine
│   │   ├── ui/
│   │   │   ├── GameOverlay.tsx# In-game HUD, Hook banner, mobile safe zone
│   │   │   ├── VictoryModal.tsx# Confetti celebration modal
│   │   │   └── DefeatModal.tsx
│   │   ├── worlds/
│   │   │   ├── Environment.tsx# Dynamic lighting, fog, floating scenery
│   │   │   └── Track.tsx      # Modular 3-lane road & golden finish arch
│   │   └── GameScene.tsx      # Three.js R3F Master Canvas
│   ├── store/
│   │   ├── gameStore.ts       # Zustand store for run physics and beats
│   │   └── studioStore.ts     # Zustand store for creator UI and recording
│   ├── studio/
│   │   ├── EpisodeLibrary.tsx # Curated episode cards
│   │   ├── Inspector.tsx      # Live challenge configurator
│   │   ├── RecorderModal.tsx  # Video preview, download, and FFmpeg tools
│   │   ├── SettingsView.tsx   # Audio and overlay controls
│   │   ├── Sidebar.tsx        # Studio navigation
│   │   ├── StudioLayout.tsx   # Master studio layout
│   │   ├── TimelineBar.tsx    # 6-beat interactive scrubber
│   │   └── WorldsShowcase.tsx # 4 world showcases
│   ├── types/
│   │   ├── game.ts            # Core types
│   │   └── studio.ts
│   ├── utils/
│   │   ├── levelGenerator.ts  # Deterministic 6-beat level layout generator
│   │   └── rng.ts             # Mulberry32 PRNG
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   └── game.test.ts           # Vitest suite
├── package.json
└── vite.config.ts
```

---

## 🏆 The Five Signature Episodes
- **EP 001 — Can Gloop Collect 20 Orbs?**: Sky Islands, 30s, easy introduction to swinging hammers and choice gates.
- **EP 002 — One Hit Ends This Run!**: Candy World, 30s, hardcore zero-hit survival mode.
- **EP 003 — Blue or Red Choice Gates?**: Sky Islands, 30s, every choice gate (+5 vs -3) determines success.
- **EP 004 — Glacial Rush & Giant Hammers**: Ice World, 30s, slippery low-gravity high speed course.
- **EP 005 — Escape the Glitchmaker!**: Lava World, 30s, chaos difficulty with Glitchmaker boss attacks.
