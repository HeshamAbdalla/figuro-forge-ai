
/**
 * Performance monitoring for 3D rendering - Production Optimized
 */
import { logger } from "@/utils/logLevelManager";

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private renderTime = 0;
  private memoryUsage = 0;
  private isMonitoring = false;
  private callbacks: Array<(stats: PerformanceStats) => void> = [];
  private lastLogTime = 0;
  private logInterval = 5000; // Log every 5 seconds instead of every frame

  constructor() {
    this.lastTime = performance.now();
  }

  start(): void {
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lastLogTime = performance.now();
    logger.debug('Performance monitoring started', 'performance');
  }

  stop(): void {
    this.isMonitoring = false;
    logger.debug('Performance monitoring stopped', 'performance');
  }

  update(): void {
    if (!this.isMonitoring) return;

    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // Calculate FPS every second
    if (deltaTime >= 1000) {
      this.fps = (this.frameCount * 1000) / deltaTime;
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Get memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }

      const stats: PerformanceStats = {
        fps: this.fps,
        renderTime: this.renderTime,
        memoryUsage: this.memoryUsage,
        timestamp: currentTime
      };

      this.notifyCallbacks(stats);

      // Throttled logging - only log performance issues or at intervals
      const shouldLog = currentTime - this.lastLogTime > this.logInterval;
      const hasPerformanceIssue = this.fps < 30 || this.memoryUsage > 100;
      
      if (shouldLog || hasPerformanceIssue) {
        if (hasPerformanceIssue) {
          logger.warn('Performance issue detected', 'performance', {
            fps: this.fps.toFixed(1),
            memory: this.memoryUsage.toFixed(1) + 'MB'
          });
        } else {
          logger.debug('Performance stats', 'performance', {
            fps: this.fps.toFixed(1),
            memory: this.memoryUsage.toFixed(1) + 'MB',
            renderTime: this.renderTime.toFixed(1) + 'ms'
          });
        }
        this.lastLogTime = currentTime;
      }
    }
  }

  measureRenderTime<T>(renderFunction: () => T): T {
    const startTime = performance.now();
    const result = renderFunction();
    this.renderTime = performance.now() - startTime;
    return result;
  }

  addCallback(callback: (stats: PerformanceStats) => void): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (stats: PerformanceStats) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  private notifyCallbacks(stats: PerformanceStats): void {
    this.callbacks.forEach(callback => {
      try {
        callback(stats);
      } catch (error) {
        logger.error('Error in performance callback', 'performance', error);
      }
    });
  }

  getStats(): PerformanceStats {
    return {
      fps: this.fps,
      renderTime: this.renderTime,
      memoryUsage: this.memoryUsage,
      timestamp: performance.now()
    };
  }
}

export interface PerformanceStats {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  timestamp: number;
}

/**
 * WebGL resource tracker - Production Optimized
 */
export class WebGLResourceTracker {
  private static instance: WebGLResourceTracker | null = null;
  private resources = {
    textures: 0,
    geometries: 0,
    materials: 0,
    programs: 0
  };
  private lastLogTime = 0;
  private logInterval = 10000; // Log every 10 seconds

  static getInstance(): WebGLResourceTracker {
    if (!this.instance) {
      this.instance = new WebGLResourceTracker();
    }
    return this.instance;
  }

  trackTexture(): void {
    this.resources.textures++;
    this.throttledLog();
  }

  releaseTexture(): void {
    this.resources.textures = Math.max(0, this.resources.textures - 1);
  }

  trackGeometry(): void {
    this.resources.geometries++;
    this.throttledLog();
  }

  releaseGeometry(): void {
    this.resources.geometries = Math.max(0, this.resources.geometries - 1);
  }

  trackMaterial(): void {
    this.resources.materials++;
    this.throttledLog();
  }

  releaseMaterial(): void {
    this.resources.materials = Math.max(0, this.resources.materials - 1);
  }

  trackProgram(): void {
    this.resources.programs++;
    this.throttledLog();
  }

  releaseProgram(): void {
    this.resources.programs = Math.max(0, this.resources.programs - 1);
  }

  private throttledLog(): void {
    const now = performance.now();
    const totalResources = this.getTotalResources();
    
    // Log if it's been a while or if resource count is high
    if (now - this.lastLogTime > this.logInterval || totalResources > 100) {
      if (totalResources > 100) {
        logger.warn('High WebGL resource usage', 'webgl-tracker', {
          total: totalResources,
          breakdown: this.resources
        });
      } else {
        logger.debug('WebGL resource usage', 'webgl-tracker', {
          total: totalResources,
          breakdown: this.resources
        });
      }
      this.lastLogTime = now;
    }
  }

  getResourceCount(): typeof this.resources {
    return { ...this.resources };
  }

  getTotalResources(): number {
    return Object.values(this.resources).reduce((sum, count) => sum + count, 0);
  }

  reset(): void {
    logger.debug('Resetting WebGL resources', 'webgl-tracker');
    this.resources = {
      textures: 0,
      geometries: 0,
      materials: 0,
      programs: 0
    };
  }

  logResources(): void {
    logger.debug('WebGL Resources', 'webgl-tracker', {
      resources: this.resources,
      total: this.getTotalResources()
    });
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();
