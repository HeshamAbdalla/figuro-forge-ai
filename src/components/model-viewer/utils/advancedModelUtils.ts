
import * as THREE from "three";

// Advanced model optimization utilities
export class AdvancedModelOptimizer {
  static optimizeForPreview(model: THREE.Group, maxTriangles = 5000): THREE.Group {
    const optimized = model.clone();
    let totalTriangles = 0;
    
    // Count total triangles
    optimized.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const triangles = child.geometry.index 
          ? child.geometry.index.count / 3 
          : child.geometry.getAttribute('position').count / 3;
        totalTriangles += triangles;
      }
    });
    
    // If under limit, return as-is
    if (totalTriangles <= maxTriangles) {
      return optimized;
    }
    
    // Calculate reduction ratio
    const reductionRatio = maxTriangles / totalTriangles;
    
    optimized.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        child.geometry = this.simplifyGeometry(child.geometry, reductionRatio);
      }
    });
    
    return optimized;
  }
  
  static simplifyGeometry(geometry: THREE.BufferGeometry, ratio: number): THREE.BufferGeometry {
    // Simple vertex reduction - in production, you might use more sophisticated algorithms
    const positionAttribute = geometry.getAttribute('position');
    const normalAttribute = geometry.getAttribute('normal');
    const uvAttribute = geometry.getAttribute('uv');
    
    if (!positionAttribute) return geometry;
    
    const vertexCount = positionAttribute.count;
    const targetVertexCount = Math.max(100, Math.floor(vertexCount * ratio));
    
    if (targetVertexCount >= vertexCount) return geometry;
    
    // Create simplified geometry
    const simplifiedGeometry = new THREE.BufferGeometry();
    const step = Math.floor(vertexCount / targetVertexCount);
    
    const newPositions: number[] = [];
    const newNormals: number[] = [];
    const newUVs: number[] = [];
    
    for (let i = 0; i < vertexCount; i += step) {
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
        newUVs.push(
          uvAttribute.getX(i),
          uvAttribute.getY(i)
        );
      }
    }
    
    simplifiedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    
    if (newNormals.length > 0) {
      simplifiedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
    }
    
    if (newUVs.length > 0) {
      simplifiedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(newUVs, 2));
    }
    
    simplifiedGeometry.computeBoundingBox();
    simplifiedGeometry.computeBoundingSphere();
    
    return simplifiedGeometry;
  }
  
  static createLevelOfDetail(model: THREE.Group): THREE.LOD {
    const lod = new THREE.LOD();
    
    // High detail (close)
    lod.addLevel(model.clone(), 0);
    
    // Medium detail (medium distance)
    const mediumDetail = this.optimizeForPreview(model, 2000);
    lod.addLevel(mediumDetail, 25);
    
    // Low detail (far)
    const lowDetail = this.optimizeForPreview(model, 500);
    lod.addLevel(lowDetail, 50);
    
    return lod;
  }
}

// Material enhancement utilities
export class MaterialEnhancer {
  static enhanceForViewer(material: THREE.Material): THREE.Material {
    if (material instanceof THREE.MeshStandardMaterial) {
      const enhanced = material.clone();
      
      // Enhance visual properties
      enhanced.roughness = Math.max(0.1, enhanced.roughness * 0.8);
      enhanced.metalness = Math.min(1.0, enhanced.metalness * 1.2);
      
      // Add environment mapping if missing
      if (!enhanced.envMap) {
        enhanced.envMapIntensity = 0.3;
      }
      
      return enhanced;
    }
    
    return material;
  }
  
  static createWireframeOverlay(geometry: THREE.BufferGeometry): THREE.LineSegments {
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.2
    });
    
    return new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
  }
}

// Animation utilities
export class ModelAnimator {
  static createIdleAnimation(model: THREE.Group): THREE.AnimationMixer | null {
    const mixer = new THREE.AnimationMixer(model);
    
    // Create subtle floating animation
    const floatTrack = new THREE.VectorKeyframeTrack(
      '.position',
      [0, 2, 4],
      [0, 0, 0, 0, 0.1, 0, 0, 0, 0]
    );
    
    const rotationTrack = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      [0, 2, 4],
      [0, 0, 0, 1, 0, 0.1, 0, 1, 0, 0, 0, 1]
    );
    
    const clip = new THREE.AnimationClip('idle', 4, [floatTrack, rotationTrack]);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();
    
    return mixer;
  }
}
