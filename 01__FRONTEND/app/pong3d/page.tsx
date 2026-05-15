// app/pong3d/page.tsx — CLAW3D PONG Entry Point

'use client';

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';

// Error boundary to catch any runtime errors (Three.js, R3F, etc.)
class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[CLAW3D PONG]', error.message, info.componentStack);
  }
  render() {
    if (this.state.hasError) return <>{this.props.fallback}</>;
    return this.props.children;
  }
}

export default function Pong3DPage() {
  return (
    <div className='fixed inset-0 bg-black'>
      <ErrorBoundary fallback={
        <div style={{
          position: 'absolute', inset: 0, background: '#000',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'IBM Plex Mono, monospace', color: '#ff0066', fontSize: '16px',
          letterSpacing: '0.2em', gap: '16px',
        }}>
          <div>CLAW3D PONG ERROR</div>
          <div style={{ color: '#666', fontSize: '12px' }}>Check console for details</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              border: '1px solid #ff0066', background: 'none', color: '#ff0066',
              padding: '8px 24px', cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
            }}
          >RELOAD</button>
        </div>
      }>
        <GameCanvas />
      </ErrorBoundary>
    </div>
  );
}

// Dynamically import Canvas + Game to avoid SSR evaluation of Three.js
function GameCanvas() {
  const [CanvasEl, setCanvasEl] = useState<React.ComponentType<any> | null>(null);
  const [GameEl, setGameEl] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      import('@react-three/fiber').then(m => { setCanvasEl(() => m.Canvas); }),
      import('./Game').then(m => { setGameEl(() => m.default); setLoading(false); }),
    ]).catch(err => {
      console.error('Failed to load game modules:', err);
      setLoading(false);
    });
  }, []);

  if (loading && !CanvasEl) {
    return (
      <div style={{
        position: 'absolute', inset: 0, background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'IBM Plex Mono, monospace', color: '#00ff9d', fontSize: '18px',
        letterSpacing: '0.3em',
      }}>
        LOADING CLAW3D PONG...
      </div>
    );
  }

  if (!CanvasEl || !GameEl) return null;

  return (
    <CanvasEl
      camera={{ position: [0, 0, 20], fov: 60 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 2]}
    >
      <GameEl />
    </CanvasEl>
  );
}