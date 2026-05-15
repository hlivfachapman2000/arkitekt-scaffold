# SPEC: CLAW3D PONG — 3D Pong with Weapons & Music

## Project
- **Name**: CLAW3D PONG
- **Type**: Real-time 3D browser game
- **Stack**: Next.js 14 (App Router) + React-Three-Fiber + @react-three/drei + @react-three/postprocessing
- **Entry Point**: `01__FRONTEND/app/pong3d/page.tsx`

---

## 1. Concept & Vision

A brutalist-neon 3D Pong game where two players (or player vs AI) battle with power-up weapons. The aesthetic is stark black void with glowing neon geometry — no textures, just pure light on darkness. Think Tron meets arcade cabinet. The atmosphere is electric: pulsing music, screen shake on impacts, particle explosions on weapon hits.

---

## 2. Visual & Rendering

### Scene Setup
- **Background**: Pure black `#000000`
- **Camera**: Fixed perspective camera at `(0, 0, 20)` looking at origin — side view of the Pong table
- **Table**: Neon wireframe arena — glowing border lines (`#00ff9d`) forming a 20×14 rectangular field, no floor, just edges
- **Lighting**: Minimal — ambient `#111` + point lights at goal areas (`#ff0066` and `#00ffff`)

### Materials & Effects
- **Paddles**: Glowing boxes with emissive material — Player 1: `#00ffff` (cyan), Player 2: `#ff0066` (magenta)
- **Ball**: White emissive sphere with a bright bloom glow trail
- **Goal zones**: Vertical plane with pulsing glow shader
- **Post-processing** (via @react-three/postprocessing):
  - **Bloom**: Intensity 1.5, luminance threshold 0.3 — makes all emissive elements glow
  - **Screen shake**: On ball-paddle collision — camera offset oscillates over 200ms
  - **Chromatic aberration**: Subtle, on screen shake moments only

### Color Palette
```
Black:    #000000
Cyan:     #00ffff
Magenta:  #ff0066  
White:    #ffffff
Green:    #00ff9d
Orange:   #ff6b35
Yellow:   #ffff00
```

---

## 3. Game Mechanics

### Core Pong
- Two paddles (left/right) on a 3D table, ball bouncing
- **Paddle size**: 2 units wide × 0.5 tall × 0.5 deep
- **Paddle movement**: Vertical only (Y-axis), clamped to table bounds
- **Ball**: Radius 0.3, starts at center, random initial velocity toward one player
- **Ball speed**: Starts at 8 units/sec, increases by 0.5 every 5 rallies
- **Scoring**: Ball past paddle = 1 point for opponent, first to 7 wins
- **Rally reset**: After score, ball resets to center, 2-second countdown

### Weapons System
Power-ups spawn randomly every 10-15 seconds in the center. Touch the ball through the power-up zone to collect.

| Weapon | Icon | Effect | Duration |
|--------|------|--------|----------|
| **MULTI-BALL** | ⚡ | Splits ball into 3 balls | Until extra balls score |
| **SLOW-MO** | 🐌 | Ball speed × 0.4 | 8 seconds |
| **LASER PADDLES** | 🔫 | Paddle shoots a fast projectile toward opponent | 3 shots, 10 sec cooldown |
| **GRAVITY WELL** | 🕳️ | Creates a temporary attractor in center that bends ball trajectory | 5 seconds |
| **SHIELD** | 🛡️ | Opponent's next shot is auto-blocked once | Until used |
| **WIDE PADDLE** | ↔️ | Paddle width × 2.5 | 10 seconds |

### Player Controls
- **Player 1 (WASD)**: W/S move up/down, SPACE to fire laser
- **Player 2 (Arrows)**: ↑/↓ move up/down, ENTER to fire laser
- **AI Mode**: Press 'A' to toggle AI opponent on Player 2 side

---

## 4. Audio Design (Web Audio API)

### Background Music
- Procedurally generated using Web Audio API oscillators
- Base: Low-frequency sawtooth wave (80Hz) as bass drone
- Melody: Randomized pentatonic scale sequence at 440Hz with envelope
- Tempo: 120 BPM with kick-drum pattern using noise + filter envelope
- **Mute button** in top-right corner

### Sound Effects
| Event | Sound |
|-------|-------|
| Paddle hit | Short punchy sine wave at 220Hz, 50ms decay |
| Wall bounce | Higher pitched ping (440Hz, 30ms) |
| Score | Descending chromatic sweep (400ms) |
| Power-up collect | Rising arpeggio (3 notes, 200ms) |
| Laser fire | Noise burst + sawtooth (100ms) |
| Gravity well activate | Low rumble + filter sweep |
| Game over | Short melody, major chord |

---

## 5. UI / HUD

### In-Game HUD (3D overlay via React HTML)
- **Score display**: Top-center, monospace font, `[P1] 0 — 0 [P2]` format
- **Active weapons**: Bottom-left, icons showing active power-ups with countdown bars
- **FPS counter**: Top-right corner (small, gray)
- **Pause/Resume**: Press ESC or P

### Start Screen
- Title: `CLAW3D PONG` in large monospace, white on black
- Subtitle: `PRESS SPACE TO START`
- Controls listed below
- `[A]` = toggle AI opponent

### Game Over Screen
- Winner announcement: `PLAYER [1/2] WINS` or `AI WINS`
- Final score
- `[SPACE] = PLAY AGAIN`

---

## 6. Architecture

### File Structure
```
01__FRONTEND/app/pong3d/
  page.tsx          — 'use client' page, wraps game in Canvas
  Game.tsx          — Main game component, holds all state (score, balls, weapons, paused)
  components/
    Paddle.tsx      — Player paddle mesh + input handling
    Ball.tsx        — Ball mesh + physics + trail effect
    Arena.tsx       — Wireframe table, goal zones, post-processing
    Weapons.tsx     — Power-up spawner and renderer
    HUD.tsx         — Score, weapon indicators, overlays
    AudioManager.ts — Web Audio API manager (single global instance)
  hooks/
    usePongControls.ts  — Keyboard input for both players
    useAudio.ts         — Audio context and sound triggers
```

### State Management
- React `useState` + `useRef` for game state (no external store needed)
- `useFrame` from R3F for game loop (60fps target)
- All game logic in the `Game` component — paddles, balls, collisions, weapons

---

## 7. Acceptance Criteria

- [ ] Game renders at 60fps with both paddles, ball, arena visible
- [ ] Ball bounces correctly off walls and paddles
- [ ] Score increments when ball passes a paddle
- [ ] At least 4 weapon power-ups work (Multi-ball, Slow-mo, Laser, Wide Paddle)
- [ ] Audio plays: background music + hit sounds + power-up sounds
- [ ] Bloom glow visible on all emissive elements
- [ ] Screen shake on ball-paddle collision
- [ ] Start screen → Game → Game Over → Restart flow works
- [ ] AI opponent plays competently
- [ ] No console errors during normal gameplay