
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ModelLoaderOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  cleanUrl: string;
}

export class ModelLoader {
  private static loader = new GLTFLoader();
  private static cache = new Map<string, THREE.Group>();
  
  // Validate URL before attempting to load
  private static async validateUrl(url: string): Promise<UrlValidationResult> {
    try {
      const urlObj = new URL(url);
      
      // Check for expired Meshy.ai URLs
      if (urlObj.hostname.includes('meshy.ai') && urlObj.searchParams.has('Expires')) {
        const expiresTimestamp = parseInt(urlObj.searchParams.get('Expires') || '0');
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (expiresTimestamp < currentTimestamp) {
          return {
            isValid: false,
            error: 'Model URL has expired',
            cleanUrl: url
          };
        }
      }
      
      // Clean URL for better caching
      const cleanUrl = this.getCacheKey(url);
      
      // Basic connectivity test (without full download)
      try {
        const response = await fetch(cleanUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (!response.ok) {
          return {
            isValid: false,
            error: `Model not accessible (${response.status})`,
            cleanUrl
          };
        }
        
        return {
          isValid: true,
          cleanUrl
        };
      } catch (fetchError) {
        // If HEAD request fails, the model might still be loadable via direct GLTFLoader
        console.warn('HEAD request failed, will attempt direct load:', fetchError);
        return {
          isValid: true,
          cleanUrl
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid model URL format',
        cleanUrl: url
      };
    }
  }
  
  static async loadModel(url: string, options: ModelLoaderOptions = {}): Promise<THREE.Group> {
    const { onProgress, onError } = options;
    
    console.log(`ModelLoader: Starting load for ${url}`);
    
    // Validate URL first
    const validation = await this.validateUrl(url);
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
    
    try {
      console.log(`ModelLoader: Loading model from: ${cleanUrl}`);
      
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
            reject(new Error(`Failed to load 3D model: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        );
      });
      
      const model = gltf.scene;
      
      if (!model || model.children.length === 0) {
        throw new Error('Loaded model is empty or invalid');
      }
      
      // Optimize model for preview
      this.optimizeModel(model);
      
      // Cache the model
      this.cache.set(cacheKey, model.clone());
      
      console.log(`ModelLoader: Model loaded and cached successfully: ${cleanUrl}`);
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
    console.log('ModelLoader: Cache cleared');
  }
  
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
