
/**
 * Enhanced manager class to limit concurrent 3D model loading with priority support
 * Now integrated with SmartWebGLManager for better resource coordination
 */
import { smartWebGLManager } from '../context/SmartWebGLManager';

class ModelQueueManager {
  private static instance: ModelQueueManager;
  private loadingCount = 0;
  private maxConcurrent = 1; // Conservative limit to prevent WebGL issues
  private queue: Array<{
    id: string;
    priority: number;
    loader: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: any) => void;
  }> = [];
  private activeLoaders = new Set<string>();
  private abortControllers = new Map<string, AbortController>();
  private processingQueue = false;
  private lastProcessTime = 0;
  private loadHistory = new Map<string, { attempts: number; lastAttempt: number; failures: number }>();

  private constructor() {
    // Monitor performance and adjust queue behavior
    this.monitorPerformance();
  }

  public static getInstance(): ModelQueueManager {
    if (!ModelQueueManager.instance) {
      ModelQueueManager.instance = new ModelQueueManager();
    }
    return ModelQueueManager.instance;
  }

  /**
   * Type guard to check if performance.memory is available
   */
  private hasMemoryInfo(): boolean {
    return typeof performance !== 'undefined' && 
           performance.memory !== undefined && 
           typeof performance.memory.usedJSHeapSize === 'number';
  }

  /**
   * Monitor performance and adjust queue settings
   */
  private monitorPerformance(): void {
    setInterval(() => {
      // Check memory usage and adjust max concurrent loads with type guard
      if (this.hasMemoryInfo()) {
        const memoryUsageMB = performance.memory!.usedJSHeapSize / (1024 * 1024);
        
        if (memoryUsageMB > 500) { // High memory usage
          this.maxConcurrent = 1;
          console.warn(`[Queue] High memory usage (${memoryUsageMB.toFixed(2)}MB), reducing concurrent loads to 1`);
        } else if (memoryUsageMB < 200) { // Low memory usage
          this.maxConcurrent = Math.min(2, this.maxConcurrent + 1);
        }
      }
      
      // Coordinate with WebGL manager
      const webglStats = smartWebGLManager.getStats();
      if (!webglStats.canCreate) {
        this.maxConcurrent = Math.min(1, this.maxConcurrent);
      }
      
      // Clean up old load history
      const now = Date.now();
      for (const [id, history] of this.loadHistory.entries()) {
        if (now - history.lastAttempt > 300000) { // 5 minutes
          this.loadHistory.delete(id);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Set the maximum number of concurrent model loads
   */
  public setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, Math.min(max, 2)); // Clamp between 1 and 2
    console.log(`[Queue] Max concurrent loads set to ${this.maxConcurrent}`);
  }

  /**
   * Check if a model is currently being loaded
   */
  public isLoading(modelId: string): boolean {
    return this.activeLoaders.has(modelId);
  }

  /**
   * Get load statistics for a model
   */
  public getLoadHistory(modelId: string): { attempts: number; failures: number; lastAttempt: number } {
    return this.loadHistory.get(modelId) || { attempts: 0, failures: 0, lastAttempt: 0 };
  }

  /**
   * Abort a specific model load
   */
  public abortModelLoad(modelId: string): void {
    if (this.abortControllers.has(modelId)) {
      try {
        console.log(`[Queue] Aborting model load: ${modelId}`);
        this.abortControllers.get(modelId)?.abort();
        this.abortControllers.delete(modelId);
        this.activeLoaders.delete(modelId);
        
        // Remove from queue if present
        this.queue = this.queue.filter(item => item.id !== modelId);
        
        // Reduce loading count if this was an active loader
        if (this.loadingCount > 0) {
          this.loadingCount--;
        }
        
        // Process queue after delay
        setTimeout(() => this.processQueue(), 100);
      } catch (error) {
        console.error(`[Queue] Error aborting model load ${modelId}:`, error);
      }
    }
  }

  /**
   * Add a model loading task to the queue
   */
  public async queueModelLoad<T>(
    modelId: string,
    loader: () => Promise<T>,
    priority: number = 0.5
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Update load history
      const history = this.loadHistory.get(modelId) || { attempts: 0, failures: 0, lastAttempt: 0 };
      history.attempts++;
      history.lastAttempt = Date.now();
      this.loadHistory.set(modelId, history);

      // Add to queue
      this.queue.push({
        id: modelId,
        priority,
        loader: loader as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject
      });

      // Sort by priority (higher first)
      this.queue.sort((a, b) => b.priority - a.priority);

      console.log(`[Queue] Added model to queue: ${modelId}, priority: ${priority}, queue length: ${this.queue.length}`);
      
      // Process queue
      this.processQueue();
    });
  }

  /**
   * Process the loading queue
   */
  private async processQueue(): void {
    if (this.processingQueue || this.queue.length === 0) {
      return;
    }

    // Check if we can load more models
    if (this.loadingCount >= this.maxConcurrent) {
      return;
    }

    this.processingQueue = true;
    this.lastProcessTime = Date.now();

    try {
      while (this.queue.length > 0 && this.loadingCount < this.maxConcurrent) {
        const item = this.queue.shift()!;
        
        // Skip if already loading
        if (this.activeLoaders.has(item.id)) {
          continue;
        }

        // Start loading
        this.loadingCount++;
        this.activeLoaders.add(item.id);
        
        // Create abort controller
        const abortController = new AbortController();
        this.abortControllers.set(item.id, abortController);

        console.log(`[Queue] Starting model load: ${item.id}, concurrent: ${this.loadingCount}/${this.maxConcurrent}`);

        // Load model asynchronously
        this.loadModel(item, abortController);
      }
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Load a single model
   */
  private async loadModel(
    item: { id: string; priority: number; loader: () => Promise<unknown>; resolve: (value: unknown) => void; reject: (error: any) => void },
    abortController: AbortController
  ): Promise<void> {
    try {
      const result = await item.loader();
      
      if (!abortController.signal.aborted) {
        item.resolve(result);
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        // Update failure count
        const history = this.loadHistory.get(item.id);
        if (history) {
          history.failures++;
          this.loadHistory.set(item.id, history);
        }

        console.error(`[Queue] Model load failed: ${item.id}`, error);
        item.reject(error);
      }
    } finally {
      // Cleanup
      this.loadingCount--;
      this.activeLoaders.delete(item.id);
      this.abortControllers.delete(item.id);
      
      console.log(`[Queue] Model load completed: ${item.id}, remaining: ${this.loadingCount}`);
      
      // Process next items in queue
      setTimeout(() => this.processQueue(), 100);
    }
  }

  /**
   * Get queue statistics
   */
  public getQueueStats(): {
    loading: number;
    queued: number;
    maxConcurrent: number;
    activeLoaders: string[];
  } {
    return {
      loading: this.loadingCount,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      activeLoaders: Array.from(this.activeLoaders)
    };
  }

  /**
   * Clear the queue and abort all loads
   */
  public clearQueue(): void {
    // Abort all active loads
    for (const [id, controller] of this.abortControllers.entries()) {
      try {
        controller.abort();
      } catch (error) {
        console.error(`[Queue] Error aborting ${id}:`, error);
      }
    }

    // Clear all state
    this.queue = [];
    this.activeLoaders.clear();
    this.abortControllers.clear();
    this.loadingCount = 0;
    this.processingQueue = false;
    
    console.log('[Queue] Queue cleared');
  }

  /**
   * Reset the queue manager
   */
  public reset(): void {
    this.clearQueue();
    this.loadHistory.clear();
    console.log('[Queue] Queue manager reset');
  }
}

export const modelQueueManager = ModelQueueManager.getInstance();
