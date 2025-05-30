
import * as THREE from "three";

/**
 * Enhanced resource pool with advanced caching and LOD management
 */
class EnhancedResourcePool {
  private static instance: EnhancedResourcePool;
  
  // Caches for different resource types
  private geometryCache = new Map<string, THREE.BufferGeometry>();
  private materialCache = new Map<string, THREE.Material>();
  private textureCache = new Map<string, THREE.Texture>();
  private modelCache = new Map<string, THREE.Group>();
  private lodCache = new Map<string, THREE.LOD>();
  
  // Shared primitive geometries
  private sharedGeometries = new Map<string, THREE.BufferGeometry>();
  
  // Instance pools for efficient reuse
  private instancePools = new Map<string, THREE.InstancedMesh>();
  
  // Performance tracking
  private cacheHits = 0;
  private cacheMisses = 0;
  private maxCacheSize = 100;
  
  private constructor() {
    this.initializeSharedResources();
  }
  
  public static getInstance(): EnhancedResourcePool {
    if (!EnhancedResourcePool.instance) {
      EnhancedResourcePool.instance = new EnhancedResourcePool();
    }
    return EnhancedResourcePool.instance;
  }

  private initializeSharedResources(): void {
    // Create optimized shared geometries
    this.sharedGeometries.set('box', new THREE.BoxGeometry(1, 1, 1, 2, 2, 2));
    this.sharedGeometries.set('sphere', new THREE.SphereGeometry(0.5, 16, 12));
    this.sharedGeometries.set('plane', new THREE.PlaneGeometry(1, 1, 1, 1));
    this.sharedGeometries.set('cylinder', new THREE.CylinderGeometry(0.5, 0.5, 1, 12));
    
    // Optimize shared geometries
    this.sharedGeometries.forEach(geometry => {
      geometry.computeBoundingSphere();
      geometry.computeBoundingBox();
    });
  }

  public getOrCreateGeometry(key: string, createFn: () => THREE.BufferGeometry): THREE.BufferGeometry {
    if (this.geometryCache.has(key)) {
      this.cacheHits++;
      return this.geometryCache.get(key)!;
    }
    
    this.cacheMisses++;
    const geometry = createFn();
    this.setGeometry(key, geometry);
    return geometry;
  }

  public setGeometry(key: string, geometry: THREE.BufferGeometry): void {
    if (this.geometryCache.size >= this.maxCacheSize) {
      this.evictOldestGeometry();
    }
    
    // Optimize geometry
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    
    this.geometryCache.set(key, geometry);
  }

  public getOrCreateMaterial(config: {
    type: 'standard' | 'basic' | 'lambert' | 'phong';
    color?: string;
    roughness?: number;
    metalness?: number;
    transparent?: boolean;
    opacity?: number;
  }): THREE.Material {
    const key = JSON.stringify(config);
    
    if (this.materialCache.has(key)) {
      this.cacheHits++;
      return this.materialCache.get(key)!;
    }
    
    this.cacheMisses++;
    let material: THREE.Material;
    
    switch (config.type) {
      case 'standard':
        material = new THREE.MeshStandardMaterial({
          color: config.color || '#ffffff',
          roughness: config.roughness ?? 0.5,
          metalness: config.metalness ?? 0.0,
          transparent: config.transparent,
          opacity: config.opacity
        });
        break;
      case 'basic':
        material = new THREE.MeshBasicMaterial({
          color: config.color || '#ffffff',
          transparent: config.transparent,
          opacity: config.opacity
        });
        break;
      case 'lambert':
        material = new THREE.MeshLambertMaterial({
          color: config.color || '#ffffff',
          transparent: config.transparent,
          opacity: config.opacity
        });
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial({
          color: config.color || '#ffffff',
          transparent: config.transparent,
          opacity: config.opacity
        });
        break;
      default:
        material = new THREE.MeshStandardMaterial();
    }
    
    this.materialCache.set(key, material);
    return material;
  }

  public getOrCreateTexture(url: string, options: {
    maxSize?: number;
    generateMipmaps?: boolean;
    format?: THREE.PixelFormat;
    anisotropy?: number;
  } = {}): THREE.Texture {
    const key = `${url}_${JSON.stringify(options)}`;
    
    if (this.textureCache.has(key)) {
      this.cacheHits++;
      return this.textureCache.get(key)!;
    }
    
    this.cacheMisses++;
    const loader = new THREE.TextureLoader();
    const texture = loader.load(url);
    
    // Apply optimization options
    texture.generateMipmaps = options.generateMipmaps ?? true;
    texture.minFilter = options.generateMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = options.anisotropy ?? 4;
    
    if (options.format) {
      texture.format = options.format;
    }
    
    this.textureCache.set(key, texture);
    return texture;
  }

  public createInstancedMesh(
    geometry: THREE.BufferGeometry, 
    material: THREE.Material, 
    count: number,
    key?: string
  ): THREE.InstancedMesh {
    if (key && this.instancePools.has(key)) {
      return this.instancePools.get(key)!;
    }
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    
    if (key) {
      this.instancePools.set(key, instancedMesh);
    }
    
    return instancedMesh;
  }

  public getSharedGeometry(type: 'box' | 'sphere' | 'plane' | 'cylinder'): THREE.BufferGeometry {
    return this.sharedGeometries.get(type)!;
  }

  private evictOldestGeometry(): void {
    const firstKey = this.geometryCache.keys().next().value;
    if (firstKey) {
      const geometry = this.geometryCache.get(firstKey);
      geometry?.dispose();
      this.geometryCache.delete(firstKey);
    }
  }

  public clear(): void {
    // Dispose all cached resources
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.materialCache.forEach(material => material.dispose());
    this.textureCache.forEach(texture => texture.dispose());
    this.instancePools.forEach(mesh => mesh.dispose());
    
    this.geometryCache.clear();
    this.materialCache.clear();
    this.textureCache.clear();
    this.instancePools.clear();
    this.lodCache.clear();
    
    console.log("EnhancedResourcePool cleared");
  }

  public getPerformanceStats(): {
    cacheHits: number;
    cacheMisses: number;
    hitRatio: number;
    geometries: number;
    materials: number;
    textures: number;
    instances: number;
  } {
    const total = this.cacheHits + this.cacheMisses;
    return {
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRatio: total > 0 ? this.cacheHits / total : 0,
      geometries: this.geometryCache.size + this.sharedGeometries.size,
      materials: this.materialCache.size,
      textures: this.textureCache.size,
      instances: this.instancePools.size
    };
  }
}

export const enhancedResourcePool = EnhancedResourcePool.getInstance();
