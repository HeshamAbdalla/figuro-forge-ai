
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { validateAndCleanUrl, isUrlAccessible } from "@/utils/urlValidationUtils";

interface ModelLoaderOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export class ModelLoader {
  private static loader = new GLTFLoader();
  private static cache = new Map<string, THREE.Group>();
  private static loadingPromises = new Map<string, Promise<THREE.Group>>();
  
  static async loadModel(url: string, options: ModelLoaderOptions = {}): Promise<THREE.Group> {
    const { onProgress, onError } = options;
    
    console.log(`ModelLoader: Starting load for ${url}`);
    
    // Validate and clean URL first
    const validation = validateAndCleanUrl(url);
    if (!validation.isValid) {
      const error = new Error(validation.error || 'URL validation failed');
      console.error('ModelLoader: URL validation failed:', error);
      if (onError) onError(error);
      throw error;
    }
    
    const cleanUrl = validation.cleanUrl;
    const cacheKey = this.getCacheKey(cleanUrl);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`ModelLoader: Model loaded from cache: ${cleanUrl}`);
      return this.cache.get(cacheKey)!.clone();
    }
    
    // Check if already loading to prevent duplicate requests
    if (this.loadingPromises.has(cacheKey)) {
      console.log(`ModelLoader: Model already loading, waiting for existing promise: ${cleanUrl}`);
      const model = await this.loadingPromises.get(cacheKey)!;
      return model.clone();
    }
    
    // Create loading promise
    const loadingPromise = this.performLoad(cleanUrl, onProgress, onError);
    this.loadingPromises.set(cacheKey, loadingPromise);
    
    try {
      const model = await loadingPromise;
      
      // Cache the model
      this.cache.set(cacheKey, model.clone());
      console.log(`ModelLoader: Model loaded and cached successfully: ${cleanUrl}`);
      
      return model;
    } finally {
      // Clean up loading promise
      this.loadingPromises.delete(cacheKey);
    }
  }
  
  private static async performLoad(
    cleanUrl: string, 
    onProgress?: (progress: number) => void,
    onError?: (error: Error) => void
  ): Promise<THREE.Group> {
    try {
      console.log(`ModelLoader: Loading model from: ${cleanUrl}`);
      
      // Optional connectivity check for better error messages
      const isAccessible = await isUrlAccessible(cleanUrl, 3000);
      if (!isAccessible) {
        console.warn(`ModelLoader: URL may not be accessible: ${cleanUrl}`);
      }
      
      const gltf = await new Promise<any>((resolve, reject) => {
        this.loader.load(
          cleanUrl,
          (gltf) => {
            console.log('ModelLoader: GLTF loaded successfully');
            resolve(gltf);
          },
          (progress) => {
            if (onProgress && progress.total > 0) {
              const percent = (progress.loaded / progress.total) * 100;
              onProgress(percent);
            }
          },
          (error) => {
            console.error('ModelLoader: GLTF load error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            reject(new Error(`Failed to load 3D model: ${errorMessage}`));
          }
        );
      });
      
      const model = gltf.scene;
      
      if (!model || model.children.length === 0) {
        throw new Error('Loaded model is empty or invalid');
      }
      
      // Optimize model for preview
      this.optimizeModel(model);
      
      return model;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown model loading error';
      console.error(`ModelLoader: Failed to load model: ${cleanUrl}`, error);
      
      const finalError = new Error(errorMessage);
      if (onError) {
        onError(finalError);
      }
      throw finalError;
    }
  }
  
  private static getCacheKey(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove cache-busting parameters
      ['t', 'cb', 'cache', 'timestamp', '_t'].forEach(param => {
        urlObj.searchParams.delete(param);
      });
      return urlObj.toString();
    } catch {
      return url;
    }
  }
  
  private static optimizeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Ensure materials are properly set up
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.needsUpdate = true;
              }
            });
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.needsUpdate = true;
          }
        }
        
        // Optimize geometry for preview
        if (child.geometry) {
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
        }
      }
    });
    
    // Center and scale the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    model.position.sub(center);
    if (maxDim > 0) {
      model.scale.setScalar(2 / maxDim);
    }
  }
  
  static clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    console.log('ModelLoader: Cache cleared');
  }
  
  static getCacheStats(): { size: number; keys: string[]; loading: number } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      loading: this.loadingPromises.size
    };
  }
}
