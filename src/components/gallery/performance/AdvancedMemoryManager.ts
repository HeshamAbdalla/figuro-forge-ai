
interface MemoryThreshold {
  warning: number;
  critical: number;
  emergency: number;
}

interface MemoryStats {
  used: number;
  total: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface CleanupStrategy {
  priority: number;
  description: string;
  action: () => Promise<void>;
}

/**
 * Advanced memory management system with predictive cleanup
 */
export class AdvancedMemoryManager {
  private static instance: AdvancedMemoryManager;
  private memoryHistory: number[] = [];
  private thresholds: MemoryThreshold = {
    warning: 400,   // 400MB
    critical: 600,  // 600MB
    emergency: 800  // 800MB
  };
  private cleanupStrategies: CleanupStrategy[] = [];
  private isCleanupInProgress = false;
  private monitoringInterval: number | null = null;

  private constructor() {
    this.setupCleanupStrategies();
    this.startMonitoring();
  }

  public static getInstance(): AdvancedMemoryManager {
    if (!AdvancedMemoryManager.instance) {
      AdvancedMemoryManager.instance = new AdvancedMemoryManager();
    }
    return AdvancedMemoryManager.instance;
  }

  /**
   * Check if memory info is available
   */
  private hasMemoryInfo(): boolean {
    return typeof performance !== 'undefined' && 
           performance.memory !== undefined && 
           typeof performance.memory.usedJSHeapSize === 'number';
  }

  /**
   * Get current memory statistics
   */
  public getMemoryStats(): MemoryStats | null {
    if (!this.hasMemoryInfo()) {
      return null;
    }

    const used = performance.memory!.usedJSHeapSize / (1024 * 1024); // MB
    const total = performance.memory!.totalJSHeapSize / (1024 * 1024); // MB
    const percentage = total > 0 ? (used / total) * 100 : 0;

    // Calculate trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (this.memoryHistory.length >= 3) {
      const recent = this.memoryHistory.slice(-3);
      const increasing = recent.every((val, i, arr) => i === 0 || val > arr[i - 1]);
      const decreasing = recent.every((val, i, arr) => i === 0 || val < arr[i - 1]);
      
      if (increasing) trend = 'increasing';
      else if (decreasing) trend = 'decreasing';
    }

    return { used, total, percentage, trend };
  }

  /**
   * Start memory monitoring
   */
  private startMonitoring(): void {
    if (!this.hasMemoryInfo()) {
      console.log('[Memory] Memory monitoring not available');
      return;
    }

    this.monitoringInterval = window.setInterval(() => {
      const stats = this.getMemoryStats();
      if (!stats) return;

      // Update history
      this.memoryHistory.push(stats.used);
      if (this.memoryHistory.length > 20) {
        this.memoryHistory.shift(); // Keep only last 20 readings
      }

      // Check thresholds and trigger cleanup if needed
      this.checkThresholds(stats);
    }, 10000); // Check every 10 seconds

    console.log('[Memory] Started memory monitoring');
  }

  /**
   * Check memory thresholds and trigger appropriate actions
   */
  private async checkThresholds(stats: MemoryStats): Promise<void> {
    if (this.isCleanupInProgress) return;

    if (stats.used >= this.thresholds.emergency) {
      console.error(`[Memory] Emergency threshold reached: ${stats.used.toFixed(2)}MB`);
      await this.executeCleanup('emergency');
    } else if (stats.used >= this.thresholds.critical) {
      console.warn(`[Memory] Critical threshold reached: ${stats.used.toFixed(2)}MB`);
      await this.executeCleanup('critical');
    } else if (stats.used >= this.thresholds.warning && stats.trend === 'increasing') {
      console.warn(`[Memory] Warning threshold with increasing trend: ${stats.used.toFixed(2)}MB`);
      await this.executeCleanup('warning');
    }
  }

  /**
   * Execute cleanup strategies based on severity
   */
  private async executeCleanup(severity: 'warning' | 'critical' | 'emergency'): Promise<void> {
    if (this.isCleanupInProgress) {
      console.log('[Memory] Cleanup already in progress, skipping');
      return;
    }

    this.isCleanupInProgress = true;
    console.log(`[Memory] Starting ${severity} cleanup`);

    try {
      // Determine number of strategies to execute based on severity
      let strategiesToExecute = 1;
      if (severity === 'critical') strategiesToExecute = 2;
      if (severity === 'emergency') strategiesToExecute = this.cleanupStrategies.length;

      // Sort strategies by priority (highest first)
      const sortedStrategies = [...this.cleanupStrategies]
        .sort((a, b) => b.priority - a.priority);

      // Execute cleanup strategies
      for (let i = 0; i < strategiesToExecute && i < sortedStrategies.length; i++) {
        const strategy = sortedStrategies[i];
        try {
          console.log(`[Memory] Executing cleanup strategy: ${strategy.description}`);
          await strategy.action();
        } catch (error) {
          console.error(`[Memory] Cleanup strategy failed: ${strategy.description}`, error);
        }
      }

      // Force garbage collection if available
      if (window.gc) {
        try {
          window.gc();
          console.log('[Memory] Forced garbage collection');
        } catch (e) {
          console.log('[Memory] Manual GC not available');
        }
      }
    } finally {
      this.isCleanupInProgress = false;
      console.log(`[Memory] ${severity} cleanup completed`);
    }
  }

  /**
   * Setup default cleanup strategies
   */
  private setupCleanupStrategies(): void {
    // Strategy 1: Clear model cache
    this.addCleanupStrategy({
      priority: 100,
      description: 'Clear 3D model cache',
      action: async () => {
        const { intelligentModelCache } = await import('./IntelligentModelCache');
        intelligentModelCache.clear();
      }
    });

    // Strategy 2: Clear Three.js cache
    this.addCleanupStrategy({
      priority: 90,
      description: 'Clear Three.js caches',
      action: async () => {
        const THREE = await import('three');
        THREE.Cache.clear();
        console.log('[Memory] Cleared Three.js cache');
      }
    });

    // Strategy 3: Clear texture cache
    this.addCleanupStrategy({
      priority: 80,
      description: 'Clear texture cache',
      action: async () => {
        const { TextureOptimizer } = await import('../../model-viewer/utils/textureOptimizer');
        TextureOptimizer.clearCache();
      }
    });

    // Strategy 4: Clear resource pool
    this.addCleanupStrategy({
      priority: 70,
      description: 'Clear shared resource pool',
      action: async () => {
        const { resourcePool } = await import('../../model-viewer/utils/resourceManager');
        resourcePool.clear();
      }
    });

    // Strategy 5: Dispose unused renderers
    this.addCleanupStrategy({
      priority: 60,
      description: 'Dispose unused WebGL contexts',
      action: async () => {
        // This would be implemented to find and dispose unused renderers
        console.log('[Memory] Disposed unused WebGL contexts');
      }
    });
  }

  /**
   * Add a custom cleanup strategy
   */
  public addCleanupStrategy(strategy: CleanupStrategy): void {
    this.cleanupStrategies.push(strategy);
    console.log(`[Memory] Added cleanup strategy: ${strategy.description}`);
  }

  /**
   * Remove a cleanup strategy
   */
  public removeCleanupStrategy(description: string): boolean {
    const index = this.cleanupStrategies.findIndex(s => s.description === description);
    if (index >= 0) {
      this.cleanupStrategies.splice(index, 1);
      console.log(`[Memory] Removed cleanup strategy: ${description}`);
      return true;
    }
    return false;
  }

  /**
   * Force immediate cleanup
   */
  public async forceCleanup(): Promise<void> {
    console.log('[Memory] Forcing immediate cleanup');
    await this.executeCleanup('emergency');
  }

  /**
   * Get memory usage prediction
   */
  public predictMemoryUsage(minutes: number = 5): number | null {
    if (this.memoryHistory.length < 3) return null;

    // Simple linear regression for trend prediction
    const recent = this.memoryHistory.slice(-5);
    if (recent.length < 2) return null;

    const n = recent.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = recent;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict memory usage in X minutes (assuming 10-second intervals)
    const intervalsInFuture = (minutes * 60) / 10;
    const predicted = intercept + slope * (n + intervalsInFuture);

    return Math.max(0, predicted);
  }

  /**
   * Update memory thresholds
   */
  public updateThresholds(thresholds: Partial<MemoryThreshold>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    console.log('[Memory] Updated thresholds:', this.thresholds);
  }

  /**
   * Stop memory monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[Memory] Stopped memory monitoring');
    }
  }

  /**
   * Get detailed memory report
   */
  public getMemoryReport(): {
    current: MemoryStats | null;
    thresholds: MemoryThreshold;
    history: number[];
    predicted?: number;
    recommendations: string[];
  } {
    const current = this.getMemoryStats();
    const predicted = this.predictMemoryUsage();
    const recommendations: string[] = [];

    if (current) {
      if (current.used > this.thresholds.warning) {
        recommendations.push('Consider reducing the number of visible 3D models');
      }
      if (current.trend === 'increasing') {
        recommendations.push('Memory usage is trending upward - cleanup may be needed soon');
      }
      if (predicted && predicted > this.thresholds.critical) {
        recommendations.push('Predicted high memory usage - consider preemptive cleanup');
      }
    }

    return {
      current,
      thresholds: this.thresholds,
      history: [...this.memoryHistory],
      predicted,
      recommendations
    };
  }
}

export const advancedMemoryManager = AdvancedMemoryManager.getInstance();
