
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ModelCacheEntry {
  model: THREE.Group;
  loadTime: number;
  references: number;
}

class ModelManager {
  private static instance: ModelManager;
  private cache = new Map<string, ModelCacheEntry>();
  private loader = new GLTFLoader();
  private loadingPromises = new Map<string, Promise<THREE.Group>>();
  private readonly CACHE_MAX_SIZE = 10;
  private readonly CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  private getCacheKey(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove cache-busting parameters for consistent caching
      ['t', 'cb', 'cache', 'timestamp', '_t'].forEach(param => {
        urlObj.searchParams.delete(param);
      });
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.loadTime > this.CACHE_MAX_AGE || entry.references === 0) {
        this.disposeModel(entry.model);
        this.cache.delete(key);
      }
    });

    // If still over limit, remove oldest entries
    if (this.cache.size > this.CACHE_MAX_SIZE) {
      const sortedEntries = entries
        .sort((a, b) => a[1].loadTime - b[1].loadTime)
        .slice(0, this.cache.size - this.CACHE_MAX_SIZE);
      
      sortedEntries.forEach(([key, entry]) => {
        this.disposeModel(entry.model);
        this.cache.delete(key);
      });
    }
  }

  private disposeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  async loadModel(url: string): Promise<THREE.Group> {
    if (!url || url.trim() === '') {
      throw new Error('No model URL provided');
    }

    const cacheKey = this.getCacheKey(url);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.references++;
      console.log('📦 [MODEL-MANAGER] Loaded from cache:', url.substring(0, 50) + '...');
      return cached.model.clone();
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      console.log('⏳ [MODEL-MANAGER] Waiting for existing load:', url.substring(0, 50) + '...');
      const model = await this.loadingPromises.get(cacheKey)!;
      return model.clone();
    }

    // Start new load
    console.log('🔄 [MODEL-MANAGER] Loading new model:', url.substring(0, 50) + '...');
    
    const loadPromise = this.performLoad(url);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const model = await loadPromise;
      
      // Cache the model
      this.cache.set(cacheKey, {
        model: model.clone(),
        loadTime: Date.now(),
        references: 1
      });

      this.cleanupCache();
      console.log('✅ [MODEL-MANAGER] Model loaded and cached:', url.substring(0, 50) + '...');
      
      return model;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  private async performLoad(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          this.optimizeModel(model);
          resolve(model);
        },
        undefined,
        (error) => {
          console.error('❌ [MODEL-MANAGER] Load failed:', error);
          reject(new Error(`Failed to load model: ${error.message || 'Unknown error'}`));
        }
      );
    });
  }

  private optimizeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Optimize materials for showcase
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.envMapIntensity = 0.5;
                mat.needsUpdate = true;
              }
            });
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = 0.5;
            child.material.needsUpdate = true;
          }
        }
        
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Center and scale model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    model.position.sub(center);
    if (maxDim > 0) {
      model.scale.setScalar(2 / maxDim);
    }
  }

  releaseModel(url: string): void {
    const cacheKey = this.getCacheKey(url);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.references = Math.max(0, cached.references - 1);
    }
  }

  clearCache(): void {
    this.cache.forEach(entry => this.disposeModel(entry.model));
    this.cache.clear();
    this.loadingPromises.clear();
    console.log('🧹 [MODEL-MANAGER] Cache cleared');
  }
}

export const modelManager = ModelManager.getInstance();
