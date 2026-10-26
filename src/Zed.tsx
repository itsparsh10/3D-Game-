import React, { useState } from 'react';

/**
 * ============================================================================
 * GLOOP'S GLITCH LAB — MASTER PROJECT BRIEF & SOLUTION ARCHITECTURE
 * File: Zed.tsx
 * ============================================================================
 *
 * This file serves as the definitive reference for "Gloop's Glitch Lab",
 * consolidating the complete project brief, architectural blueprints, canonical
 * episode configurations (001-010), multi-phase roadmap, and risk register.
 */

// ----------------------------------------------------------------------------
// 1. DATA CONTRACTS & TYPES
// ----------------------------------------------------------------------------

export type WorldType = 'sky' | 'candy' | 'ice' | 'lava';

export type BeatKind =
  | 'hook'
  | 'orbRows'
  | 'gate'
  | 'twist'
  | 'hazard'
  | 'finalArch'
  | 'result';

export type TwistType = 'ruleFlip' | 'gravity' | 'speed';
export type HazardType = 'hammer' | 'saw' | 'roller' | 'spinner' | 'movingBlock';
export type GloopMood = 'happy' | 'surprised' | 'determined' | 'scared' | 'sad' | 'win';
export type GlitchmakerState = 'normal' | 'angry' | 'glitch' | 'laugh';

export type Beat =
  | { t: number; kind: 'hook'; text: string }
  | { t: number; kind: 'orbRows'; color: 'blue' | 'red'; rows: number }
  | { t: number; kind: 'gate'; left: number; right: number }
  | { t: number; kind: 'twist'; type: TwistType; text: string }
  | { t: number; kind: 'hazard'; type: HazardType; count: number }
  | { t: number; kind: 'finalArch' }
  | { t: number; kind: 'result' };

export interface CanonicalEpisode {
  id: number;
  code: string;
  title: string;
  world: WorldType;
  target: number;
  hearts: number;
  duration: 30;
  seed: number;
  challenge: string;
  mechanic: string;
  newWorkBeyondEp001: string;
  beats: Beat[];
}

export interface PhaseItem {
  phase: number;
  name: string;
  focus: string;
  exitCriteria: string;
}

export interface RiskItem {
  risk: string;
  impact: string;
  mitigation: string;
}

// ----------------------------------------------------------------------------
// 2. PROJECT BRIEF (MASTER SPECIFICATION)
// ----------------------------------------------------------------------------

export const PROJECT_BRIEF = {
  title: "GLOOP'S GLITCH LAB",
  tagline: "Run. Fail. Learn. Again.",
  format: "1080x1920, 9:16 vertical, 30s duration, 30fps, H.264 MP4 export",
  repo: "github.com/itsparsh10/3D-Game-",

  sections: [
    {
      id: "1-what-it-is",
      title: "1. What It Is",
      content: `A 3D obstacle-runner game used as a video factory. One challenge, one run, thirty seconds. A creator types a challenge prompt, the game procedurally generates the level, executes a deterministic run, composites live text/score/music overlays, and exports a vertical YouTube Short (1080x1920, 30s, 30fps, H.264).`
    },
    {
      id: "2-the-character-gloop",
      title: "2. The Character: Gloop",
      content: `Glossy cyan jelly blob, big white eyes with dark pupils, wide expressive mouth, small arms, orange sneakers with white soles. Six distinct moods: happy, surprised, determined, scared, sad, win. Crucial mechanic: Gloop starts small and GROWS as orbs are collected. Collected orbs form a chain of glossy spheres trailing under him. On the win screen, he stands crowned on top of the stacked orb chain.`
    },
    {
      id: "3-the-villain-glitchmaker",
      title: "3. The Villain: Glitchmaker",
      content: `Purple glowing voxel-cube with angry orange eyes. Four reactive states: normal, angry, glitch, laugh. Causes unexpected mid-run twists (rule flips, gravity flips, speed overdrive).`
    },
    {
      id: "4-worlds",
      title: "4. Worlds (Visually Distinct)",
      content: `Four distinct environments with unique skies, tracks, rails, props, and visual FX:
- Sky Islands: Floating fantasy castles, round trees, clouds, golden light.
- Candy Factory: Pastel pink roadway, oversized lollipops, sprinkles, gumdrops.
- Ice World: Frosted reflective tracks, deep sapphire icebergs, falling snow.
- Lava Land: Dark basalt/obsidian floor, glowing magma fissures, crackling embers.`
    },
    {
      id: "5-core-rules",
      title: "5. Core Rules",
      content: `- Target N orbs before timer ends. Blue = good, red = bad; a RULE FLIP swaps them mid-run with HUD sync.
- Gates: Green is ALWAYS positive (+5), Red ALWAYS negative (-3).
- Hazards: Swinging red hammers, saw blades, rollers, spinners, moving blocks.
- Hearts vary per episode (e.g. hearts: 1 for "one hit ends the run").
- Run ends at a golden "FINAL TEST" arch with clear WIN or FAIL screen.
- Inputs: Left/right lanes, jump, slide (desktop keys, mobile swipe, touch buttons).`
    },
    {
      id: "6-the-30-second-structure",
      title: "6. The 30-Second Structure (Six Narrative Beats)",
      content: `0-3s: HOOK — "CAN I REACH 20?" (Immediate tension, objective in view)
4-8s: COLLECT & GROW — Rapid orb pickups, orb chain elongates under Gloop
9-14s: TWIST — "RULE FLIP!" (Glitchmaker appears, color inversion or speed surge)
15-22s: HARD OBSTACLES — Swinging hammers, rotating rollers, platform gaps
23-28s: FINAL RUN — Golden finish arch approaching, orb counter countdown
29-30s: RESULT — "WIN!" (Crowned Gloop on orb stack with fanfare or gentle defeat)`
    },
    {
      id: "7-episodes",
      title: "7. Canonical Episodes (001 - 010)",
      content: `Canonical numbering from the Glitch Lab board:
001 Grow to 20 | 002 One hit ends this run | 003 Blue or Red? | 004 Giant mode | 005 Survive the hammers | 006 Collect 30 gems | 007 Gravity flip | 008 Tiny to giant | 009 Escape the maze | 010 Final boss.`
    },
    {
      id: "8-visual-target",
      title: "8. Visual Target",
      content: `Polished stylized 3D in the Stumble Guys / Pixar-toy aesthetic: glossy materials, soft lighting, reflections, bloom, saturated colors, chunky rounded props, checkered track with striped rails, readable large typography HUD.`
    },
    {
      id: "9-tech-stack-and-architecture",
      title: "9. Tech Stack & Three-Layer Architecture",
      content: `React + TypeScript + Vite + Three.js + React Three Fiber + Drei + Zustand; deterministic fixed-60Hz simulation with seeded PRNG; Playwright capture; Remotion compositing; FFmpeg/ffprobe normalization; /studio creator page.
CARDINAL RULE: Simulation is 100% decoupled from Rendering. Visual work must NEVER modify simulation, collision, seeding, or replay logic.`
    },
    {
      id: "10-current-state",
      title: "10. Current State (Honest Assessment)",
      content: `Works: Playable runner, studio, bot autoplay, recording pipeline, MP4 export, tests.
Gaps to Close: Procedural primitives need richer lighting/bevels; Gloop needs facing camera in hook/win shots; growth needs orb-chain stack; track needs checkered/striped finish; hazard variety expansion.`
    },
    {
      id: "11-how-to-work",
      title: "11. How to Work (Verification Protocol)",
      content: `Vertical slice first: Sky Islands + Episode 001 must reach quality parity before other worlds/episodes. Work in strict phases. After each phase, run tests and build, take screenshots of all 6 story beats at 1080x1920, and compare against references.`
    }
  ]
};

// ----------------------------------------------------------------------------
// 3. ARCHITECTURE BLUEPRINT: THREE LAYERS WITH ONE RULE
// ----------------------------------------------------------------------------

export const ARCHITECTURE_SPEC = {
  rule: "Simulation is separate from Rendering. Visual work must never alter simulation, collision, seeding, or replay.",
  layers: [
    {
      name: "EPISODE CONFIG (Data Layer)",
      responsibility: "Defines WHAT happens and WHEN. Pure declarative data schemas.",
      inputs: "Seed, world, target, hearts, beat triggers (hook, orbRows, gate, twist, hazard, arch, result).",
      files: ["src/config/episodes.ts", "src/types/game.ts"]
    },
    {
      name: "SIMULATION (Deterministic Layer)",
      responsibility: "Fixed 60Hz physics, collision detection, seeded Mulberry32 generation, rules, bot controller, input replay.",
      inputs: "Player state (x, y, z, lane, isGrounded), hazard hitboxes, score, elapsed time.",
      files: ["src/utils/rules.ts", "src/utils/levelGenerator.ts", "src/utils/replay.ts", "src/store/gameStore.ts"]
    },
    {
      name: "VIEW (Three.js & Presentation Layer)",
      responsibility: "Visuals, shaders, glossy materials, lighting, dynamic camera, squash-and-stretch animation, particle FX, HUD overlays.",
      inputs: "Interpolated render states, Three.js meshes, R3F canvas, Remotion compositions.",
      files: ["src/game/GameScene.tsx", "src/game/characters/Gloop.tsx", "src/game/worlds/Environment.tsx", "src/game/ui/GameOverlay.tsx"]
    }
  ]
};

// ----------------------------------------------------------------------------
// 4. CANONICAL EPISODES 001 TO 010
// ----------------------------------------------------------------------------

export const CANONICAL_EPISODES: CanonicalEpisode[] = [
  {
    id: 1,
    code: "EP-001",
    title: "Grow to 20",
    world: "sky",
    target: 20,
    hearts: 3,
    duration: 30,
    seed: 1001,
    challenge: "Collect 20 orbs, survive rule flip and swinging hammers to reach the arch.",
    mechanic: "Collect & Grow chain, Rule flip at 10s, swinging hammers",
    newWorkBeyondEp001: "The primary vertical slice to perfect first.",
    beats: [
      { t: 0, kind: 'hook', text: "CAN GLOOP GROW TO 20?" },
      { t: 4, kind: 'orbRows', color: 'blue', rows: 6 },
      { t: 9, kind: 'twist', type: 'ruleFlip', text: "RULE FLIP! RED = GOOD!" },
      { t: 15, kind: 'hazard', type: 'hammer', count: 3 },
      { t: 23, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  },
  {
    id: 2,
    code: "EP-002",
    title: "One Hit Ends This Run",
    world: "candy",
    target: 25,
    hearts: 1,
    duration: 30,
    seed: 2048,
    challenge: "Zero margin for error: a single collision immediately terminates the run.",
    mechanic: "hearts: 1, high hazard density, dramatic hit slow-mo",
    newWorkBeyondEp001: "Config-only variation + dramatic defeat slow-motion camera effect.",
    beats: [
      { t: 0, kind: 'hook', text: "ONE HIT = GAME OVER!" },
      { t: 4, kind: 'orbRows', color: 'blue', rows: 8 },
      { t: 12, kind: 'hazard', type: 'roller', count: 4 },
      { t: 18, kind: 'hazard', type: 'saw', count: 3 },
      { t: 24, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  },
  {
    id: 3,
    code: "EP-003",
    title: "Blue or Red?",
    world: "sky",
    target: 22,
    hearts: 2,
    duration: 30,
    seed: 777,
    challenge: "Multiple choice gates in rapid succession test decision-making under pressure.",
    mechanic: "Gate choice (+5 / -3) combined with mid-run color flip",
    newWorkBeyondEp001: "Expanded choice-gate patterns and branch paths.",
    beats: [
      { t: 0, kind: 'hook', text: "BLUE OR RED? CHOOSE FAST!" },
      { t: 5, kind: 'gate', left: 5, right: -3 },
      { t: 11, kind: 'twist', type: 'ruleFlip', text: "COLORS FLIPPED!" },
      { t: 16, kind: 'gate', left: -3, right: 5 },
      { t: 23, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  },
  {
    id: 4,
    code: "EP-004",
    title: "Giant Mode",
    world: "ice",
    target: 30,
    hearts: 2,
    duration: 30,
    seed: 4096,
    challenge: "Gloop expands to giant scale, stomping through oversized obstacles.",
    mechanic: "Scale power-up modifying hitbox dimensions and camera field-of-view",
    newWorkBeyondEp001: "Dynamic character scaling linked to simulation hitbox radius.",
    beats: [
      { t: 0, kind: 'hook', text: "GIANT MODE ACTIVATED!" },
      { t: 5, kind: 'orbRows', color: 'blue', rows: 10 },
      { t: 12, kind: 'twist', type: 'speed', text: "MEGA SPEED!" },
      { t: 16, kind: 'hazard', type: 'hammer', count: 4 },
      { t: 24, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  },
  {
    id: 5,
    code: "EP-005",
    title: "Survive the Hammers",
    world: "sky",
    target: 18,
    hearts: 3,
    duration: 30,
    seed: 5555,
    challenge: "Intense swinging hammer gauntlet requiring rhythmic slides and lane changes.",
    mechanic: "Multi-hammer synchronized pendulums with duck-under slides",
    newWorkBeyondEp001: "Synchronized dual-hammer pendulum wave patterns.",
    beats: [
      { t: 0, kind: 'hook', text: "DODGE 8 HAMMERS!" },
      { t: 4, kind: 'hazard', type: 'hammer', count: 2 },
      { t: 10, kind: 'hazard', type: 'hammer', count: 3 },
      { t: 16, kind: 'hazard', type: 'hammer', count: 3 },
      { t: 24, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  },
  {
    id: 6,
    code: "EP-006",
    title: "Collect 30 Gems",
    world: "candy",
    target: 30,
    hearts: 2,
    duration: 30,
    seed: 6030,
    challenge: "High-density collectible frenzy: gather 30 sparkling gems before time runs out.",
    mechanic: "Dense gem pickups and speed boost pads",
    newWorkBeyondEp001: "Luminous gem 3D geometry and dense pickup trails.",
    beats: [
      { t: 0, kind: 'hook', text: "CAN YOU GET 30 GEMS?" },
      { t: 3, kind: 'orbRows', color: 'blue', rows: 12 },
      { t: 14, kind: 'twist', type: 'speed', text: "SUPER BOOST!" },
      { t: 18, kind: 'orbRows', color: 'blue', rows: 8 },
      { t: 24, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  },
  {
    id: 7,
    code: "EP-007",
    title: "Gravity Flip",
    world: "ice",
    target: 20,
    hearts: 2,
    duration: 30,
    seed: 7007,
    challenge: "Glitchmaker inverts gravity, sending Gloop running upside-down on ceiling tracks.",
    mechanic: "Camera 180° roll animation and inverted jump gravity physics",
    newWorkBeyondEp001: "Track ceiling geometry and camera roll interpolation.",
    beats: [
      { t: 0, kind: 'hook', text: "GRAVITY INVERTED!" },
      { t: 5, kind: 'orbRows', color: 'blue', rows: 6 },
      { t: 10, kind: 'twist', type: 'gravity', text: "UPSIDE DOWN RUN!" },
      { t: 16, kind: 'hazard', type: 'roller', count: 3 },
      { t: 24, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  },
  {
    id: 8,
    code: "EP-008",
    title: "Tiny to Giant",
    world: "candy",
    target: 25,
    hearts: 2,
    duration: 30,
    seed: 8080,
    challenge: "Gloop starts microscopic, dodges massive rolling balls, then grows to colossal scale.",
    mechanic: "Continuous dynamic scale curve from 0.3x to 2.5x",
    newWorkBeyondEp001: "Continuous scale animation linked with audio pitch shift.",
    beats: [
      { t: 0, kind: 'hook', text: "TINY TO GIANT GLOOP!" },
      { t: 4, kind: 'orbRows', color: 'blue', rows: 8 },
      { t: 12, kind: 'twist', type: 'speed', text: "GROWTH SURGE!" },
      { t: 18, kind: 'hazard', type: 'hammer', count: 3 },
      { t: 24, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  },
  {
    id: 9,
    code: "EP-009",
    title: "Escape the Maze",
    world: "lava",
    target: 22,
    hearts: 2,
    duration: 30,
    seed: 9009,
    challenge: "A branching maze of obsidian corridors hovering above molten magma.",
    mechanic: "Branching track segments with dead-ends and jump gaps",
    newWorkBeyondEp001: "Multi-branch modular corridor track pieces.",
    beats: [
      { t: 0, kind: 'hook', text: "ESCAPE THE LAVA MAZE!" },
      { t: 4, kind: 'hazard', type: 'movingBlock', count: 3 },
      { t: 11, kind: 'twist', type: 'ruleFlip', text: "RED PATH IS SAFE!" },
      { t: 17, kind: 'hazard', type: 'saw', count: 4 },
      { t: 24, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  },
  {
    id: 10,
    code: "EP-010",
    title: "Final Boss: Glitchmaker",
    world: "lava",
    target: 25,
    hearts: 3,
    duration: 30,
    seed: 9999,
    challenge: "Face Glitchmaker in an epic showdown while dodging glitch shockwaves.",
    mechanic: "Boss AI: hovering boss projectile attacks and dynamic terrain disruption",
    newWorkBeyondEp001: "Glitchmaker boss attack patterns and victory disintegration FX.",
    beats: [
      { t: 0, kind: 'hook', text: "BOSS FIGHT: GLITCHMAKER!" },
      { t: 4, kind: 'hazard', type: 'hammer', count: 2 },
      { t: 10, kind: 'twist', type: 'ruleFlip', text: "GLITCH INVASION!" },
      { t: 16, kind: 'hazard', type: 'roller', count: 4 },
      { t: 23, kind: 'finalArch' },
      { t: 29, kind: 'result' }
    ]
  }
];

// ----------------------------------------------------------------------------
// 5. PHASES & EXIT CRITERIA
// ----------------------------------------------------------------------------

export const PHASE_ROADMAP: PhaseItem[] = [
  {
    phase: 1,
    name: "Render Pipeline & Materials",
    focus: "Stylized shaders, glossy materials, soft shadows, bloom, HDR environment lighting.",
    exitCriteria: "Scene renders with Pixar/Stumble Guys toy sheen with 0 changes to physics/simulation."
  },
  {
    phase: 2,
    name: "Gloop Character Polish",
    focus: "Visible face & expressions during hook and victory, sneakers, 6 mood states.",
    exitCriteria: "Front-facing hook turn, expressive eyes/mouth, visible sneaker tread on screen."
  },
  {
    phase: 3,
    name: "Orb Chain Growth Mechanic",
    focus: "Chain of glossy spheres trailing under Gloop that stacks him upward as orbs are collected.",
    exitCriteria: "Orb chain length equals exact orb count; Gloop towers crowned atop stack at win screen."
  },
  {
    phase: 4,
    name: "Sky World & Golden Arch",
    focus: "Floating emerald castles, fluffy 3D clouds, striped rails, grand golden 'FINAL TEST' arch.",
    exitCriteria: "Side-by-side screenshot of Sky Islands closely matches the art reference board."
  },
  {
    phase: 5,
    name: "Hazards, Choice Gates & HUD",
    focus: "Readable signage (+5 / -3), fair collision hitboxes, clean 9:16 safe area HUD.",
    exitCriteria: "Unobstructed gameplay view; every gate and obstacle is clearly telegraphable."
  },
  {
    phase: 6,
    name: "Result Screens & Bot Record Mode",
    focus: "Celebratory win camera orbit, defeat reaction, deterministic bot controller.",
    exitCriteria: "Automated recording ends with 100% reliable WIN on every export run."
  },
  {
    phase: 7,
    name: "World Themes (Candy, Ice, Lava)",
    focus: "Sequential implementation: Candy Factory -> Ice World -> Lava Land.",
    exitCriteria: "Each world possesses unique shaders, ground materials, props, and ambient particle systems."
  },
  {
    phase: 8,
    name: "Glitchmaker & Episodes 002-010",
    focus: "Interactive purple cube boss, remaining 9 episode configs and specialized twists.",
    exitCriteria: "All 10 canonical episodes selectable, playable, and exportable via /studio."
  }
];

// ----------------------------------------------------------------------------
// 6. RISK REGISTER & MITIGATION STRATEGIES
// ----------------------------------------------------------------------------

export const RISK_REGISTER: RiskItem[] = [
  {
    risk: "Asset Quality Ceiling",
    impact: "Procedural primitives alone may look plain compared to cinematic references.",
    mitigation: "Use glossy PBR materials with rim lighting, soft ambient occlusion, and allow drop-in GLB replacements via defined contracts in IMPLEMENTATION.md."
  },
  {
    risk: "Agent Over-Claiming",
    impact: "Claiming complete fidelity without empirical visual proof.",
    mitigation: "Enforce strict Playwright screenshot checks at 1080x1920 across all 6 story beats after each phase."
  },
  {
    risk: "Bot Autoplay Runs Failing",
    impact: "Video recording exports ending on defeat instead of intended viral win.",
    mitigation: "Calibrate bot controller lookahead to guarantee a comfortable surplus margin (e.g. +3 orbs over target) during record mode."
  },
  {
    risk: "Mobile Viewport Clipping",
    impact: "Crucial UI or character details obscured by YouTube Shorts native UI elements.",
    mitigation: "Strict adherence to 9:16 YouTube Shorts Safe Area overlays (safe top 15%, safe bottom 20%, safe right 15%)."
  }
];

// ----------------------------------------------------------------------------
// 7. KEY WORKSPACE FILE REFERENCES
// ----------------------------------------------------------------------------

export const KEY_FILE_REFERENCES = [
  {
    path: "src/game/characters/Gloop.tsx",
    role: "Character Model",
    description: "Turquoise jelly body, orange sneakers, eyes, arms, and procedural squash-and-stretch."
  },
  {
    path: "src/game/GameScene.tsx",
    role: "Master 3D Scene",
    description: "Three.js / R3F Canvas, lighting setup, camera controller, obstacle renderer, and game loop."
  },
  {
    path: "src/config/episodes.ts",
    role: "Episode Configs",
    description: "Canonical episode presets (001-010), durations, targets, difficulty, and seeded mechanics."
  },
  {
    path: "src/game/ui/GameOverlay.tsx",
    role: "In-Game HUD",
    description: "Hook banner, live orb counter, combo streak, beat badges, and YouTube Shorts safe area."
  },
  {
    path: "src/utils/rules.ts",
    role: "Simulation Core",
    description: "Deterministic 60Hz physics, obstacle poses, rule flips, and input validation."
  },
  {
    path: "src/video/Composition.tsx",
    role: "Remotion Pipeline",
    description: "Composites vertical 1080x1920 video with synchronized audio and motion graphics."
  }
];

// ----------------------------------------------------------------------------
// 8. INTERACTIVE REACT DASHBOARD COMPONENT: ZedProjectSummary
// ----------------------------------------------------------------------------

export const ZedProjectSummary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'brief' | 'episodes' | 'phases' | 'architecture' | 'risks'>('brief');
  const [selectedEp, setSelectedEp] = useState<CanonicalEpisode>(CANONICAL_EPISODES[0]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Outfit'] p-6 select-none">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_12px_#22d3ee]" />
              <h1 className="text-3xl font-black tracking-tight text-white font-['Fredoka']">
                {PROJECT_BRIEF.title}
              </h1>
              <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded-full font-mono">
                Zed.tsx Spec
              </span>
            </div>
            <p className="text-sm text-cyan-400 font-semibold mt-1">
              "{PROJECT_BRIEF.tagline}" · {PROJECT_BRIEF.format}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              Repo: {PROJECT_BRIEF.repo}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          {(['brief', 'episodes', 'phases', 'architecture', 'risks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow-lg font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-6xl mx-auto">
        {/* TAB 1: BRIEF */}
        {activeTab === 'brief' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECT_BRIEF.sections.map((sec) => (
              <div
                key={sec.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-md flex flex-col justify-between"
              >
                <h3 className="text-base font-extrabold text-cyan-300 mb-2 font-['Fredoka']">
                  {sec.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: EPISODES */}
        {activeTab === 'episodes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 flex flex-col gap-2 max-h-[680px] overflow-y-auto pr-2">
              {CANONICAL_EPISODES.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEp(ep)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedEp.id === ep.id
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      {ep.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md capitalize">
                      {ep.world}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white font-['Fredoka']">
                    {ep.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-1">
                    {ep.challenge}
                  </p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">
                    {selectedEp.code} SPECIFICATION
                  </span>
                  <h2 className="text-2xl font-black text-white font-['Fredoka']">
                    {selectedEp.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                    🎯 {selectedEp.target} Orbs
                  </span>
                  <span className="text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full">
                    ❤️ {selectedEp.hearts} Hearts
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Challenge Concept</span>
                  <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {selectedEp.challenge}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-1">Core Mechanics</span>
                  <p className="text-cyan-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {selectedEp.mechanic}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-1">New Scope Beyond Ep 001</span>
                  <p className="text-amber-200 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {selectedEp.newWorkBeyondEp001}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-2">Beat Timeline Sequence</span>
                  <div className="space-y-1.5">
                    {selectedEp.beats.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 font-mono text-[11px]"
                      >
                        <span className="text-cyan-400 font-bold">{b.t}s</span>
                        <span className="text-slate-400 uppercase font-bold text-[10px]">
                          {b.kind}
                        </span>
                        <span className="text-slate-200 truncate">
                          {'text' in b ? b.text : 'rows' in b ? `${b.rows} rows of ${b.color}` : 'type' in b ? `${b.count} ${b.type}s` : 'right' in b ? `L: ${b.left} / R: ${b.right}` : 'portal trigger'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHASES */}
        {activeTab === 'phases' && (
          <div className="space-y-3">
            {PHASE_ROADMAP.map((p) => (
              <div
                key={p.phase}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-cyan-300 shrink-0">
                    0{p.phase}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white font-['Fredoka']">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{p.focus}</p>
                  </div>
                </div>

                <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800/80 text-right md:max-w-md shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Exit Criteria
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {p.exitCriteria}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-6">
              <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">
                GOLDEN ARCHITECTURE RULE
              </span>
              <p className="text-base font-extrabold text-white">
                {ARCHITECTURE_SPEC.rule}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ARCHITECTURE_SPEC.layers.map((l, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                      Layer 0{idx + 1}
                    </span>
                    <h3 className="text-base font-extrabold text-white font-['Fredoka'] mt-0.5 mb-2">
                      {l.name}
                    </h3>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                      {l.responsibility}
                    </p>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 mb-4">
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">INPUTS</span>
                      {l.inputs}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">RELEVANT FILES</span>
                    <div className="flex flex-wrap gap-1">
                      {l.files.map((f, i) => (
                        <span key={i} className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-cyan-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key File Map */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-extrabold text-white mb-4 uppercase tracking-wide">
                Primary Source Code Modules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {KEY_FILE_REFERENCES.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 block truncate">
                      {item.path}
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5">
                      {item.role}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RISKS */}
        {activeTab === 'risks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RISK_REGISTER.map((r, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                    Risk Assessment 0{idx + 1}
                  </span>
                  <h3 className="text-base font-extrabold text-white font-['Fredoka'] mt-0.5 mb-2">
                    {r.risk}
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    <strong>Impact:</strong> {r.impact}
                  </p>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-0.5">
                    Mitigation Strategy
                  </span>
                  {r.mitigation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ZedProjectSummary;
