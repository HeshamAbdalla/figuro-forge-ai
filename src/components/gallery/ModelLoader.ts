
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ModelLoaderOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export class ModelLoader {
  private static loader = new GLTFLoader();
  private static cache = new Map<string, THREE.Group>();
  
  static async loadModel(url: string, options: ModelLoaderOptions = {}): Promise<THREE.Group> {
    const { onProgress, onError } = options;
    
    // Check cache first
    const cacheKey = this.getCacheKey(url);
    if (this.cache.has(cacheKey)) {
      console.log(`Model loaded from cache: ${url}`);
      return this.cache.get(cacheKey)!.clone();
    }
    
    try {
      console.log(`Loading model: ${url}`);
      
      const gltf = await new Promise<any>((resolve, reject) => {
        this.loader.load(
          url,
          (gltf) => resolve(gltf),
          (progress) => {
            if (onProgress) {
              const percent = (progress.loaded / progress.total) * 100;
              onProgress(percent);
            }
          },
          (error) => reject(error)
        );
      });
      
      const model = gltf.scene;
      
      // Optimize model for preview
      this.optimizeModel(model);
      
      // Cache the model
      this.cache.set(cacheKey, model.clone());
      
      console.log(`Model loaded successfully: ${url}`);
      return model;
      
    } catch (error) {
      console.error(`Failed to load model: ${url}`, error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }
  
  private static getCacheKey(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove cache-busting parameters
      ['t', 'cb', 'cache'].forEach(param => {
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
    console.log('Model cache cleared');
  }
  
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
