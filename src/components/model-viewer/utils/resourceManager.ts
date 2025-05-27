
import * as THREE from "three";
import { disposeModel } from "./modelUtils";

/**
 * Clean up resources to prevent memory leaks
 * @param model The model to clean up
 * @param objectUrl The object URL to revoke
 * @param abortController The abort controller to abort
 */
export const cleanupResources = (
  model: THREE.Group | null,
  objectUrl: string | null,
  abortController: AbortController | null
): void => {
  // Abort any in-progress loads
  if (abortController) {
    try {
      abortController.abort();
      console.log("Aborted in-progress model load");
    } catch (error) {
      console.error("Error aborting model load:", error);
    }
  }
  
  // Dispose the model
  if (model) {
    try {
      console.log("Disposing model resources");
      disposeModel(model);
    } catch (error) {
      console.error("Error disposing model:", error);
    }
  }
  
  // Revoke object URL if we created one
  if (objectUrl && objectUrl.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(objectUrl);
      console.log("Revoked object URL:", objectUrl);
    } catch (error) {
      console.error("Error revoking object URL:", error);
    }
  }
  
  // Force garbage collection hint (not guaranteed to work)
  if (window.gc) {
    try {
      window.gc();
    } catch (e) {
      console.log("Manual GC not available");
    }
  }
};

/**
 * Enhanced WebGL context tracker with circuit breaker functionality
 */
class WebGLContextTracker {
  private static instance: WebGLContextTracker;
  private contextCount = 0;
  private readonly MAX_CONTEXTS = 6; // Conservative limit for most browsers
  private disposalTimeouts: number[] = [];
  private contextCreationTimes: number[] = [];
  private lastContextError: number = 0;
  private isCircuitBreakerOpen = false;
  private circuitBreakerResetTime = 0;
  
  private constructor() {
    // Monitor browser performance and adjust limits
    this.monitorPerformance();
  }
  
  public static getInstance(): WebGLContextTracker {
    if (!WebGLContextTracker.instance) {
      WebGLContextTracker.instance = new WebGLContextTracker();
    }
    return WebGLContextTracker.instance;
  }

  /**
   * Monitor performance and adjust context limits
   */
  private monitorPerformance(): void {
    setInterval(() => {
      const now = Date.now();
      
      // Clean up old creation times (older than 1 minute)
      this.contextCreationTimes = this.contextCreationTimes.filter(time => now - time < 60000);
      
      // Check for rapid context creation (more than 5 in 10 seconds)
      const recentCreations = this.contextCreationTimes.filter(time => now - time < 10000);
      if (recentCreations.length > 5) {
        console.warn(`[WebGL] Rapid context creation detected: ${recentCreations.length} in 10s`);
        this.openCircuitBreaker();
      }
      
      // Auto-reset circuit breaker after cooldown period
      if (this.isCircuitBreakerOpen && now > this.circuitBreakerResetTime) {
        this.closeCircuitBreaker();
      }
      
      // Memory-based context limit adjustment
      if (performance.memory) {
        const memoryUsageMB = performance.memory.usedJSHeapSize / (1024 * 1024);
        if (memoryUsageMB > 600) {
          this.MAX_CONTEXTS = Math.max(2, this.MAX_CONTEXTS - 1);
          console.warn(`[WebGL] High memory usage, reducing max contexts to ${this.MAX_CONTEXTS}`);
        }
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Open circuit breaker to prevent context creation
   */
  private openCircuitBreaker(): void {
    this.isCircuitBreakerOpen = true;
    this.circuitBreakerResetTime = Date.now() + 30000; // 30 second cooldown
    console.warn(`[WebGL] Circuit breaker opened - context creation suspended for 30s`);
  }

  /**
   * Close circuit breaker to allow context creation
   */
  private closeCircuitBreaker(): void {
    this.isCircuitBreakerOpen = false;
    console.log(`[WebGL] Circuit breaker closed - context creation allowed`);
  }
  
  public registerContext(): number {
    const now = Date.now();
    
    // Circuit breaker check
    if (this.isCircuitBreakerOpen) {
      throw new Error('WebGL context creation suspended - too many rapid creations');
    }
    
    // Rate limiting check
    const recentErrors = now - this.lastContextError;
    if (recentErrors < 5000) { // 5 second cooldown after error
      throw new Error('WebGL context creation rate limited after recent error');
    }
    
    // Clear any pending disposal timeouts
    this.clearDisposalTimeouts();
    
    this.contextCount++;
    this.contextCreationTimes.push(now);
    
    console.log(`WebGL context created. Active contexts: ${this.contextCount}/${this.MAX_CONTEXTS}`);
    
    // Warn if approaching limit
    if (this.contextCount > (this.MAX_CONTEXTS * 0.8)) {
      console.warn(`[WebGL] Approaching context limit: ${this.contextCount}/${this.MAX_CONTEXTS}`);
    }
    
    return this.contextCount;
  }
  
  public releaseContext(): number {
    // Use a timeout to help with disposal
    const timeoutId = window.setTimeout(() => {
      if (this.contextCount > 0) {
        this.contextCount--;
      }
      console.log(`WebGL context released. Active contexts: ${this.contextCount}/${this.MAX_CONTEXTS}`);
      
      // Remove this timeout from the array
      this.disposalTimeouts = this.disposalTimeouts.filter(id => id !== timeoutId);
    }, 1000) as unknown as number; // Increased delay for better stability
    
    this.disposalTimeouts.push(timeoutId);
    
    return this.contextCount;
  }
  
  private clearDisposalTimeouts(): void {
    this.disposalTimeouts.forEach(id => window.clearTimeout(id));
    this.disposalTimeouts = [];
  }
  
  public isNearingLimit(): boolean {
    return this.contextCount > (this.MAX_CONTEXTS * 0.7) || this.isCircuitBreakerOpen;
  }
  
  public canCreateContext(): boolean {
    return !this.isCircuitBreakerOpen && 
           this.contextCount < this.MAX_CONTEXTS && 
           (Date.now() - this.lastContextError) > 5000;
  }
  
  public getActiveContextCount(): number {
    return this.contextCount;
  }
  
  public getMaxContexts(): number {
    return this.MAX_CONTEXTS;
  }

  public recordContextError(): void {
    this.lastContextError = Date.now();
    console.error(`[WebGL] Context error recorded at ${new Date().toISOString()}`);
    
    // Open circuit breaker on error
    this.openCircuitBreaker();
  }

  public getStatus(): {
    active: number;
    max: number;
    circuitBreakerOpen: boolean;
    recentCreations: number;
    canCreate: boolean;
  } {
    const now = Date.now();
    const recentCreations = this.contextCreationTimes.filter(time => now - time < 10000).length;
    
    return {
      active: this.contextCount,
      max: this.MAX_CONTEXTS,
      circuitBreakerOpen: this.isCircuitBreakerOpen,
      recentCreations,
      canCreate: this.canCreateContext()
    };
  }
  
  public reset(): void {
    this.clearDisposalTimeouts();
    this.contextCount = 0;
    this.contextCreationTimes = [];
    this.lastContextError = 0;
    this.isCircuitBreakerOpen = false;
    this.circuitBreakerResetTime = 0;
    console.log("WebGL context tracker reset");
  }
}

export const webGLContextTracker = WebGLContextTracker.getInstance();

/**
 * Resource pool for managing shared Three.js resources
 */
class ResourcePool {
  private static instance: ResourcePool;
  private geometryCache = new Map<string, THREE.BufferGeometry>();
  private materialCache = new Map<string, THREE.Material>();
  private textureCache = new Map<string, THREE.Texture>();
  
  private constructor() {}
  
  public static getInstance(): ResourcePool {
    if (!ResourcePool.instance) {
      ResourcePool.instance = new ResourcePool();
    }
    return ResourcePool.instance;
  }
  
  public getOrCreateGeometry(key: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
    if (!this.geometryCache.has(key)) {
      this.geometryCache.set(key, factory());
    }
    return this.geometryCache.get(key)!;
  }
  
  public getOrCreateMaterial(key: string, factory: () => THREE.Material): THREE.Material {
    if (!this.materialCache.has(key)) {
      this.materialCache.set(key, factory());
    }
    return this.materialCache.get(key)!;
  }
  
  public getOrCreateTexture(key: string, factory: () => THREE.Texture): THREE.Texture {
    if (!this.textureCache.has(key)) {
      this.textureCache.set(key, factory());
    }
    return this.textureCache.get(key)!;
  }
  
  public clear(): void {
    // Dispose cached resources
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.materialCache.forEach(material => material.dispose());
    this.textureCache.forEach(texture => texture.dispose());
    
    this.geometryCache.clear();
    this.materialCache.clear();
    this.textureCache.clear();
    
    console.log("Resource pool cleared");
  }
  
  public getStats(): {
    geometries: number;
    materials: number;
    textures: number;
  } {
    return {
      geometries: this.geometryCache.size,
      materials: this.materialCache.size,
      textures: this.textureCache.size
    };
  }
}

export const resourcePool = ResourcePool.getInstance();
