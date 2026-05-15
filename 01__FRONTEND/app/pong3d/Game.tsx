// app/pong3d/Game.tsx — CLAW3D PONG: Full 3D Pong with Weapons & Music
'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

interface Ball {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

interface Weapon {
  type: 'multi-ball' | 'slow-mo' | 'laser' | 'gravity' | 'shield' | 'wide';
  x: number;
  y: number;
  collected: boolean;
  activeTime: number;
  duration: number;
}

interface Laser {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  active: boolean;
}

type GamePhase = 'start' | 'countdown' | 'playing' | 'paused' | 'gameover';

// ============================================================================
// AUDIO MANAGER
// ============================================================================

class AudioManager {
  private ctx: AudioContext | null = null;
  private bgGain: GainNode | null = null;
  private bassOsc: OscillatorNode | null = null;
  private melodyInterval: number | null = null;
  private muted: boolean = false;

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.startBgMusic();
  }

  private startBgMusic() {
    if (!this.ctx) return;
    // Bass drone
    this.bassOsc = this.ctx.createOscillator();
    this.bassOsc.type = 'sawtooth';
    this.bassOsc.frequency.value = 80;
    this.bgGain = this.ctx.createGain();
    this.bgGain.gain.value = 0.08;
    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 200;
    this.bassOsc.connect(bassFilter);
    bassFilter.connect(this.bgGain);
    this.bgGain.connect(this.ctx.destination);
    this.bassOsc.start();

    // Melody loop
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    let noteIdx = 0;
    this.melodyInterval = window.setInterval(() => {
      if (this.muted || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = notes[noteIdx % notes.length];
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
      noteIdx++;
    }, 500);
  }

  playPaddleHit() {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 220;
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playWallBounce() {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playScore(side: 'left' | 'right') {
    if (!this.ctx || this.muted) return;
    const startFreq = side === 'left' ? 400 : 600;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(startFreq * 0.5, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playPowerUp() {
    if (!this.ctx || this.muted) return;
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      const t = this.ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  playLaser() {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    noise.stop(this.ctx.currentTime + 0.1);
    // Saw component
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.value = 880;
    gain2.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start();
    osc2.stop(this.ctx.currentTime + 0.08);
  }

  playGameOver(winner: number) {
    if (!this.ctx || this.muted) return;
    const freqs = winner === 1 ? [523.25, 659.25, 783.99, 1046.5] : [392.0, 329.63, 261.63, 196.0];
    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      const t = this.ctx.currentTime + i * 0.25;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.bgGain) this.bgGain.gain.value = this.muted ? 0 : 0.08;
    return this.muted;
  }
}

const audioManager = new AudioManager();

// ============================================================================
// CONSTANTS
// ============================================================================

const TABLE_WIDTH = 20;
const TABLE_HEIGHT = 14;
const PADDLE_WIDTH = 2;
const PADDLE_HEIGHT = 0.5;
const PADDLE_DEPTH = 0.5;
const BALL_RADIUS = 0.3;
const BALL_SPEED = 8;
const PADDLE_SPEED = 12;
const MAX_SCORE = 7;
const ARENA_COLOR = '#00ff9d';
const PLAYER1_COLOR = '#00ffff';
const PLAYER2_COLOR = '#ff0066';

// ============================================================================
// ARENA COMPONENT
// ============================================================================

function Arena() {
  const edges = useMemo(() => {
    const geo = new THREE.BoxGeometry(TABLE_WIDTH, TABLE_HEIGHT, 0.5);
    const edgesGeo = new THREE.EdgesGeometry(geo);
    return edgesGeo;
  }, []);

  return (
    <group>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={ARENA_COLOR} linewidth={2} />
      </lineSegments>
      {/* Left goal zone */}
      <mesh position={[-TABLE_WIDTH / 2, 0, 0]}>
        <planeGeometry args={[0.1, TABLE_HEIGHT]} />
        <meshBasicMaterial color='#ff0066' transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Right goal zone */}
      <mesh position={[TABLE_WIDTH / 2, 0, 0]}>
        <planeGeometry args={[0.1, TABLE_HEIGHT]} />
        <meshBasicMaterial color='#00ffff' transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Center line */}
      <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, TABLE_HEIGHT, 8]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ============================================================================
// PADDLE COMPONENT
// ============================================================================

interface PaddleProps {
  position: THREE.Vector3;
  color: string;
  onMove: (y: number) => void;
  onFire: () => void;
  upKey: string;
  downKey: string;
  fireKey: string;
  isAI?: boolean;
  ballY?: number;
  laserShots?: number;
}

function Paddle({ position, color, onMove, onFire, upKey, downKey, fireKey, isAI, ballY, laserShots }: PaddleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const keys = useRef({ up: false, down: false });
  const pos = useRef(position.y);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === upKey) keys.current.up = e.type === 'keydown';
      if (e.key === downKey) keys.current.down = e.type === 'keydown';
      if (e.key === fireKey && e.type === 'keydown') onFire();
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', handler);
    };
  }, [upKey, downKey, fireKey, onFire]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (isAI && ballY !== undefined) {
      const diff = ballY - pos.current;
      pos.current += Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED * 0.6 * delta);
    } else {
      if (keys.current.up) pos.current += PADDLE_SPEED * delta;
      if (keys.current.down) pos.current -= PADDLE_SPEED * delta;
    }

    pos.current = Math.max(-TABLE_HEIGHT / 2 + PADDLE_HEIGHT / 2, Math.min(TABLE_HEIGHT / 2 - PADDLE_HEIGHT / 2, pos.current));
    meshRef.current.position.y = pos.current;
    onMove(pos.current);
  });

  return (
    <group>
      <mesh ref={meshRef} position={[position.x, position.y, position.z]}>
        <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {/* Laser indicator */}
      {laserShots !== undefined && laserShots > 0 && (
        <pointLight
          position={[position.x, pos.current, position.z + 0.5]}
          color={color}
          intensity={laserShots * 0.5}
          distance={3}
        />
      )}
    </group>
  );
}

// ============================================================================
// BALL COMPONENT
// ============================================================================

interface BallProps {
  position: THREE.Vector3;
  trail?: boolean;
}

function Ball({ position, trail }: BallProps) {
  return (
    <group>
      <mesh position={[position.x, position.y, position.z]}>
        <sphereGeometry args={[BALL_RADIUS, 16, 16]} />
        <meshStandardMaterial color='#ffffff' emissive='#ffffff' emissiveIntensity={2} />
      </mesh>
      {trail && (
        <pointLight position={[position.x, position.y, position.z]} color='#ffffff' intensity={1} distance={3} />
      )}
    </group>
  );
}

// ============================================================================
// LASER COMPONENT
// ============================================================================

interface LaserProps {
  laser: Laser;
  color: string;
}

function LaserMesh({ laser, color }: LaserProps) {
  if (!laser.active) return null;
  return (
    <mesh position={[laser.x, laser.y, 0]}>
      <boxGeometry args={[0.4, 0.15, 0.15]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
    </mesh>
  );
}

// ============================================================================
// WEAPON PICKUP COMPONENT
// ============================================================================

interface WeaponProps {
  weapon: Weapon;
}

function WeaponPickup({ weapon }: WeaponProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!meshRef.current || weapon.collected) return;
    meshRef.current.rotation.y += delta * 2;
    meshRef.current.rotation.x += delta * 1.5;
  });
  if (weapon.collected) return null;

  const colors: Record<string, string> = {
    'multi-ball': '#ffff00',
    'slow-mo': '#00ff9d',
    'laser': '#ff6b35',
    'gravity': '#ff00ff',
    'shield': '#4488ff',
    'wide': '#00ffff',
  };

  return (
    <mesh ref={meshRef} position={[weapon.x, weapon.y, 0]}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color={colors[weapon.type]} emissive={colors[weapon.type]} emissiveIntensity={2} />
    </mesh>
  );
}

// ============================================================================
// HUD COMPONENT (HTML Overlay)
// ============================================================================

interface HUDProps {
  score: [number, number];
  gamePhase: GamePhase;
  weapons: Weapon[];
  muted: boolean;
  onToggleMute: () => void;
  onStart: () => void;
  onRestart: () => void;
  countdown: number;
  aiMode: boolean;
  onToggleAI: () => void;
  winner: number | null;
}

function HUD({
  score, gamePhase, weapons, muted, onToggleMute,
  onStart, onRestart, countdown, aiMode, onToggleAI, winner,
}: HUDProps) {
  const weaponDefs = [
    { type: 'multi-ball', label: 'MULTI', color: '#ffff00' },
    { type: 'slow-mo', label: 'SLOW', color: '#00ff9d' },
    { type: 'laser', label: 'LASER', color: '#ff6b35' },
    { type: 'gravity', label: 'GRAV', color: '#ff00ff' },
    { type: 'shield', label: 'SHIELD', color: '#4488ff' },
    { type: 'wide', label: 'WIDE', color: '#00ffff' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      fontFamily: 'IBM Plex Mono, monospace', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* Top bar */}
      <div style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '12px 20px',
        background: 'rgba(0,0,0,0.7)', borderBottom: '1px solid #333',
      }}>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {aiMode ? '[AI MODE ON]' : '[2P MODE]'}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleAI(); }}
            style={{
              background: 'none', border: '1px solid #333', color: '#666',
              cursor: 'pointer', marginLeft: '8px', padding: '2px 8px', pointerEvents: 'auto',
            }}
          >
            [A] TOGGLE
          </button>
        </div>
        <div style={{ fontSize: '28px', letterSpacing: '0.3em', fontWeight: 700 }}>
          CLAW3D PONG
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          style={{
            background: 'none', border: '1px solid #333', color: muted ? '#666' : '#fff',
            cursor: 'pointer', padding: '4px 12px', pointerEvents: 'auto', fontSize: '11px',
          }}
        >
          {muted ? '[MUTED]' : '[SOUND]'}
        </button>
      </div>

      {/* Score */}
      <div style={{
        marginTop: '20px', fontSize: '36px', letterSpacing: '0.5em',
        color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.5)',
      }}>
        <span style={{ color: PLAYER1_COLOR }}>{score[0]}</span>
        <span style={{ color: '#333', margin: '0 20px' }}>—</span>
        <span style={{ color: PLAYER2_COLOR }}>{score[1]}</span>
      </div>

      {/* Active weapons */}
      {weapons.filter(w => !w.collected && w.activeTime > 0).length > 0 && (
        <div style={{
          position: 'absolute', bottom: '80px', left: '20px',
          display: 'flex', gap: '8px', flexDirection: 'column',
        }}>
          {weapons.filter(w => !w.collected && w.activeTime > 0).map(w => {
            const def = weaponDefs.find(d => d.type === w.type)!;
            const pct = Math.max(0, (1 - w.activeTime / w.duration) * 100);
            return (
              <div key={w.type} style={{ fontSize: '11px', color: def.color }}>
                {def.label}: <span style={{ color: '#666' }}>{w.activeTime.toFixed(1)}s</span>
                <div style={{ width: '60px', height: '3px', background: '#222', marginTop: '2px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: def.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Center overlay */}
      {gamePhase === 'start' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)',
          pointerEvents: 'auto',
        }}>
          <div style={{ fontSize: '48px', letterSpacing: '0.5em', marginBottom: '20px', textShadow: '0 0 40px rgba(0,255,157,0.5)' }}>
            CLAW3D PONG
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '40px', textAlign: 'center', lineHeight: 2 }}>
            <div>P1: W/S MOVE | SPACE = LASER</div>
            <div>P2: ↑/↓ MOVE | ENTER = LASER</div>
            <div>[A] = TOGGLE AI OPPONENT</div>
          </div>
          <button
            onClick={onStart}
            style={{
              border: '2px solid #00ff9d', background: 'none', color: '#00ff9d',
              fontSize: '18px', padding: '12px 40px', cursor: 'pointer', letterSpacing: '0.3em',
              fontFamily: 'IBM Plex Mono, monospace', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00ff9d'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#00ff9d'; }}
          >
            PRESS SPACE TO START
          </button>
        </div>
      )}

      {gamePhase === 'countdown' && (
        <div style={{ position: 'absolute', fontSize: '120px', fontWeight: 700, color: '#00ff9d', textShadow: '0 0 60px #00ff9d' }}>
          {countdown > 0 ? Math.ceil(countdown) : 'GO!'}
        </div>
      )}

      {gamePhase === 'gameover' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)',
          pointerEvents: 'auto',
        }}>
          <div style={{ fontSize: '36px', color: winner === 1 ? PLAYER1_COLOR : PLAYER2_COLOR, marginBottom: '20px', letterSpacing: '0.3em' }}>
            {winner === 1 ? 'PLAYER 1 WINS' : aiMode ? 'AI WINS' : 'PLAYER 2 WINS'}
          </div>
          <div style={{ fontSize: '24px', color: '#666', marginBottom: '40px' }}>
            {score[0]} — {score[1]}
          </div>
          <button
            onClick={onRestart}
            style={{
              border: '2px solid #fff', background: 'none', color: '#fff',
              fontSize: '16px', padding: '12px 40px', cursor: 'pointer', letterSpacing: '0.3em',
              fontFamily: 'IBM Plex Mono, monospace',
            }}
          >
            [SPACE] PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// GRAVITY WELL EFFECT
// ============================================================================

function GravityWell({ x, y, active }: { x: number; y: number; active: boolean }) {
  if (!active) return null;
  return (
    <mesh position={[x, y, 0]}>
      <torusGeometry args={[1.5, 0.08, 8, 32]} />
      <meshStandardMaterial color='#ff00ff' emissive='#ff00ff' emissiveIntensity={3} transparent opacity={0.7} />
    </mesh>
  );
}

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================

export default function Game() {
  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [countdown, setCountdown] = useState(2);
  const [winner, setWinner] = useState<number | null>(null);
  const [aiMode, setAiMode] = useState(false);
  const [muted, setMuted] = useState(false);

  // Balls
  const [balls, setBalls] = useState<Ball[]>([
    { id: 0, position: new THREE.Vector3(0, 0, 0), velocity: new THREE.Vector3(BALL_SPEED * 0.7, BALL_SPEED * 0.7, 0).normalize().multiplyScalar(BALL_SPEED) }
  ]);

  // Paddles
  const [p1Y, setP1Y] = useState(0);
  const [p2Y, setP2Y] = useState(0);

  // Weapons
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);

  // Camera shake
  const [shake, setShake] = useState(0);
  const { camera } = useThree();


  // Laser shots tracking
  const [p1LaserShots, setP1LaserShots] = useState(0);
  const [p2LaserShots, setP2LaserShots] = useState(0);

  // AI tracking
  const [p2BallY, setP2BallY] = useState(0);

  // Refs
  const lastWeaponSpawn = useRef(0);
  const lastFire = useRef<Record<string, number>>({ p1: 0, p2: 0 });
  // Refs to avoid stale closure issues in useFrame
  const weaponsRef = useRef<Weapon[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  const gamePhaseRef = useRef<GamePhase>('start');
  useEffect(() => { weaponsRef.current = weapons; }, [weapons]);
  useEffect(() => { ballsRef.current = balls; }, [balls]);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);

  // Initialize audio on first interaction
  useEffect(() => {
    const initAudio = () => { audioManager.init(); };
    window.addEventListener('keydown', initAudio, { once: true });
    return () => window.removeEventListener('keydown', initAudio);
  }, []);

  // Keyboard for game phase control
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gamePhase === 'start') startGame();
        else if (gamePhase === 'gameover') restartGame();
      }
      if (e.key === 'a' || e.key === 'A') setAiMode(m => !m);
      if ((e.key === 'p' || e.key === 'P') && gamePhase === 'playing') setGamePhase('paused');
      if ((e.key === 'p' || e.key === 'P') && gamePhase === 'paused') setGamePhase('playing');
      if (e.key === 'Escape' && gamePhase === 'paused') setGamePhase('playing');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gamePhase]);

  const startGame = useCallback(() => {
    audioManager.init();
    setGamePhase('countdown');
    setCountdown(3);
    setScore([0, 0]);
    setWinner(null);
    setBalls([{ id: 0, position: new THREE.Vector3(0, 0, 0), velocity: new THREE.Vector3(BALL_SPEED * 0.7, BALL_SPEED * 0.3, 0).normalize().multiplyScalar(BALL_SPEED) }]);
    setWeapons([]);
    setLasers([]);
    setP1LaserShots(0);
    setP2LaserShots(0);
    lastWeaponSpawn.current = 0;
  }, []);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const fireLaser = useCallback((player: 1 | 2) => {
    const now = Date.now();
    if (now - lastFire.current[`p${player}`] < 500) return;
    lastFire.current[`p${player}`] = now;

    const y = player === 1 ? p1Y : p2Y;
    const shots = player === 1 ? p1LaserShots : p2LaserShots;
    if (shots <= 0) return;

    if (player === 1) setP1LaserShots(s => s - 1);
    else setP2LaserShots(s => s - 1);

    audioManager.playLaser();

    setLasers(prev => [...prev, {
      id: Date.now(),
      x: player === 1 ? -TABLE_WIDTH / 2 + 2 : TABLE_WIDTH / 2 - 2,
      y,
      velocityX: player === 1 ? 25 : -25,
      active: true,
    }]);
  }, [p1Y, p2Y, p1LaserShots, p2LaserShots]);

  // Main game loop
  useFrame((_, delta) => {
    if (gamePhaseRef.current !== 'playing' && gamePhaseRef.current !== 'countdown') return;

    const dt = Math.min(delta, 0.05);

    // Countdown
    if (gamePhaseRef.current === 'countdown') {
      setCountdown(c => c - dt);
    }

    const currentWeapons = weaponsRef.current;
    const activeWeapons = currentWeapons.filter(w => !w.collected && w.activeTime > 0 && w.activeTime < w.duration);
    const hasSlowMo = activeWeapons.some(w => w.type === 'slow-mo');
    const hasGravity = activeWeapons.some(w => w.type === 'gravity');
    const hasWide = activeWeapons.some(w => w.type === 'wide');
    const gravityWell = activeWeapons.find(w => w.type === 'gravity');

    // Spawn weapons
    lastWeaponSpawn.current += dt;
    if (lastWeaponSpawn.current > 12 + Math.random() * 5) {
      lastWeaponSpawn.current = 0;
      const types: Weapon['type'][] = ['multi-ball', 'slow-mo', 'laser', 'gravity', 'wide'];
      const type = types[Math.floor(Math.random() * types.length)];
      setWeapons(prev => [...prev, {
        type,
        x: (Math.random() - 0.5) * TABLE_WIDTH * 0.6,
        y: (Math.random() - 0.5) * TABLE_HEIGHT * 0.6,
        collected: false,
        activeTime: 0,
        duration: type === 'laser' ? 10 : type === 'wide' ? 10 : type === 'slow-mo' ? 8 : 5,
      }]);
    }

    // Weapon timers - tick activeTime
    setWeapons(prev => prev.map(w => ({
      ...w,
      activeTime: w.activeTime + dt,
    })).filter(w => w.activeTime < w.duration + 2 || w.collected));

    // Update lasers
    setLasers(prev => prev.map(l => ({
      ...l,
      x: l.x + l.velocityX * dt,
      active: l.x > -TABLE_WIDTH / 2 - 1 && l.x < TABLE_WIDTH / 2 + 1,
    })).filter(l => l.active));

    // Ball physics - compute next state outside setState, then apply
    const currentBalls = ballsRef.current;
    let nextBalls: Ball[] = currentBalls.map(ball => {
      let vel = ball.velocity.clone();
      const speed = vel.length();
      const actualSpeed = hasSlowMo ? speed * 0.4 : speed;

      // Gravity well attraction
      if (hasGravity && gravityWell && ball.position.x > -5 && ball.position.x < 5) {
        const gx = gravityWell.x - ball.position.x;
        const gy = gravityWell.y - ball.position.y;
        const dist = Math.sqrt(gx * gx + gy * gy) + 0.1;
        const force = 15 / (dist * dist);
        vel.x += (gx / dist) * force * dt;
        vel.y += (gy / dist) * force * dt;
      }

      if (vel.length() > 0) vel.normalize().multiplyScalar(actualSpeed);
      const pos = ball.position.clone().add(vel.clone().multiplyScalar(dt));

      // Wall bounce
      if (pos.y <= -TABLE_HEIGHT / 2 + BALL_RADIUS || pos.y >= TABLE_HEIGHT / 2 - BALL_RADIUS) {
        vel.y *= -1;
        pos.y = Math.max(-TABLE_HEIGHT / 2 + BALL_RADIUS, Math.min(TABLE_HEIGHT / 2 - BALL_RADIUS, pos.y));
        audioManager.playWallBounce();
      }

      // P1 paddle collision
      const p1X = -TABLE_WIDTH / 2 + PADDLE_WIDTH / 2;
      const p1W = hasWide ? PADDLE_WIDTH * 2.5 : PADDLE_WIDTH;
      if (pos.x <= p1X + BALL_RADIUS + p1W / 2 && pos.x >= p1X - 1 && vel.x < 0) {
        if (pos.y >= p1Y - PADDLE_HEIGHT / 2 - BALL_RADIUS && pos.y <= p1Y + PADDLE_HEIGHT / 2 + BALL_RADIUS) {
          vel.x = Math.abs(vel.x) * 1.05;
          const relY = (pos.y - p1Y) / (PADDLE_HEIGHT / 2);
          vel.y = relY * actualSpeed * 0.6;
          if (vel.length() > 0) vel.normalize().multiplyScalar(Math.min(actualSpeed * 1.05, 20));
          pos.x = p1X + BALL_RADIUS + p1W / 2 + 0.01;
          setShake(0.2);
          audioManager.playPaddleHit();
        }
      }

      // P2 paddle collision
      const p2X = TABLE_WIDTH / 2 - PADDLE_WIDTH / 2;
      const p2W = hasWide ? PADDLE_WIDTH * 2.5 : PADDLE_WIDTH;
      if (pos.x >= p2X - BALL_RADIUS - p2W / 2 && pos.x <= p2X + 1 && vel.x > 0) {
        if (pos.y >= p2Y - PADDLE_HEIGHT / 2 - BALL_RADIUS && pos.y <= p2Y + PADDLE_HEIGHT / 2 + BALL_RADIUS) {
          vel.x = -Math.abs(vel.x) * 1.05;
          const relY = (pos.y - p2Y) / (PADDLE_HEIGHT / 2);
          vel.y = relY * actualSpeed * 0.6;
          if (vel.length() > 0) vel.normalize().multiplyScalar(Math.min(actualSpeed * 1.05, 20));
          pos.x = p2X - BALL_RADIUS - p2W / 2 - 0.01;
          setShake(0.2);
          audioManager.playPaddleHit();
        }
      }

      return { ...ball, position: pos, velocity: vel };
    });

    // Weapon pickup - collect ALL pickups first, THEN update state once (avoids hook-in-loop)
    const pickupNotifications: { x: number; y: number; type: Weapon['type']; ballVel: THREE.Vector3 }[] = [];
    nextBalls = nextBalls.map(ball => {
      for (const w of currentWeapons) {
        if (!w.collected) {
          const dx = ball.position.x - w.x;
          const dy = ball.position.y - w.y;
          if (Math.sqrt(dx * dx + dy * dy) < 1.2) {
            audioManager.playPowerUp();
            pickupNotifications.push({ x: w.x, y: w.y, type: w.type, ballVel: ball.velocity.clone() });
          }
        }
      }
      return ball;
    });

    // Single state update for all collected weapons
    if (pickupNotifications.length > 0) {
      const pickupSet = new Set(pickupNotifications.map(p => `${p.x.toFixed(1)}-${p.y.toFixed(1)}`));
      setWeapons(prev => prev.map(w => {
        const key = `${w.x.toFixed(1)}-${w.y.toFixed(1)}`;
        return pickupSet.has(key) ? { ...w, collected: true } : w;
      }));
    }

    // Apply weapon effects from pickups (outside setState)
    pickupNotifications.forEach(({ x, y, type, ballVel }) => {
      if (type === 'multi-ball') {
        const newBalls: Ball[] = [];
        for (let i = 0; i < 2; i++) {
          newBalls.push({
            id: Date.now() + i,
            position: new THREE.Vector3(x, y, 0),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0).normalize().multiplyScalar(ballVel.length()),
          });
        }
        setBalls(b => [...b, ...newBalls]);
      }
      if (type === 'laser') {
        if (ballVel.x < 0) setP1LaserShots(s => s + 3);
        else setP2LaserShots(s => s + 3);
      }
    });

    // Score detection
    const leftScore = nextBalls.filter(b => b.position.x > TABLE_WIDTH / 2 + 1).length;
    const rightScore = nextBalls.filter(b => b.position.x < -TABLE_WIDTH / 2 - 1).length;
    nextBalls = nextBalls.filter(b => b.position.x < TABLE_WIDTH / 2 + 1 && b.position.x > -TABLE_WIDTH / 2 - 1);

    if (leftScore > 0 || rightScore > 0) {
      if (leftScore > 0) {
        audioManager.playScore('left');
        setScore(s => {
          const ns: [number, number] = [s[0] + 1, s[1]];
          if (ns[0] >= MAX_SCORE) {
            setWinner(1);
            setGamePhase('gameover');
            audioManager.playGameOver(1);
            return ns;
          }
          nextBalls = [{
            id: Date.now(),
            position: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(-BALL_SPEED, (Math.random() - 0.5) * BALL_SPEED, 0).normalize().multiplyScalar(BALL_SPEED),
          }];
          return ns;
        });
      }
      if (rightScore > 0) {
        audioManager.playScore('right');
        setScore(s => {
          const ns: [number, number] = [s[0], s[1] + 1];
          if (ns[1] >= MAX_SCORE) {
            setWinner(2);
            setGamePhase('gameover');
            audioManager.playGameOver(2);
            return ns;
          }
          nextBalls = [{
            id: Date.now(),
            position: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(BALL_SPEED, (Math.random() - 0.5) * BALL_SPEED, 0).normalize().multiplyScalar(BALL_SPEED),
          }];
          return ns;
        });
      }
    }

    // Track ball Y for AI
    if (nextBalls[0]) setP2BallY(nextBalls[0].position.y);

    setBalls(nextBalls);

    // Camera shake
    setShake(s => {
      const next = s - dt * 2;
      if (next <= 0) {
        camera.position.x = 0;
        camera.position.y = 0;
        return 0;
      }
      camera.position.x = (Math.random() - 0.5) * next * 0.5;
      camera.position.y = (Math.random() - 0.5) * next * 0.5;
      return next;
    });
  });

  // Countdown expiry - fires at 2.5s so countdown shows "1" briefly then GO!
  useEffect(() => {
    if (gamePhase !== 'countdown') return;
    const timer = setTimeout(() => {
      setGamePhase('playing');
    }, 2500);
    return () => clearTimeout(timer);
  }, [gamePhase]);

  const handleToggleMute = useCallback(() => {
    const m = audioManager.toggleMute();
    setMuted(m);
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[-TABLE_WIDTH / 2, 0, 3]} color='#ff0066' intensity={2} distance={15} />
      <pointLight position={[TABLE_WIDTH / 2, 0, 3]} color='#00ffff' intensity={2} distance={15} />

      {/* Arena */}
      <Arena />

      {/* Paddles */}
      <Paddle
        position={new THREE.Vector3(-TABLE_WIDTH / 2 + PADDLE_WIDTH / 2 + 0.3, p1Y, 0)}
        color={PLAYER1_COLOR}
        onMove={setP1Y}
        onFire={() => fireLaser(1)}
        upKey='w'
        downKey='s'
        fireKey=' '
        laserShots={p1LaserShots}
      />
      <Paddle
        position={new THREE.Vector3(TABLE_WIDTH / 2 - PADDLE_WIDTH / 2 - 0.3, p2Y, 0)}
        color={PLAYER2_COLOR}
        onMove={setP2Y}
        onFire={() => fireLaser(2)}
        upKey='ArrowUp'
        downKey='ArrowDown'
        fireKey='Enter'
        isAI={aiMode}
        ballY={p2BallY}
        laserShots={p2LaserShots}
      />

      {/* Balls */}
      {balls.map(ball => (
        <Ball key={ball.id} position={ball.position} trail />
      ))}

      {/* Lasers */}
      {lasers.map(laser => (
        <LaserMesh key={laser.id} laser={laser} color={laser.velocityX < 0 ? PLAYER1_COLOR : PLAYER2_COLOR} />
      ))}

      {/* Weapons */}
      {weapons.filter(w => !w.collected).map((weapon, i) => (
        <WeaponPickup key={`${weapon.type}-${i}`} weapon={weapon} />
      ))}

      {/* Gravity well */}
      {weapons.filter(w => w.type === 'gravity' && !w.collected && w.activeTime > 0 && w.activeTime < w.duration).length > 0 && (
        <GravityWell
          x={weapons.find(w => w.type === 'gravity' && !w.collected)?.x || 0}
          y={weapons.find(w => w.type === 'gravity' && !w.collected)?.y || 0}
          active
        />
      )}

      {/* Post-processing */}
      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.3} luminanceSmoothing={0.9} />
        <Noise opacity={0.02} />
      </EffectComposer>

      {/* HUD */}
      <HUD
        score={score}
        gamePhase={gamePhase}
        weapons={weapons}
        muted={muted}
        onToggleMute={handleToggleMute}
        onStart={startGame}
        onRestart={restartGame}
        countdown={countdown}
        aiMode={aiMode}
        onToggleAI={() => setAiMode(m => !m)}
        winner={winner}
      />
    </>
  );
}