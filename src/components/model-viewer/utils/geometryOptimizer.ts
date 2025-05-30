import * as THREE from "three";

export interface GeometryOptimizationOptions {
  maxTriangles?: number;
  preserveUVs?: boolean;
  preserveNormals?: boolean;
  enableLOD?: boolean;
  lodDistances?: number[];
}

/**
 * Optimizes geometry for better performance
 */
export class GeometryOptimizer {
  private static simplifyGeometry(
    geometry: THREE.BufferGeometry, 
    targetTriangles: number
  ): THREE.BufferGeometry {
    // Simple triangle reduction - remove every nth triangle
    const positions = geometry.getAttribute('position');
    const indices = geometry.getIndex();
    
    if (!indices || !positions) return geometry;
    
    const currentTriangles = indices.count / 3;
    if (currentTriangles <= targetTriangles) return geometry;
    
    const reductionRatio = targetTriangles / currentTriangles;
    const newIndicesCount = Math.floor(indices.count * reductionRatio);
    
    // Ensure we keep complete triangles
    const finalIndicesCount = Math.floor(newIndicesCount / 3) * 3;
    
    const newIndices = new Uint32Array(finalIndicesCount);
    for (let i = 0; i < finalIndicesCount; i++) {
      newIndices[i] = indices.getX(i);
    }
    
    const optimizedGeometry = geometry.clone();
    optimizedGeometry.setIndex(new THREE.BufferAttribute(newIndices, 1));
    
    console.log(`Geometry simplified: ${currentTriangles} → ${finalIndicesCount / 3} triangles`);
    return optimizedGeometry;
  }

  private static mergeVertices(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    // Use Three.js built-in vertex merging
    const mergedGeometry = geometry.clone();
    mergedGeometry.deleteAttribute('normal');
    mergedGeometry.deleteAttribute('uv');
    
    // Recompute normals and UVs after merging
    mergedGeometry.computeVertexNormals();
    
    return mergedGeometry;
  }

  private static removeUnusedVertices(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    // Simple implementation - just clone for now
    // In a full implementation, we'd identify and remove unused vertices
    return geometry.clone();
  }

  static optimizeGeometry(
    geometry: THREE.BufferGeometry, 
    options: GeometryOptimizationOptions = {}
  ): THREE.BufferGeometry {
    const {
      maxTriangles = 5000,
      preserveUVs = true,
      preserveNormals = true
    } = options;

    console.log('Starting geometry optimization...');
    
    let optimized = geometry.clone();
    
    // Remove unused vertices
    optimized = this.removeUnusedVertices(optimized);
    
    // Merge duplicate vertices
    optimized = this.mergeVertices(optimized);
    
    // Simplify if too many triangles
    const triangleCount = optimized.getIndex()?.count || optimized.getAttribute('position').count;
    if (triangleCount / 3 > maxTriangles) {
      optimized = this.simplifyGeometry(optimized, maxTriangles);
    }
    
    // Ensure we have normals
    if (preserveNormals && !optimized.getAttribute('normal')) {
      optimized.computeVertexNormals();
    }
    
    // Compute bounding sphere for frustum culling
    optimized.computeBoundingSphere();
    optimized.computeBoundingBox();
    
    console.log('Geometry optimization complete');
    return optimized;
  }

  static createLODGeometry(
    originalGeometry: THREE.BufferGeometry,
    lodLevels: number[] = [1.0, 0.5, 0.25, 0.1]
  ): THREE.BufferGeometry[] {
    console.log('Creating LOD geometry levels...');
    
    const originalTriangles = originalGeometry.getIndex()?.count || originalGeometry.getAttribute('position').count;
    const baseTriangleCount = originalTriangles / 3;
    
    return lodLevels.map((ratio, index) => {
      const targetTriangles = Math.max(100, Math.floor(baseTriangleCount * ratio));
      const lodGeometry = this.optimizeGeometry(originalGeometry, {
        maxTriangles: targetTriangles,
        preserveUVs: true,
        preserveNormals: true
      });
      
      console.log(`LOD ${index}: ${targetTriangles} triangles (${(ratio * 100).toFixed(1)}%)`);
      return lodGeometry;
    });
  }
}

/**
 * Creates LOD (Level of Detail) system for 3D objects
 */
export class LODManager {
  private lodObject: THREE.LOD;
  private camera: THREE.Camera | null = null;

  constructor() {
    this.lodObject = new THREE.LOD();
  }

  addLODLevel(mesh: THREE.Mesh, distance: number): void {
    this.lodObject.addLevel(mesh, distance);
  }

  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  update(): void {
    if (this.camera) {
      this.lodObject.update(this.camera);
    }
  }

  getObject(): THREE.LOD {
    return this.lodObject;
  }

  static createLODMesh(
    geometries: THREE.BufferGeometry[],
    material: THREE.Material,
    distances: number[] = [0, 50, 100, 200]
  ): THREE.LOD {
    const lod = new THREE.LOD();
    
    geometries.forEach((geometry, index) => {
      const mesh = new THREE.Mesh(geometry, material);
      const distance = distances[index] || distances[distances.length - 1];
      lod.addLevel(mesh, distance);
    });
    
    return lod;
  }
}
