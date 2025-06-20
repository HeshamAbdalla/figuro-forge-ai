
/**
 * Performance monitoring for 3D rendering - Production Optimized
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private renderTime = 0;
  private memoryUsage = 0;
  private isMonitoring = false;
  private callbacks: Array<(stats: PerformanceStats) => void> = [];

  constructor() {
    this.lastTime = performance.now();
  }

  start(): void {
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance monitoring started');
    }
  }

  stop(): void {
    this.isMonitoring = false;
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance monitoring stopped');
    }
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
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in performance callback:', error);
        }
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

  static getInstance(): WebGLResourceTracker {
    if (!this.instance) {
      this.instance = new WebGLResourceTracker();
    }
    return this.instance;
  }

  trackTexture(): void {
    this.resources.textures++;
  }

  releaseTexture(): void {
    this.resources.textures = Math.max(0, this.resources.textures - 1);
  }

  trackGeometry(): void {
    this.resources.geometries++;
  }

  releaseGeometry(): void {
    this.resources.geometries = Math.max(0, this.resources.geometries - 1);
  }

  trackMaterial(): void {
    this.resources.materials++;
  }

  releaseMaterial(): void {
    this.resources.materials = Math.max(0, this.resources.materials - 1);
  }

  trackProgram(): void {
    this.resources.programs++;
  }

  releaseProgram(): void {
    this.resources.programs = Math.max(0, this.resources.programs - 1);
  }

  getResourceCount(): typeof this.resources {
    return { ...this.resources };
  }

  getTotalResources(): number {
    return Object.values(this.resources).reduce((sum, count) => sum + count, 0);
  }

  reset(): void {
    this.resources = {
      textures: 0,
      geometries: 0,
      materials: 0,
      programs: 0
    };
  }

  logResources(): void {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('WebGL Resources:', this.resources);
      console.log('Total Resources:', this.getTotalResources());
    }
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();
