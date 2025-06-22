
import { useState, useEffect, useCallback } from 'react';
import { webGLContextTracker } from '../utils/resourceManager';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  webglContexts: number;
}

interface UseModelViewerPerformanceReturn {
  metrics: PerformanceMetrics;
  isPerformanceOptimal: boolean;
  shouldReduceQuality: boolean;
  resetMetrics: () => void;
}

export const useModelViewerPerformance = (enabled: boolean = false): UseModelViewerPerformanceReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    webglContexts: 0
  });

  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());

  const updateMetrics = useCallback(() => {
    if (!enabled) return;

    const now = performance.now();
    const deltaTime = now - lastTime;
    
    if (deltaTime >= 1000) { // Update every second
      const fps = Math.round((frameCount * 1000) / deltaTime);
      
      let memoryUsage = 0;
      if ((performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }

      setMetrics(prev => ({
        ...prev,
        fps,
        memoryUsage,
        renderTime: deltaTime / frameCount,
        webglContexts: webGLContextTracker.getActiveContextCount()
      }));

      setFrameCount(0);
      setLastTime(now);
    } else {
      setFrameCount(prev => prev + 1);
    }
  }, [enabled, frameCount, lastTime]);

  useEffect(() => {
    if (!enabled) return;

    let animationId: number;
    const animate = () => {
      updateMetrics();
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled, updateMetrics]);

  const isPerformanceOptimal = metrics.fps >= 30 && metrics.memoryUsage < 100;
  const shouldReduceQuality = metrics.fps < 20 || metrics.memoryUsage > 150;

  const resetMetrics = useCallback(() => {
    setMetrics({
      fps: 60,
      memoryUsage: 0,
      renderTime: 0,
      webglContexts: 0
    });
    setFrameCount(0);
    setLastTime(performance.now());
  }, []);

  return {
    metrics,
    isPerformanceOptimal,
    shouldReduceQuality,
    resetMetrics
  };
};
