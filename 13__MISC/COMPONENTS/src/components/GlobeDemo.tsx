"use client";
import React, { Suspense } from "react";
import { motion } from "framer-motion";
import WorldMap from "@/components/ui/world-map";
 
export function GlobeDemo() {
  return (
    <div className="py-20 h-screen md:h-auto dark:bg-black bg-white relative w-full">
      <div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-50 pointer-events-none"
        >
          <h2 className="text-center text-xl md:text-4xl font-bold text-black dark:text-white">
            Global Network
          </h2>
          <p className="text-center text-base md:text-lg font-normal text-neutral-700 dark:text-neutral-200 max-w-md mt-2 mx-auto">
            Interactive World Connectivity.
          </p>
        </motion.div>
        
        <div className="absolute w-full -bottom-20 h-72 md:h-full z-10">
          <WorldMap
            dots={[
              { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: 34.0522, lng: -118.2437 } },
              { start: { lat: 64.2008, lng: -149.4937 }, end: { lat: -15.7975, lng: -47.8919 } },
              { start: { lat: -15.7975, lng: -47.8919 }, end: { lat: 38.7223, lng: -9.1393 } },
              { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 28.6139, lng: 77.209 } },
              { start: { lat: 28.6139, lng: 77.209 }, end: { lat: 43.1332, lng: 131.9113 } },
              { start: { lat: 28.6139, lng: 77.209 }, end: { lat: -1.2921, lng: 36.8219 } },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
