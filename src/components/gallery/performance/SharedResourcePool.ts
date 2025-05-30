
import * as THREE from "three";

/**
 * Shared resource pool for gallery models to reduce memory usage
 */
class SharedResourcePool {
  private static instance: SharedResourcePool;
  private geometryCache = new Map<string, THREE.BufferGeometry>();
  private materialCache = new Map<string, THREE.Material>();
  private textureCache = new Map<string, THREE.Texture>();
  private sharedGeometries = new Map<string, THREE.BufferGeometry>();
  
  private constructor() {
    this.initializeSharedGeometries();
  }
  
  public static getInstance(): SharedResourcePool {
    if (!SharedResourcePool.instance) {
      SharedResourcePool.instance = new SharedResourcePool();
    }
    return SharedResourcePool.instance;
  }

  private initializeSharedGeometries(): void {
    // Create shared primitive geometries for fallbacks and placeholders
    this.sharedGeometries.set('box', new THREE.BoxGeometry(1, 1, 1));
    this.sharedGeometries.set('sphere', new THREE.SphereGeometry(0.5, 16, 12));
    this.sharedGeometries.set('plane', new THREE.PlaneGeometry(1, 1));
  }

  public getSharedGeometry(type: 'box' | 'sphere' | 'plane'): THREE.BufferGeometry {
    return this.sharedGeometries.get(type)!;
  }

  public getOrCreateTexture(url: string, options?: {
    maxSize?: number;
    generateMipmaps?: boolean;
  }): THREE.Texture {
    const key = `${url}_${options?.maxSize || 1024}_${options?.generateMipmaps || false}`;
    
    if (!this.textureCache.has(key)) {
      const loader = new THREE.TextureLoader();
      const texture = loader.load(url);
      
      if (options?.maxSize) {
        texture.repeat.set(1, 1);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
      }
      
      texture.generateMipmaps = options?.generateMipmaps ?? true;
      texture.minFilter = options?.generateMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
      
      this.textureCache.set(key, texture);
    }
    
    return this.textureCache.get(key)!;
  }

  public getOrCreateMaterial(config: {
    type: 'standard' | 'basic' | 'lambert';
    color?: string;
    roughness?: number;
    metalness?: number;
  }): THREE.Material {
    const key = JSON.stringify(config);
    
    if (!this.materialCache.has(key)) {
      let material: THREE.Material;
      
      switch (config.type) {
        case 'standard':
          material = new THREE.MeshStandardMaterial({
            color: config.color || '#ffffff',
            roughness: config.roughness ?? 0.5,
            metalness: config.metalness ?? 0.0
          });
          break;
        case 'basic':
          material = new THREE.MeshBasicMaterial({
            color: config.color || '#ffffff'
          });
          break;
        case 'lambert':
          material = new THREE.MeshLambertMaterial({
            color: config.color || '#ffffff'
          });
          break;
        default:
          material = new THREE.MeshStandardMaterial();
      }
      
      this.materialCache.set(key, material);
    }
    
    return this.materialCache.get(key)!;
  }

  public clear(): void {
    // Dispose cached resources
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.materialCache.forEach(material => material.dispose());
    this.textureCache.forEach(texture => texture.dispose());
    
    this.geometryCache.clear();
    this.materialCache.clear();
    this.textureCache.clear();
    
    console.log("SharedResourcePool cleared");
  }

  public getStats(): {
    geometries: number;
    materials: number;
    textures: number;
  } {
    return {
      geometries: this.geometryCache.size + this.sharedGeometries.size,
      materials: this.materialCache.size,
      textures: this.textureCache.size
    };
  }
}

export const sharedResourcePool = SharedResourcePool.getInstance();
