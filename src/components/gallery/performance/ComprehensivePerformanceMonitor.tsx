
import React, { useState, useEffect, useRef } from "react";
import { enhancedResourcePool } from "./EnhancedResourcePool";
import { webGLContextTracker } from "@/components/model-viewer/utils/resourceManager";

interface DetailedPerformanceStats {
  // Rendering performance
  fps: number;
  renderTime: number;
  frameTime: number;
  
  // Memory usage
  memoryUsage: number;
  heapUsed: number;
  heapTotal: number;
  
  // WebGL resources
  activeContexts: number;
  maxContexts: number;
  
  // Resource pool stats
  resourcePool: {
    cacheHits: number;
    cacheMisses: number;
    hitRatio: number;
    geometries: number;
    materials: number;
    textures: number;
    instances: number;
  };
  
  // Browser capabilities
  webglVersion: string;
  maxTextureSize: number;
  maxRenderbufferSize: number;
}

interface ComprehensivePerformanceMonitorProps {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  updateInterval?: number;
}

export const ComprehensivePerformanceMonitor: React.FC<ComprehensivePerformanceMonitorProps> = ({
  visible = false,
  position = 'top-right',
  updateInterval = 1000
}) => {
  const [stats, setStats] = useState<DetailedPerformanceStats>({
    fps: 0,
    renderTime: 0,
    frameTime: 0,
    memoryUsage: 0,
    heapUsed: 0,
    heapTotal: 0,
    activeContexts: 0,
    maxContexts: 6,
    resourcePool: {
      cacheHits: 0,
      cacheMisses: 0,
      hitRatio: 0,
      geometries: 0,
      materials: 0,
      textures: 0,
      instances: 0
    },
    webglVersion: 'Unknown',
    maxTextureSize: 0,
    maxRenderbufferSize: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderTimesRef = useRef<number[]>([]);

  useEffect(() => {
    // Only show in development
    if (!visible || process.env.NODE_ENV !== 'development') return;

    // Initialize WebGL capabilities detection
    const detectWebGLCapabilities = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (gl) {
        const version = gl.getParameter(gl.VERSION);
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        
        setStats(prev => ({
          ...prev,
          webglVersion: version,
          maxTextureSize,
          maxRenderbufferSize
        }));
      }
    };

    detectWebGLCapabilities();

    const updateStats = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      
      // Calculate FPS
      frameCountRef.current++;
      const fps = frameCountRef.current / (deltaTime / 1000);
      
      // Calculate average render time
      const avgRenderTime = renderTimesRef.current.length > 0
        ? renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length
        : 0;
      
      // Get memory usage
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / (1024 * 1024) : 0;
      const heapUsed = memory ? memory.usedJSHeapSize / (1024 * 1024) : 0;
      const heapTotal = memory ? memory.totalJSHeapSize / (1024 * 1024) : 0;
      
      // Get WebGL context info
      const activeContexts = webGLContextTracker.getActiveContextCount();
      
      // Get resource pool stats
      const resourcePool = enhancedResourcePool.getPerformanceStats();

      setStats(prev => ({
        ...prev,
        fps: Math.round(fps * 10) / 10,
        renderTime: Math.round(avgRenderTime * 100) / 100,
        frameTime: Math.round(deltaTime * 100) / 100,
        memoryUsage: Math.round(memoryUsage * 10) / 10,
        heapUsed: Math.round(heapUsed * 10) / 10,
        heapTotal: Math.round(heapTotal * 10) / 10,
        activeContexts,
        resourcePool
      }));

      // Reset counters
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      renderTimesRef.current = [];
    };

    const interval = setInterval(updateStats, updateInterval);

    // Performance observer for render timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes('render')) {
            renderTimesRef.current.push(entry.duration);
            if (renderTimesRef.current.length > 10) {
              renderTimesRef.current.shift();
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure'] });
      
      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    }

    return () => {
      clearInterval(interval);
    };
  }, [visible, updateInterval]);

  // Only show in development
  if (!visible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getPositionStyles = () => {
    const baseStyles = "fixed z-50 bg-black/95 text-white p-4 rounded-lg font-mono text-xs backdrop-blur-sm";
    
    switch (position) {
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return 'text-green-400';
    if (value >= thresholds[0]) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 100) return 'text-green-400';
    if (memory < 200) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={getPositionStyles()}>
      <div className="space-y-2 min-w-64">
        <div className="text-white/80 font-bold border-b border-white/20 pb-1">
          Performance Monitor (Dev)
        </div>
        
        {/* Rendering Performance */}
        <div className="space-y-1">
          <div className="text-white/60 text-xs font-semibold">Rendering</div>
          <div className={`${getPerformanceColor(stats.fps, [30, 50])}`}>
            FPS: {stats.fps}
          </div>
          <div className="text-white/80">
            Frame: {stats.frameTime}ms
          </div>
          <div className="text-white/80">
            Render: {stats.renderTime}ms
          </div>
        </div>
        
        {/* Memory Usage */}
        <div className="space-y-1">
          <div className="text-white/60 text-xs font-semibold">Memory</div>
          <div className={`${getMemoryColor(stats.memoryUsage)}`}>
            Used: {stats.memoryUsage}MB
          </div>
          <div className="text-white/80">
            Heap: {stats.heapUsed}/{stats.heapTotal}MB
          </div>
        </div>
        
        {/* WebGL Resources */}
        <div className="space-y-1">
          <div className="text-white/60 text-xs font-semibold">WebGL</div>
          <div className="text-white/80">
            Contexts: {stats.activeContexts}/{stats.maxContexts}
          </div>
          <div className="text-white/70 text-xs">
            {stats.webglVersion}
          </div>
          <div className="text-white/70 text-xs">
            Max Tex: {stats.maxTextureSize}px
          </div>
        </div>
        
        {/* Resource Pool */}
        <div className="space-y-1">
          <div className="text-white/60 text-xs font-semibold">Resource Pool</div>
          <div className="text-green-400">
            Hit Rate: {(stats.resourcePool.hitRatio * 100).toFixed(1)}%
          </div>
          <div className="text-white/80 text-xs">
            Geo: {stats.resourcePool.geometries}
          </div>
          <div className="text-white/80 text-xs">
            Mat: {stats.resourcePool.materials}
          </div>
          <div className="text-white/80 text-xs">
            Tex: {stats.resourcePool.textures}
          </div>
          <div className="text-white/80 text-xs">
            Inst: {stats.resourcePool.instances}
          </div>
        </div>
        
        {/* Cache Statistics */}
        <div className="space-y-1">
          <div className="text-white/60 text-xs font-semibold">Cache</div>
          <div className="text-green-400 text-xs">
            Hits: {stats.resourcePool.cacheHits}
          </div>
          <div className="text-red-400 text-xs">
            Misses: {stats.resourcePool.cacheMisses}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensivePerformanceMonitor;
