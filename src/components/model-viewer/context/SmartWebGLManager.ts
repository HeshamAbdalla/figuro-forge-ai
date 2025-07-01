
import { webGLContextTracker } from '../utils/resourceManager';

interface ContextRequest {
  id: string;
  priority: number;
  callback: () => void;
  cleanup: () => void;
  timestamp: number;
}

interface ContextPool {
  available: HTMLCanvasElement[];
  active: Map<string, HTMLCanvasElement>;
  total: number;
}

export class SmartWebGLManager {
  private static instance: SmartWebGLManager;
  private maxContexts = 3; // Conservative limit
  private requestQueue: ContextRequest[] = [];
  private activeContexts = new Map<string, HTMLCanvasElement>();
  private contextPool: ContextPool = {
    available: [],
    active: new Map(),
    total: 0
  };
  private isProcessing = false;
  private lastCleanup = 0;
  private cleanupInterval = 30000; // 30 seconds

  private constructor() {
    this.startCleanupTimer();
    this.monitorMemoryUsage();
  }

  static getInstance(): SmartWebGLManager {
    if (!SmartWebGLManager.instance) {
      SmartWebGLManager.instance = new SmartWebGLManager();
    }
    return SmartWebGLManager.instance;
  }

  async requestContext(
    id: string, 
    priority: number = 0.5,
    callback: () => void,
    cleanup: () => void
  ): Promise<boolean> {
    console.log(`[SmartWebGL] Context requested: ${id}, priority: ${priority}`);
    
    // Check if we can immediately satisfy the request
    if (this.canCreateContext()) {
      this.createContext(id, callback, cleanup);
      return true;
    }

    // Add to queue with priority
    this.requestQueue.push({
      id,
      priority,
      callback,
      cleanup,
      timestamp: Date.now()
    });

    // Sort queue by priority (higher priority first)
    this.requestQueue.sort((a, b) => b.priority - a.priority);

    // Process queue
    this.processQueue();
    
    return false;
  }

  releaseContext(id: string): void {
    if (this.activeContexts.has(id)) {
      const canvas = this.activeContexts.get(id)!;
      this.activeContexts.delete(id);
      
      // Return canvas to pool for reuse
      this.contextPool.available.push(canvas);
      
      console.log(`[SmartWebGL] Context released: ${id}. Active: ${this.activeContexts.size}`);
      
      // Process any pending requests
      setTimeout(() => this.processQueue(), 100);
    }
  }

  private canCreateContext(): boolean {
    return this.activeContexts.size < this.maxContexts && 
           webGLContextTracker.canCreateContext();
  }

  private createContext(id: string, callback: () => void, cleanup: () => void): void {
    try {
      // Try to reuse a canvas from pool
      let canvas = this.contextPool.available.pop();
      
      if (!canvas) {
        canvas = document.createElement('canvas');
        this.contextPool.total++;
      }

      this.activeContexts.set(id, canvas);
      this.contextPool.active.set(id, canvas);
      
      webGLContextTracker.registerContext();
      
      console.log(`[SmartWebGL] Context created: ${id}. Active: ${this.activeContexts.size}/${this.maxContexts}`);
      
      callback();
    } catch (error) {
      console.error(`[SmartWebGL] Failed to create context for ${id}:`, error);
      webGLContextTracker.recordContextError();
    }
  }

  private processQueue(): void {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0 && this.canCreateContext()) {
      const request = this.requestQueue.shift()!;
      
      // Check if request is still valid (not too old)
      if (Date.now() - request.timestamp < 30000) {
        this.createContext(request.id, request.callback, request.cleanup);
      } else {
        console.log(`[SmartWebGL] Expired request removed: ${request.id}`);
      }
    }
    
    this.isProcessing = false;
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);
  }

  private performCleanup(): void {
    const now = Date.now();
    
    // Clean up old unused canvases
    if (this.contextPool.available.length > 2) {
      const excess = this.contextPool.available.splice(2);
      excess.forEach(canvas => {
        try {
          const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (ctx && ctx.getExtension('WEBGL_lose_context')) {
            ctx.getExtension('WEBGL_lose_context').loseContext();
          }
        } catch (e) {
          console.warn('[SmartWebGL] Error cleaning up canvas:', e);
        }
      });
    }

    // Clean up expired queue requests
    this.requestQueue = this.requestQueue.filter(req => 
      now - req.timestamp < 60000 // Keep requests for 1 minute max
    );

    this.lastCleanup = now;
    console.log(`[SmartWebGL] Cleanup completed. Pool: ${this.contextPool.available.length}, Active: ${this.activeContexts.size}`);
  }

  private monitorMemoryUsage(): void {
    if (typeof performance !== 'undefined' && performance.memory) {
      setInterval(() => {
        const memoryUsageMB = performance.memory!.usedJSHeapSize / (1024 * 1024);
        
        if (memoryUsageMB > 400) {
          console.warn(`[SmartWebGL] High memory usage: ${memoryUsageMB.toFixed(2)}MB`);
          this.maxContexts = Math.max(1, this.maxContexts - 1);
          this.forceCleanup();
        } else if (memoryUsageMB < 200 && this.maxContexts < 3) {
          this.maxContexts = Math.min(3, this.maxContexts + 1);
        }
      }, 15000);
    }
  }

  private forceCleanup(): void {
    // Force cleanup of oldest contexts
    const contexts = Array.from(this.activeContexts.entries());
    if (contexts.length > this.maxContexts) {
      const toRemove = contexts.slice(this.maxContexts);
      toRemove.forEach(([id]) => {
        this.releaseContext(id);
      });
    }
  }

  getStats(): {
    active: number;
    max: number;
    queued: number;
    poolSize: number;
    canCreate: boolean;
  } {
    return {
      active: this.activeContexts.size,
      max: this.maxContexts,
      queued: this.requestQueue.length,
      poolSize: this.contextPool.available.length,
      canCreate: this.canCreateContext()
    };
  }

  reset(): void {
    // Clear all contexts
    this.activeContexts.clear();
    this.requestQueue = [];
    this.contextPool = { available: [], active: new Map(), total: 0 };
    this.isProcessing = false;
    
    console.log('[SmartWebGL] Manager reset');
  }
}

export const smartWebGLManager = SmartWebGLManager.getInstance();
