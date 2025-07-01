
import { smartWebGLManager } from './SmartWebGLManager';

interface BatchItem {
  id: string;
  modelUrl: string;
  priority: number;
  callback: (success: boolean, data?: any) => void;
  timestamp: number;
  attempts: number;
}

interface BatchConfig {
  maxBatchSize: number;
  maxConcurrent: number;
  retryAttempts: number;
  batchDelay: number;
}

export class SmartBatchLoader {
  private static instance: SmartBatchLoader;
  private pendingBatch: BatchItem[] = [];
  private activeBatch: BatchItem[] = [];
  private isProcessing = false;
  private config: BatchConfig = {
    maxBatchSize: 3,
    maxConcurrent: 2,
    retryAttempts: 2,
    batchDelay: 500
  };

  private constructor() {
    this.startBatchProcessor();
  }

  static getInstance(): SmartBatchLoader {
    if (!SmartBatchLoader.instance) {
      SmartBatchLoader.instance = new SmartBatchLoader();
    }
    return SmartBatchLoader.instance;
  }

  addToBatch(
    id: string,
    modelUrl: string,
    priority: number,
    callback: (success: boolean, data?: any) => void
  ): void {
    // Remove existing item with same ID
    this.pendingBatch = this.pendingBatch.filter(item => item.id !== id);
    
    // Add new item
    this.pendingBatch.push({
      id,
      modelUrl,
      priority,
      callback,
      timestamp: Date.now(),
      attempts: 0
    });

    // Sort by priority (higher first)
    this.pendingBatch.sort((a, b) => b.priority - a.priority);

    console.log(`[SmartBatch] Added to batch: ${id}, priority: ${priority}, pending: ${this.pendingBatch.length}`);
  }

  removeFromBatch(id: string): void {
    this.pendingBatch = this.pendingBatch.filter(item => item.id !== id);
    this.activeBatch = this.activeBatch.filter(item => item.id !== id);
    console.log(`[SmartBatch] Removed from batch: ${id}`);
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      if (!this.isProcessing && this.pendingBatch.length > 0) {
        this.processBatch();
      }
    }, this.config.batchDelay);
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Get items for current batch
      const batchItems = this.pendingBatch.splice(0, this.config.maxBatchSize);
      
      if (batchItems.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`[SmartBatch] Processing batch of ${batchItems.length} items`);
      
      // Process items with concurrency control
      const concurrentPromises: Promise<void>[] = [];
      
      for (let i = 0; i < Math.min(batchItems.length, this.config.maxConcurrent); i++) {
        const item = batchItems[i];
        if (item) {
          this.activeBatch.push(item);
          concurrentPromises.push(this.processItem(item));
        }
      }

      // Wait for all concurrent items to complete
      await Promise.allSettled(concurrentPromises);
      
      // Process remaining items if any
      const remaining = batchItems.slice(this.config.maxConcurrent);
      for (const item of remaining) {
        this.activeBatch.push(item);
        await this.processItem(item);
      }

    } catch (error) {
      console.error('[SmartBatch] Error processing batch:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processItem(item: BatchItem): Promise<void> {
    try {
      item.attempts++;
      
      // Request WebGL context
      const contextGranted = await smartWebGLManager.requestContext(
        item.id,
        item.priority,
        () => {
          // Context granted callback
          console.log(`[SmartBatch] Context granted for: ${item.id}`);
        },
        () => {
          // Cleanup callback
          console.log(`[SmartBatch] Cleanup for: ${item.id}`);
        }
      );

      if (contextGranted) {
        // Simulate model loading (replace with actual loading logic)
        await this.loadModel(item);
        item.callback(true, { modelUrl: item.modelUrl });
      } else {
        // Context not available, retry if attempts left
        if (item.attempts < this.config.retryAttempts) {
          console.log(`[SmartBatch] Retrying ${item.id}, attempt ${item.attempts}`);
          // Add back to pending with lower priority
          item.priority = Math.max(0, item.priority - 0.1);
          this.pendingBatch.unshift(item);
        } else {
          console.warn(`[SmartBatch] Max attempts reached for ${item.id}`);
          item.callback(false, { error: 'Max attempts reached' });
        }
      }
    } catch (error) {
      console.error(`[SmartBatch] Error processing item ${item.id}:`, error);
      item.callback(false, { error: error.message });
    } finally {
      // Remove from active batch
      this.activeBatch = this.activeBatch.filter(activeItem => activeItem.id !== item.id);
      
      // Release context
      smartWebGLManager.releaseContext(item.id);
    }
  }

  private async loadModel(item: BatchItem): Promise<void> {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    console.log(`[SmartBatch] Model loaded: ${item.id}`);
  }

  updateConfig(newConfig: Partial<BatchConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[SmartBatch] Config updated:', this.config);
  }

  getStats(): {
    pending: number;
    active: number;
    processing: boolean;
    config: BatchConfig;
  } {
    return {
      pending: this.pendingBatch.length,
      active: this.activeBatch.length,
      processing: this.isProcessing,
      config: this.config
    };
  }

  clear(): void {
    this.pendingBatch = [];
    this.activeBatch = [];
    this.isProcessing = false;
    console.log('[SmartBatch] Batch cleared');
  }
}

export const smartBatchLoader = SmartBatchLoader.getInstance();
