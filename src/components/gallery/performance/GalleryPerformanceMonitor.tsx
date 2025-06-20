
import React, { useState, useEffect } from "react";
import { sharedResourcePool } from "./SharedResourcePool";
import { webGLContextTracker } from "@/components/model-viewer/utils/resourceManager";

interface PerformanceStats {
  fps: number;
  memoryUsage: number;
  activeContexts: number;
  resourcePoolStats: {
    geometries: number;
    materials: number;
    textures: number;
  };
  renderTime: number;
}

interface GalleryPerformanceMonitorProps {
  visible?: boolean;
}

const GalleryPerformanceMonitor: React.FC<GalleryPerformanceMonitorProps> = ({
  visible = false
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    memoryUsage: 0,
    activeContexts: 0,
    resourcePoolStats: { geometries: 0, materials: 0, textures: 0 },
    renderTime: 0
  });

  const [lastFrameTime, setLastFrameTime] = useState(performance.now());
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    // Only show in development
    if (!visible || process.env.NODE_ENV !== 'development') return;

    const updateStats = () => {
      const now = performance.now();
      const deltaTime = now - lastFrameTime;
      
      // Calculate FPS
      const fps = 1000 / deltaTime;
      
      // Get memory usage (if available)
      const memoryUsage = (performance as any).memory 
        ? (performance as any).memory.usedJSHeapSize / (1024 * 1024)
        : 0;

      // Get WebGL context info
      const activeContexts = webGLContextTracker.getActiveContextCount();
      
      // Get resource pool stats
      const resourcePoolStats = sharedResourcePool.getStats();

      setStats({
        fps: Math.round(fps * 10) / 10,
        memoryUsage: Math.round(memoryUsage * 10) / 10,
        activeContexts,
        resourcePoolStats,
        renderTime: Math.round(deltaTime * 10) / 10
      });

      setLastFrameTime(now);
      setFrameCount(prev => prev + 1);
    };

    const interval = setInterval(updateStats, 1000); // Update every second

    return () => {
      clearInterval(interval);
    };
  }, [visible, lastFrameTime]);

  // Only show in development
  if (!visible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getPerformanceColor = (fps: number) => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 100) return 'text-green-400';
    if (memory < 200) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/90 text-white p-3 rounded-lg font-mono text-xs">
      <div className="space-y-1">
        <div className="text-white/60 font-bold">Gallery Performance (Dev)</div>
        
        <div className={`${getPerformanceColor(stats.fps)}`}>
          FPS: {stats.fps}
        </div>
        
        <div className={`${getMemoryColor(stats.memoryUsage)}`}>
          Memory: {stats.memoryUsage}MB
        </div>
        
        <div className="text-white/80">
          Contexts: {stats.activeContexts}
        </div>
        
        <div className="text-white/60 border-t border-white/20 pt-1 mt-1">
          Resources:
        </div>
        
        <div className="text-white/80 text-xs">
          Geo: {stats.resourcePoolStats.geometries}
        </div>
        
        <div className="text-white/80 text-xs">
          Mat: {stats.resourcePoolStats.materials}
        </div>
        
        <div className="text-white/80 text-xs">
          Tex: {stats.resourcePoolStats.textures}
        </div>
        
        <div className="text-white/80">
          Render: {stats.renderTime}ms
        </div>
      </div>
    </div>
  );
};

export default GalleryPerformanceMonitor;
