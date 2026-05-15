// components/monitoring/TokenBurnOverlay.tsx

'use client';

import React from 'react';
import { useFlowStore } from '@/stores/flow-store';

interface TokenBurnOverlayProps {
  totalBurnUsd: number;
}

export function TokenBurnOverlay({ totalBurnUsd }: TokenBurnOverlayProps) {
  const burnRateUsdPerHour = totalBurnUsd > 0 ? totalBurnUsd * 2 : 0; // Mock calculation
  const budgetUsd = 1000;
  const budgetUsed = (totalBurnUsd / budgetUsd) * 100;
  const isWarning = budgetUsed > 80;

  return (
    <div className={`absolute top-4 right-4 z-40 rounded-lg border border-neutral-700 bg-neutral-900/90 px-4 py-3 shadow-lg`}>
      <div className={`flex items-center gap-4`}>
        {/* Token icon */}
        <div className={`text-2xl`}>🔥</div>
        
        {/* Stats */}
        <div>
          <div className={`text-sm font-bold ${isWarning ? 'text-red-400' : 'text-white'}`}>
            ${totalBurnUsd.toFixed(2)}
          </div>
          <div className={`text-xs text-neutral-500`}>
            ${burnRateUsdPerHour.toFixed(2)}/hr
          </div>
        </div>

        {/* Budget bar */}
        <div className={`w-24`}>
          <div className={`mb-1 flex items-center justify-between text-xs`}>
            <span className={`text-neutral-600`}>Budget</span>
            <span className={isWarning ? 'text-red-400' : 'text-neutral-500'}>
              {(100 - budgetUsed).toFixed(0)}%
            </span>
          </div>
          <div className={`h-2 w-full overflow-hidden rounded-full bg-neutral-800`}>
            <div
              className={`h-full transition-all ${isWarning ? 'bg-red-500' : 'bg-yellow-500'}`}
              style={{ width: `${Math.min(100, budgetUsed)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}