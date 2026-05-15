"use client";
import React, { useRef, useEffect } from "react";
import Globe from "react-globe.gl";

export const World = ({ data, globeConfig }: any) => {
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (globeRef.current) {
        globeRef.current.controls().autoRotate = globeConfig.autoRotate;
        globeRef.current.controls().autoRotateSpeed = globeConfig.autoRotateSpeed;
    }
  }, [globeConfig]);

  return (
    <Globe
      ref={globeRef}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      pointsData={[]} // Or use data if needed
      arcsData={data}
      arcStartLat={(d: any) => d.startLat}
      arcStartLng={(d: any) => d.startLng}
      arcEndLat={(d: any) => d.endLat}
      arcEndLng={(d: any) => d.endLng}
      arcColor={() => globeConfig.polygonColor}
      arcAltitude={(d: any) => d.arcAlt}
      arcStroke={1}
      arcDashLength={globeConfig.arcLength}
      arcDashGap={2}
      arcDashAnimateTime={globeConfig.arcTime}
    />
  );
};
