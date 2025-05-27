
/**
 * Enhanced manager class to limit concurrent 3D model loading with priority support
 */
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
   * Monitor performance and adjust queue settings
   */
  private monitorPerformance(): void {
    setInterval(() => {
      // Check memory usage and adjust max concurrent loads
      if (performance.memory && performance.memory.usedJSHeapSize) {
        const memoryUsageMB = performance.memory.usedJSHeapSize / (1024 * 1024);
        
        if (memoryUsageMB > 500) { // High memory usage
          this.maxConcurrent = 1;
          console.warn(`[Queue] High memory usage (${memoryUsageMB.toFixed(2)}MB), reducing concurrent loads to 1`);
        } else if (memoryUsageMB < 200) { // Low memory usage
          this.maxConcurrent = Math.min(2, this.maxConcurrent + 1);
        }
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
        
        // Process queue in case there are pending items with a delay
        setTimeout(() => this.processQueue(), 200);
      } catch (error) {
        console.error(`Error aborting model load for ${modelId}:`, error);
      }
    }
  }

  /**
   * Queue a model to be loaded with priority support
   */
  public async queueModelLoad<T>(
    modelId: string,
    loadFunction: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Check load history for circuit breaking
      const history = this.getLoadHistory(modelId);
      const now = Date.now();
      
      // Circuit breaker: if too many recent failures, delay the load
      if (history.failures > 2 && (now - history.lastAttempt) < 10000) {
        console.warn(`[Queue] Circuit breaker active for ${modelId}, delaying load`);
        setTimeout(() => {
          this.queueModelLoad(modelId, loadFunction, priority).then(resolve).catch(reject);
        }, 5000);
        return;
      }
      
      // Update load history
      this.loadHistory.set(modelId, {
        attempts: history.attempts + 1,
        failures: history.failures,
        lastAttempt: now
      });
      
      // If already loading this model, reject duplicate request
      if (this.activeLoaders.has(modelId)) {
        reject(new Error(`Model ${modelId} is already being loaded`));
        return;
      }

      const executeLoad = async () => {
        if (this.loadingCount >= this.maxConcurrent) {
          // Add to priority queue
          console.log(`[Queue] Queuing model: ${modelId} with priority ${priority}, queue length: ${this.queue.length + 1}`);
          
          // Insert into queue based on priority (higher priority first)
          let insertIndex = this.queue.length;
          for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].priority < priority) {
              insertIndex = i;
              break;
            }
          }
          
          this.queue.splice(insertIndex, 0, {
            id: modelId,
            priority,
            loader: executeLoad,
            resolve,
            reject
          });
          return;
        }

        // Create a new abort controller for this load
        const controller = new AbortController();
        this.abortControllers.set(modelId, controller);

        try {
          this.loadingCount++;
          this.activeLoaders.add(modelId);
          console.log(`[Queue] Loading model: ${modelId} (priority: ${priority}), Active: ${this.loadingCount}/${this.maxConcurrent}`);
          
          const result = await loadFunction();
          
          // Update success in history
          const currentHistory = this.getLoadHistory(modelId);
          this.loadHistory.set(modelId, {
            ...currentHistory,
            failures: 0 // Reset failures on success
          });
          
          resolve(result);
        } catch (error) {
          // Update failure in history
          const currentHistory = this.getLoadHistory(modelId);
          this.loadHistory.set(modelId, {
            ...currentHistory,
            failures: currentHistory.failures + 1
          });
          
          if (error instanceof DOMException && error.name === 'AbortError') {
            console.log(`[Queue] Loading of model ${modelId} was aborted`);
          } else {
            console.error(`[Queue] Error loading model ${modelId}:`, error);
          }
          reject(error);
        } finally {
          this.loadingCount--;
          this.activeLoaders.delete(modelId);
          this.abortControllers.delete(modelId);
          
          // Add a delay before processing the next item to prevent overload
          this.lastProcessTime = Date.now();
          setTimeout(() => this.processQueue(), 1000); // Increased delay for stability
        }
      };

      // Start loading or queue
      if (this.loadingCount < this.maxConcurrent) {
        executeLoad();
      } else {
        // Add to priority queue
        console.log(`[Queue] Queuing model: ${modelId} with priority ${priority}, queue length: ${this.queue.length + 1}`);
        
        // Insert into queue based on priority (higher priority first)
        let insertIndex = this.queue.length;
        for (let i = 0; i < this.queue.length; i++) {
          if (this.queue[i].priority < priority) {
            insertIndex = i;
            break;
          }
        }
        
        this.queue.splice(insertIndex, 0, {
          id: modelId,
          priority,
          loader: executeLoad,
          resolve,
          reject
        });
      }
    });
  }

  /**
   * Process the next item in the queue with enhanced stability
   */
  private processQueue(): void {
    // Prevent queue thrashing by enforcing minimum time between processes
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessTime;
    if (timeSinceLastProcess < 500) {
      console.log(`[Queue] Throttling queue processing - only ${timeSinceLastProcess}ms since last process`);
      setTimeout(() => this.processQueue(), 500 - timeSinceLastProcess);
      return;
    }
    
    if (this.processingQueue) return;
    this.processingQueue = true;
    
    try {
      if (this.queue.length > 0 && this.loadingCount < this.maxConcurrent) {
        // Get highest priority item
        const nextItem = this.queue.shift();
        if (nextItem) {
          console.log(`[Queue] Processing next in queue: ${nextItem.id} (priority: ${nextItem.priority}), remaining: ${this.queue.length}`);
          this.lastProcessTime = now;
          
          // Execute with delay to prevent race conditions
          setTimeout(() => {
            nextItem.loader().then(nextItem.resolve).catch(nextItem.reject);
          }, 300);
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Get current queue status
   */
  public getStatus(): { 
    loading: number; 
    queued: number; 
    maxConcurrent: number;
    totalHistory: number;
    averageFailureRate: number;
  } {
    const histories = Array.from(this.loadHistory.values());
    const totalAttempts = histories.reduce((sum, h) => sum + h.attempts, 0);
    const totalFailures = histories.reduce((sum, h) => sum + h.failures, 0);
    
    return {
      loading: this.loadingCount,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      totalHistory: this.loadHistory.size,
      averageFailureRate: totalAttempts > 0 ? totalFailures / totalAttempts : 0
    };
  }

  /**
   * Clear the queue and reset loading state
   */
  public reset(): void {
    // Abort all in-progress loads
    this.abortControllers.forEach((controller, modelId) => {
      try {
        console.log(`[Queue] Aborting model load during reset: ${modelId}`);
        controller.abort();
      } catch (error) {
        console.error(`Error aborting model load for ${modelId}:`, error);
      }
    });
    
    // Reject all queued items
    this.queue.forEach(item => {
      item.reject(new Error('Queue was reset'));
    });
    
    this.queue = [];
    this.loadingCount = 0;
    this.activeLoaders.clear();
    this.abortControllers.clear();
    this.loadHistory.clear();
    console.log("[Queue] Queue manager reset");
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(): {
    memoryUsage?: number;
    activeContexts: number;
    queueEfficiency: number;
  } {
    const memoryUsage = performance.memory ? 
      performance.memory.usedJSHeapSize / (1024 * 1024) : undefined;
    
    const histories = Array.from(this.loadHistory.values());
    const totalAttempts = histories.reduce((sum, h) => sum + h.attempts, 0);
    const totalFailures = histories.reduce((sum, h) => sum + h.failures, 0);
    const queueEfficiency = totalAttempts > 0 ? 1 - (totalFailures / totalAttempts) : 1;
    
    return {
      memoryUsage,
      activeContexts: this.loadingCount,
      queueEfficiency
    };
  }
}

export const modelQueueManager = ModelQueueManager.getInstance();
