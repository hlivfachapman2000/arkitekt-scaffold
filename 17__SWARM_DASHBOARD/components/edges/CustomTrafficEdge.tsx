"use client";
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const CustomTrafficEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isHot = data?.traffic > 0.7;

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
            ...style,
            strokeWidth: isHot ? 3 : 1.5,
            stroke: isHot ? '#a855f7' : '#3f3f46',
            transition: 'stroke 0.5s ease, stroke-width 0.5s ease',
        }} 
      />
      
      {/* Animated Packet */}
      <circle r="3" fill={isHot ? "#d946ef" : "#3b82f6"}>
        <animateMotion
          dur={isHot ? "1s" : "3s"}
          repeatCount="indefinite"
          path={edgePath}
        />
      </circle>

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {data?.label && (
            <div className={cn(
              "px-1.5 py-0.5 text-[7px] font-mono border rounded-none whitespace-nowrap bg-zinc-950 flex flex-col gap-0.5",
              isHot ? "border-purple-500 text-purple-400" : "border-zinc-800 text-zinc-600"
            )}>
              <span className="font-black uppercase">{data.label}</span>
              {data.tokens && <span className="opacity-60">{data.tokens} tokens</span>}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
