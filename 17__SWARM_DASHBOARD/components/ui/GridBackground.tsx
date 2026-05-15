import { cn } from "../../lib/utils";
import React from "react";
import { motion } from "framer-motion";

export function GridBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative flex h-full w-full bg-black overflow-hidden">
      {/* Layer 1: Large Grid */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:60px_60px]",
          "[background-image:linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)]",
        )}
      />
      
      {/* Layer 2: Small Grid / Dots */}
      <div
        className={cn(
          "absolute inset-0 opacity-50",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#27272a_1px,transparent_1px)]",
        )}
      />

      {/* Moving Scanning Line */}
      <motion.div 
        animate={{ 
          top: ["-10%", "110%"],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute left-0 right-0 h-[200px] bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none z-0"
      />

      {/* Radial gradient mask for depth */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black)]"></div>
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
