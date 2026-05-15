// components/StatusBar.tsx

'use client';

import React from 'react';

interface StatusBarProps {
  running: boolean;
  autopilotMode: boolean;
  humanGatesPending: number;
  activeAgentCount: number;
  crashedAgentCount: number;
  totalBurnUsd: number;
  currentView: string;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onToggleAutopilot: () => void;
  onViewChange: (view: any) => void;
}

export function StatusBar({
  running,
  autopilotMode,
  humanGatesPending,
  activeAgentCount,
  crashedAgentCount,
  totalBurnUsd,
  currentView,
  onStart,
  onPause,
  onStop,
  onToggleAutopilot,
  onViewChange,
}: StatusBarProps) {
  const views = [
    { id: 'system', label: 'SYS' },
    { id: 'execution', label: 'EXEC' },
    { id: 'task', label: 'TASK' },
    { id: 'memory', label: 'MEM' },
    { id: 'infra', label: 'INFRA' },
  ];

  return (
    <div className={`flex h-full items-center justify-between px-4`}>
      {/* Left: View switcher */}
      <div className={`flex items-center gap-1`}>
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`btn-brutal ${currentView === view.id ? 'active' : ''}`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Center: Run controls */}
      <div className={`flex items-center gap-2`}>
        {!running ? (
          <button onClick={onStart} className={`btn-brutal`}>
            START
          </button>
        ) : (
          <>
            <button onClick={onPause} className={`btn-brutal`}>
              PAUSE
            </button>
            <button onClick={onStop} className={`btn-brutal`}>
              STOP
            </button>
          </>
        )}

        <button
          onClick={onToggleAutopilot}
          className={`btn-brutal ${autopilotMode ? 'active' : ''}`}
        >
          AUTO {autopilotMode ? 'ON' : 'OFF'}
        </button>

        {humanGatesPending > 0 && (
          <div className={`btn-brutal border-red-500 text-red-500`}>
            GATES: {humanGatesPending}
          </div>
        )}
      </div>

      {/* Right: Stats */}
      <div className={`flex items-center gap-6 text-xs font-mono`}>
        <div className={`flex items-center gap-2`}>
          <span className={`text-gray-500`}>AGENTS:</span>
          <span className={`text-white`}>{activeAgentCount}</span>
          {crashedAgentCount > 0 && (
            <span className={`text-red-500`}>{crashedAgentCount}</span>
          )}
        </div>
        <div className={`flex items-center gap-2`}>
          <span className={`text-gray-500`}>BURN:</span>
          <span className={totalBurnUsd > 50 ? 'text-red-500' : 'text-white'}>
            ${totalBurnUsd.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}