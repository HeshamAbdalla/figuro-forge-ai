
import React, { useRef, useEffect, useState } from "react";
import { Center } from "@react-three/drei";
import * as THREE from "three";
import LoadingSpinner from "./LoadingSpinner";
import { useModelLoader } from "./hooks/useModelLoader";
import { disposeModel } from "./utils/modelUtils";
import { GeometryOptimizer, LODManager } from "./utils/geometryOptimizer";
import { TextureOptimizer, MaterialOptimizer } from "./utils/textureOptimizer";
import { WebGLResourceTracker } from "./utils/performanceMonitor";

interface Model3DProps {
  modelSource: string | null;
  modelBlob?: Blob | null;
  onError: (error: any) => void;
  isPreview?: boolean;
  enableLOD?: boolean;
  maxTriangles?: number;
}

const Model3D = ({ 
  modelSource, 
  modelBlob, 
  onError, 
  isPreview = false,
  enableLOD = true,
  maxTriangles = isPreview ? 2000 : 10000
}: Model3DProps) => {
  // Create a stable ID for this model with better uniqueness
  const modelIdRef = useRef<string>(`model3d-${Math.random().toString(36).substring(2, 10)}`);
  const processedModelRef = useRef<THREE.Group | THREE.LOD | null>(null);
  const lodManagerRef = useRef<LODManager | null>(null);
  const [optimizedModel, setOptimizedModel] = useState<THREE.Group | THREE.LOD | null>(null);
  const resourceTracker = WebGLResourceTracker.getInstance();
  
  // Extract model name from URL for better logging
  const modelName = modelSource ? modelSource.split('/').pop()?.split('?')[0] || 'unknown-model' : 'blob-model';
  
  console.log(`Loading model: ${modelName}, ID: ${modelIdRef.current}, Preview: ${isPreview}, MaxTriangles: ${maxTriangles}`);
  
  const { loading, model } = useModelLoader({ 
    modelSource, 
    modelBlob,
    modelId: modelIdRef.current,
    onError 
  });

  // Process and optimize model when loaded
  useEffect(() => {
    if (!model) {
      setOptimizedModel(null);
      return;
    }

    console.log(`Model loaded, starting optimization: ${modelName}`);
    
    try {
      // Clone the model to avoid modifying the original
      const clonedModel = model.clone();
      let finalModel: THREE.Group | THREE.LOD;

      if (enableLOD && !isPreview) {
        // Create LOD version for full viewer
        console.log(`Creating LOD system for: ${modelName}`);
        lodManagerRef.current = new LODManager();
        finalModel = createLODModel(clonedModel, maxTriangles);
      } else {
        // Single optimized model for preview or when LOD is disabled
        finalModel = optimizeModelGeometry(clonedModel, maxTriangles, isPreview);
      }

      // Dispose previous processed model if it exists
      if (processedModelRef.current && processedModelRef.current !== model) {
        disposeModel(processedModelRef.current);
      }
      
      processedModelRef.current = finalModel;
      setOptimizedModel(finalModel);
      
      console.log(`Model optimization complete: ${modelName}`);
      
    } catch (error) {
      console.error(`Error optimizing model ${modelName}:`, error);
      // Fallback to original model if optimization fails
      processedModelRef.current = model;
      setOptimizedModel(model);
    }
  }, [model, modelName, isPreview, enableLOD, maxTriangles]);

  // Cleanup processed model on unmount
  useEffect(() => {
    return () => {
      if (processedModelRef.current) {
        disposeModel(processedModelRef.current);
        processedModelRef.current = null;
      }
      lodManagerRef.current = null;
    };
  }, []);

  const optimizeModelGeometry = (
    model: THREE.Group, 
    maxTris: number, 
    preview: boolean
  ): THREE.Group => {
    const optimizedModel = model.clone();
    
    optimizedModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        try {
          // Track resources
          resourceTracker.trackGeometry();
          resourceTracker.trackMaterial();

          // Optimize geometry
          if (child.geometry) {
            const originalTriangles = child.geometry.getIndex()?.count || child.geometry.getAttribute('position').count;
            console.log(`Optimizing mesh with ${originalTriangles / 3} triangles`);
            
            const optimizedGeometry = GeometryOptimizer.optimizeGeometry(child.geometry, {
              maxTriangles: preview ? Math.min(maxTris / 2, 1000) : maxTris,
              preserveUVs: !preview,
              preserveNormals: true
            });
            
            // Dispose old geometry and assign new one
            child.geometry.dispose();
            child.geometry = optimizedGeometry;
          }

          // Optimize materials
          if (child.material) {
            const optimizedMaterial = MaterialOptimizer.optimizeMaterial(child.material);
            
            // Optimize textures
            if (optimizedMaterial instanceof THREE.MeshStandardMaterial) {
              if (optimizedMaterial.map) {
                optimizedMaterial.map = TextureOptimizer.optimizeTexture(optimizedMaterial.map, {
                  maxSize: preview ? 512 : 1024,
                  generateMipmaps: !preview,
                  anisotropy: preview ? 1 : 4
                });
                resourceTracker.trackTexture();
              }
              if (optimizedMaterial.normalMap) {
                optimizedMaterial.normalMap = TextureOptimizer.optimizeTexture(optimizedMaterial.normalMap, {
                  maxSize: preview ? 256 : 512,
                  generateMipmaps: !preview,
                  anisotropy: 1
                });
                resourceTracker.trackTexture();
              }
            }
            
            child.material = optimizedMaterial;
          }

          // Disable shadows for previews
          if (preview) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
          
        } catch (error) {
          console.warn(`Failed to optimize mesh in ${modelName}:`, error);
        }
      }
    });

    return optimizedModel;
  };

  const createLODModel = (model: THREE.Group, maxTris: number): THREE.LOD => {
    const lod = new THREE.LOD();
    const distances = [0, 25, 50, 100]; // LOD distances
    const triangleReductions = [1.0, 0.6, 0.3, 0.1]; // Triangle reduction ratios

    triangleReductions.forEach((reduction, index) => {
      const lodModel = model.clone();
      const targetTriangles = Math.max(100, Math.floor(maxTris * reduction));
      
      lodModel.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          try {
            const optimizedGeometry = GeometryOptimizer.optimizeGeometry(child.geometry, {
              maxTriangles: targetTriangles,
              preserveUVs: index === 0, // Only preserve UVs for highest quality LOD
              preserveNormals: true
            });
            
            child.geometry.dispose();
            child.geometry = optimizedGeometry;

            // Use simpler materials for distant LODs
            if (index >= 2 && child.material instanceof THREE.MeshStandardMaterial) {
              const basicMaterial = new THREE.MeshBasicMaterial({
                color: child.material.color,
                map: child.material.map
              });
              child.material = basicMaterial;
            }
            
          } catch (error) {
            console.warn(`Failed to create LOD level ${index}:`, error);
          }
        }
      });

      lod.addLevel(lodModel, distances[index]);
      console.log(`LOD level ${index} created with distance ${distances[index]} and ${targetTriangles} max triangles`);
    });

    return lod;
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return optimizedModel ? (
    <Center scale={[1.5, 1.5, 1.5]}>
      <primitive object={optimizedModel} />
    </Center>
  ) : null;
};

export default Model3D;
