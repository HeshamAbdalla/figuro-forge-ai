
import * as THREE from "three";
import { enhancedResourcePool } from "./EnhancedResourcePool";

export interface LODLevel {
  distance: number;
  triangleReduction: number;
  textureSize: number;
  enableShadows: boolean;
  materialComplexity: 'high' | 'medium' | 'low';
}

export class AdvancedLODSystem {
  private static readonly DEFAULT_LOD_LEVELS: LODLevel[] = [
    { distance: 0, triangleReduction: 1.0, textureSize: 1024, enableShadows: true, materialComplexity: 'high' },
    { distance: 25, triangleReduction: 0.7, textureSize: 512, enableShadows: true, materialComplexity: 'medium' },
    { distance: 50, triangleReduction: 0.4, textureSize: 256, enableShadows: false, materialComplexity: 'medium' },
    { distance: 100, triangleReduction: 0.2, textureSize: 128, enableShadows: false, materialComplexity: 'low' },
    { distance: 200, triangleReduction: 0.1, textureSize: 64, enableShadows: false, materialComplexity: 'low' }
  ];

  public static createLODFromModel(
    originalModel: THREE.Group,
    modelId: string,
    customLevels?: LODLevel[]
  ): THREE.LOD {
    const lod = new THREE.LOD();
    const levels = customLevels || this.DEFAULT_LOD_LEVELS;
    
    levels.forEach((level, index) => {
      const lodModel = this.createLODLevel(originalModel, level, `${modelId}_lod_${index}`);
      lod.addLevel(lodModel, level.distance);
    });
    
    return lod;
  }

  private static createLODLevel(
    originalModel: THREE.Group,
    level: LODLevel,
    levelId: string
  ): THREE.Group {
    const lodModel = originalModel.clone();
    
    lodModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.optimizeMeshForLOD(child, level, levelId);
      }
    });
    
    return lodModel;
  }

  private static optimizeMeshForLOD(
    mesh: THREE.Mesh,
    level: LODLevel,
    levelId: string
  ): void {
    // Optimize geometry
    if (mesh.geometry) {
      mesh.geometry = this.optimizeGeometryForLOD(mesh.geometry, level, levelId);
    }
    
    // Optimize material
    if (mesh.material) {
      mesh.material = this.optimizeMaterialForLOD(mesh.material, level);
    }
    
    // Configure shadows
    mesh.castShadow = level.enableShadows;
    mesh.receiveShadow = level.enableShadows;
  }

  private static optimizeGeometryForLOD(
    geometry: THREE.BufferGeometry,
    level: LODLevel,
    levelId: string
  ): THREE.BufferGeometry {
    const geometryKey = `${levelId}_geometry`;
    
    return enhancedResourcePool.getOrCreateGeometry(geometryKey, () => {
      const clonedGeometry = geometry.clone();
      
      if (level.triangleReduction < 1.0) {
        // Simplify geometry based on triangle reduction
        const positionAttribute = clonedGeometry.getAttribute('position');
        if (positionAttribute) {
          const originalCount = positionAttribute.count;
          const targetCount = Math.floor(originalCount * level.triangleReduction);
          
          // Simple decimation - remove every nth vertex
          if (targetCount < originalCount) {
            const step = Math.floor(originalCount / targetCount);
            const newPositions = [];
            const newNormals = [];
            const newUvs = [];
            
            const normalAttribute = clonedGeometry.getAttribute('normal');
            const uvAttribute = clonedGeometry.getAttribute('uv');
            
            for (let i = 0; i < originalCount; i += step) {
              // Position
              newPositions.push(
                positionAttribute.getX(i),
                positionAttribute.getY(i),
                positionAttribute.getZ(i)
              );
              
              // Normal
              if (normalAttribute) {
                newNormals.push(
                  normalAttribute.getX(i),
                  normalAttribute.getY(i),
                  normalAttribute.getZ(i)
                );
              }
              
              // UV
              if (uvAttribute) {
                newUvs.push(
                  uvAttribute.getX(i),
                  uvAttribute.getY(i)
                );
              }
            }
            
            clonedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
            if (newNormals.length > 0) {
              clonedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
            }
            if (newUvs.length > 0) {
              clonedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(newUvs, 2));
            }
          }
        }
      }
      
      // Recompute bounds and normals
      clonedGeometry.computeBoundingSphere();
      clonedGeometry.computeBoundingBox();
      if (!clonedGeometry.getAttribute('normal')) {
        clonedGeometry.computeVertexNormals();
      }
      
      return clonedGeometry;
    });
  }

  private static optimizeMaterialForLOD(
    material: THREE.Material,
    level: LODLevel
  ): THREE.Material {
    const materialConfig = {
      type: this.getMaterialTypeForComplexity(level.materialComplexity),
      color: '#ffffff',
      transparent: false,
      opacity: 1.0
    };
    
    // Extract color from original material
    if ('color' in material && material.color instanceof THREE.Color) {
      materialConfig.color = `#${material.color.getHexString()}`;
    }
    
    // Handle transparency
    if ('transparent' in material) {
      materialConfig.transparent = material.transparent || false;
    }
    
    if ('opacity' in material) {
      materialConfig.opacity = material.opacity || 1.0;
    }
    
    return enhancedResourcePool.getOrCreateMaterial(materialConfig);
  }

  private static getMaterialTypeForComplexity(complexity: 'high' | 'medium' | 'low'): 'standard' | 'basic' | 'lambert' | 'phong' {
    switch (complexity) {
      case 'high':
        return 'standard';
      case 'medium':
        return 'phong';
      case 'low':
        return 'basic';
      default:
        return 'basic';
    }
  }

  public static calculateOptimalLODLevel(
    distance: number,
    levels: LODLevel[] = this.DEFAULT_LOD_LEVELS
  ): LODLevel {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (distance >= levels[i].distance) {
        return levels[i];
      }
    }
    return levels[0];
  }
}
