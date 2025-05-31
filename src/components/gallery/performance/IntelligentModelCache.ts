
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface CacheEntry {
  model: THREE.Group;
  lastAccessed: number;
  accessCount: number;
  size: number;
  priority: number;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  memoryUsage: number;
}

/**
 * Intelligent caching system for 3D models with LRU eviction and priority management
 */
export class IntelligentModelCache {
  private static instance: IntelligentModelCache;
  private cache = new Map<string, CacheEntry>();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB max cache size
  private maxEntries = 20;
  private hitCount = 0;
  private missCount = 0;
  private loader = new GLTFLoader();

  private constructor() {
    this.setupMemoryMonitoring();
  }

  public static getInstance(): IntelligentModelCache {
    if (!IntelligentModelCache.instance) {
      IntelligentModelCache.instance = new IntelligentModelCache();
    }
    return IntelligentModelCache.instance;
  }

  /**
   * Get a model from cache or load it
   */
  public async getModel(url: string, priority: number = 1): Promise<THREE.Group> {
    const cacheKey = this.generateCacheKey(url);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      entry.lastAccessed = Date.now();
      entry.accessCount++;
      entry.priority = Math.max(entry.priority, priority);
      this.hitCount++;
      
      console.log(`[Cache] Hit for ${cacheKey}, total hits: ${this.hitCount}`);
      return entry.model.clone();
    }

    // Cache miss - load the model
    this.missCount++;
    console.log(`[Cache] Miss for ${cacheKey}, loading model...`);
    
    try {
      const gltf = await this.loader.loadAsync(url);
      const model = gltf.scene;
      
      // Calculate approximate size
      const size = this.calculateModelSize(model);
      
      // Create cache entry
      const entry: CacheEntry = {
        model: model.clone(),
        lastAccessed: Date.now(),
        accessCount: 1,
        size,
        priority
      };

      // Ensure cache capacity
      this.ensureCacheCapacity(size);
      
      // Add to cache
      this.cache.set(cacheKey, entry);
      
      console.log(`[Cache] Stored ${cacheKey}, cache size: ${this.cache.size}`);
      return model.clone();
    } catch (error) {
      console.error(`[Cache] Failed to load model ${url}:`, error);
      throw error;
    }
  }

  /**
   * Pre-load models for better performance
   */
  public async preloadModels(urls: string[], priority: number = 0.5): Promise<void> {
    const promises = urls.map(url => 
      this.getModel(url, priority).catch(error => {
        console.warn(`[Cache] Preload failed for ${url}:`, error);
        return null;
      })
    );
    
    await Promise.allSettled(promises);
    console.log(`[Cache] Preloaded ${urls.length} models`);
  }

  /**
   * Generate a stable cache key from URL
   */
  private generateCacheKey(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove cache-busting parameters
      ['t', 'cb', 'cache', '_'].forEach(param => {
        urlObj.searchParams.delete(param);
      });
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Calculate approximate memory usage of a model
   */
  private calculateModelSize(model: THREE.Group): number {
    let size = 0;
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          const geometry = child.geometry;
          size += (geometry.getAttribute('position')?.count || 0) * 12; // 3 floats * 4 bytes
          size += (geometry.getAttribute('normal')?.count || 0) * 12;
          size += (geometry.getAttribute('uv')?.count || 0) * 8; // 2 floats * 4 bytes
          size += (geometry.getIndex()?.count || 0) * 4; // indices
        }
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.map) size += 1024 * 1024; // Estimate 1MB per texture
            });
          } else {
            if (child.material.map) size += 1024 * 1024;
          }
        }
      }
    });
    
    return size;
  }

  /**
   * Ensure cache doesn't exceed capacity
   */
  private ensureCacheCapacity(newEntrySize: number): void {
    let currentSize = this.getCurrentCacheSize();
    
    // Remove entries if we're over capacity
    while ((currentSize + newEntrySize > this.maxCacheSize || this.cache.size >= this.maxEntries) && this.cache.size > 0) {
      const entryToRemove = this.selectEntryForEviction();
      if (entryToRemove) {
        const [key, entry] = entryToRemove;
        this.disposeModelEntry(entry);
        this.cache.delete(key);
        currentSize -= entry.size;
        console.log(`[Cache] Evicted ${key} to make space`);
      } else {
        break;
      }
    }
  }

  /**
   * Select entry for eviction based on LRU and priority
   */
  private selectEntryForEviction(): [string, CacheEntry] | null {
    if (this.cache.size === 0) return null;
    
    let selectedEntry: [string, CacheEntry] | null = null;
    let lowestScore = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      // Score based on last access time, access count, and priority
      const timeSinceAccess = Date.now() - entry.lastAccessed;
      const score = (timeSinceAccess / 1000) - (entry.accessCount * 100) - (entry.priority * 1000);
      
      if (score < lowestScore) {
        lowestScore = score;
        selectedEntry = [key, entry];
      }
    }
    
    return selectedEntry;
  }

  /**
   * Get current total cache size
   */
  private getCurrentCacheSize(): number {
    return Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
  }

  /**
   * Dispose of a model entry and its resources
   */
  private disposeModelEntry(entry: CacheEntry): void {
    entry.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if (typeof performance !== 'undefined' && performance.memory) {
      setInterval(() => {
        const memoryUsage = performance.memory!.usedJSHeapSize / (1024 * 1024);
        
        if (memoryUsage > 800) { // 800MB threshold
          console.warn(`[Cache] High memory usage: ${memoryUsage.toFixed(2)}MB`);
          this.emergencyCleanup();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Emergency cleanup when memory is high
   */
  private emergencyCleanup(): void {
    const entriesToRemove = Math.floor(this.cache.size * 0.3); // Remove 30% of entries
    const sortedEntries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => {
        const scoreA = (Date.now() - a.lastAccessed) / 1000 - a.priority * 100;
        const scoreB = (Date.now() - b.lastAccessed) / 1000 - b.priority * 100;
        return scoreB - scoreA; // Highest score first (least valuable)
      });
    
    for (let i = 0; i < entriesToRemove && i < sortedEntries.length; i++) {
      const [key, entry] = sortedEntries[i];
      this.disposeModelEntry(entry);
      this.cache.delete(key);
    }
    
    console.log(`[Cache] Emergency cleanup removed ${entriesToRemove} entries`);
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
    const memoryUsage = typeof performance !== 'undefined' && performance.memory ? 
      performance.memory.usedJSHeapSize / (1024 * 1024) : 0;
    
    return {
      totalEntries: this.cache.size,
      totalSize: this.getCurrentCacheSize(),
      hitRate,
      memoryUsage
    };
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    for (const entry of this.cache.values()) {
      this.disposeModelEntry(entry);
    }
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    console.log('[Cache] Cleared all entries');
  }

  /**
   * Remove specific entry from cache
   */
  public remove(url: string): boolean {
    const key = this.generateCacheKey(url);
    const entry = this.cache.get(key);
    
    if (entry) {
      this.disposeModelEntry(entry);
      this.cache.delete(key);
      console.log(`[Cache] Removed entry: ${key}`);
      return true;
    }
    
    return false;
  }
}

export const intelligentModelCache = IntelligentModelCache.getInstance();
