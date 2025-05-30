
import * as THREE from "three";

export interface TextureOptimizationOptions {
  maxSize?: number;
  format?: THREE.PixelFormat;
  generateMipmaps?: boolean;
  anisotropy?: number;
  compressionFormat?: string;
}

/**
 * Optimizes textures for better performance
 */
export class TextureOptimizer {
  private static textureCache = new Map<string, THREE.Texture>();
  private static maxCacheSize = 50;

  static optimizeTexture(
    texture: THREE.Texture,
    options: TextureOptimizationOptions = {}
  ): THREE.Texture {
    const {
      maxSize = 1024,
      generateMipmaps = true,
      anisotropy = 4
    } = options;

    // Clone the texture to avoid modifying the original
    const optimized = texture.clone();
    
    // Set optimal filtering
    optimized.minFilter = generateMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    optimized.magFilter = THREE.LinearFilter;
    optimized.generateMipmaps = generateMipmaps;
    
    // Set anisotropy for better quality at angles
    optimized.anisotropy = Math.min(anisotropy, 16); // Cap at 16 for compatibility
    
    // Optimize wrapping
    optimized.wrapS = THREE.ClampToEdgeWrap;
    optimized.wrapT = THREE.ClampToEdgeWrap;
    
    console.log('Texture optimized with settings:', {
      generateMipmaps,
      anisotropy: optimized.anisotropy,
      minFilter: optimized.minFilter,
      magFilter: optimized.magFilter
    });
    
    return optimized;
  }

  static cacheTexture(url: string, texture: THREE.Texture): void {
    // Implement LRU cache
    if (this.textureCache.size >= this.maxCacheSize) {
      const firstKey = this.textureCache.keys().next().value;
      const oldTexture = this.textureCache.get(firstKey);
      if (oldTexture) {
        oldTexture.dispose();
      }
      this.textureCache.delete(firstKey);
    }
    
    this.textureCache.set(url, texture);
    console.log(`Texture cached: ${url} (cache size: ${this.textureCache.size})`);
  }

  static getCachedTexture(url: string): THREE.Texture | undefined {
    return this.textureCache.get(url);
  }

  static clearCache(): void {
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
    console.log('Texture cache cleared');
  }

  static createPlaceholderTexture(color: number = 0xcccccc): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      ctx.fillRect(0, 0, 64, 64);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    return texture;
  }
}

/**
 * Material optimization utilities
 */
export class MaterialOptimizer {
  static optimizeMaterial(material: THREE.Material): THREE.Material {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Clone to avoid modifying original
      const optimized = material.clone();
      
      // Optimize shadow settings
      optimized.shadowSide = THREE.FrontSide;
      
      // Optimize for performance
      optimized.precision = 'lowp';
      
      // Reduce complexity for distant objects
      optimized.envMapIntensity = Math.min(optimized.envMapIntensity || 1, 0.5);
      
      return optimized;
    }
    
    return material;
  }

  static createLODMaterials(
    baseMaterial: THREE.Material,
    lodLevels: number = 4
  ): THREE.Material[] {
    const materials: THREE.Material[] = [];
    
    for (let i = 0; i < lodLevels; i++) {
      const material = baseMaterial.clone();
      
      if (material instanceof THREE.MeshStandardMaterial) {
        // Reduce quality for higher LOD levels
        const qualityFactor = 1 - (i * 0.2);
        material.envMapIntensity = (material.envMapIntensity || 1) * qualityFactor;
        
        // For highest LOD levels, use simpler materials
        if (i >= 2) {
          const basicMaterial = new THREE.MeshBasicMaterial({
            color: material.color,
            map: material.map
          });
          materials.push(basicMaterial);
        } else {
          materials.push(material);
        }
      } else {
        materials.push(material);
      }
    }
    
    return materials;
  }
}
