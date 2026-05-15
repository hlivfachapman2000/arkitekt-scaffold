// components/flow/nodes/ServiceNode.tsx

'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { ServiceNodeData, ServiceHealth } from '@/types/nodes/service-node';

const HEALTH_STYLES: Record<ServiceHealth, string> = {
  healthy: 'bg-white',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
  unknown: 'bg-gray-600',
  'rate-limited': 'bg-orange-500',
};

interface ServiceNodeProps { data: any; selected?: boolean; }
function ServiceNodeComponent({ data, selected }: ServiceNodeProps) {
  const serviceData = data as unknown as ServiceNodeData;
  const rateLimitUsed = serviceData.rateLimit 
    ? (serviceData.rateLimit.limit - serviceData.rateLimit.remaining) / serviceData.rateLimit.limit 
    : 0;

  return (
    <div className={`w-56 border border-white bg-black ${selected ? 'border-2' : ''}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-white px-3 py-2`}>
        <div className={`flex items-center gap-2`}>
          <div className={`h-2 w-2 ${HEALTH_STYLES[serviceData.health] || 'bg-gray'}`} />
          <span className={`text-xs font-medium text-white`}>{serviceData.name}</span>
        </div>
        <span className={`border border-white px-1 py-0.5 text-xs text-white`}>
          {serviceData.serviceType}
        </span>
      </div>

      {/* Health & latency */}
      <div className={`flex items-center justify-between border-b border-white px-3 py-1`}>
        <span className={`text-xs text-gray-400`}>{serviceData.health}</span>
        <span className={`text-xs text-gray-500`}>{serviceData.avgLatencyMs}ms</span>
      </div>

      {/* Rate limit */}
      {serviceData.rateLimit && (
        <div className={`border-b border-white px-3 py-1`}>
          <div className={`flex items-center justify-between text-xs`}>
            <span className={`text-gray-500`}>RATE</span>
            <span className={`text-white`}>
              {serviceData.rateLimit.remaining}/{serviceData.rateLimit.limit}
            </span>
          </div>
          <div className={`h-1 w-full bg-gray-900`}>
            <div
              className={`h-full ${rateLimitUsed > 0.8 ? 'bg-red-500' : rateLimitUsed > 0.5 ? 'bg-yellow-500' : 'bg-white'}`}
              style={{ width: `${rateLimitUsed * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Endpoints */}
      <div className={`border-b border-white px-3 py-1`}>
        <span className={`text-xs text-gray-500`}>ENDPOINTS: {serviceData.endpoints.length}</span>
      </div>

      {/* Stats */}
      <div className={`flex items-center justify-between px-3 py-1`}>
        <span className={`text-xs text-gray-500`}>{serviceData.requestCount} req</span>
        <span className={`text-xs text-gray-500`}>{serviceData.errorCount} err</span>
      </div>

      {/* Handles */}
      <Handle type={`target`} position={Position.Top} className={`!bg-white`} />
      <Handle type={`source`} position={Position.Bottom} className={`!bg-white`} />
      <Handle type={`target`} position={Position.Left} id={`auth`} className={`!bg-gray-500`} />
      <Handle type={`source`} position={Position.Right} id={`api`} className={`!bg-gray-500`} />
    </div>
  );
}

export const ServiceNode = memo(ServiceNodeComponent);