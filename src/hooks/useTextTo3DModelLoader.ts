
import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextTo3DModelInfo } from '@/components/model-viewer/types/ModelViewerTypes';

interface UseTextTo3DModelLoaderReturn {
  model: THREE.Group | null;
  loading: boolean;
  error: string | null;
  progress: number;
  loadModel: () => Promise<void>;
  downloadStatus: string | null;
}

export const useTextTo3DModelLoader = (
  modelInfo: TextTo3DModelInfo
): UseTextTo3DModelLoaderReturn => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const loadModel = useCallback(async () => {
    if (!modelInfo.modelUrl) {
      console.warn('⚠️ [TEXT-3D-LOADER] No model URL provided');
      return;
    }

    console.log('🔄 [TEXT-3D-LOADER] Loading text-to-3D model:', {
      taskId: modelInfo.taskId,
      modelUrl: modelInfo.modelUrl,
      status: modelInfo.status
    });

    setLoading(true);
    setError(null);
    setProgress(0);
    setDownloadStatus('Downloading model...');

    try {
      const loader = new GLTFLoader();
      
      // Use local model URL if available, otherwise use remote URL
      const urlToLoad = modelInfo.localModelUrl || modelInfo.modelUrl;
      
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(
          urlToLoad,
          (gltf) => {
            console.log('✅ [TEXT-3D-LOADER] Model loaded successfully');
            resolve(gltf);
          },
          (progressEvent) => {
            if (progressEvent.lengthComputable) {
              const progressPercent = (progressEvent.loaded / progressEvent.total) * 100;
              setProgress(progressPercent);
              setDownloadStatus(`Downloading... ${Math.round(progressPercent)}%`);
            }
          },
          (error) => {
            console.error('❌ [TEXT-3D-LOADER] Failed to load model:', error);
            reject(error);
          }
        );
      });

      // Enhanced model processing for text-to-3D models
      const processedModel = gltf.scene.clone();
      
      // Apply text-to-3D specific optimizations
      processedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Enhance materials for better visual quality
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.envMapIntensity = 0.5;
                  mat.roughness = Math.min(mat.roughness + 0.1, 1.0);
                }
              });
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.envMapIntensity = 0.5;
              child.material.roughness = Math.min(child.material.roughness + 0.1, 1.0);
            }
          }
          
          // Enable shadow casting for text-to-3D models
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Center and scale the model based on text-to-3D metadata
      const box = new THREE.Box3().setFromObject(processedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Apply scaling based on metadata if available
      let targetScale = 1;
      if (modelInfo.metadata?.dimensions) {
        const maxDimension = Math.max(
          modelInfo.metadata.dimensions.width,
          modelInfo.metadata.dimensions.height,
          modelInfo.metadata.dimensions.depth
        );
        targetScale = 2 / maxDimension; // Scale to fit in a 2-unit cube
      } else {
        const maxSize = Math.max(size.x, size.y, size.z);
        targetScale = 2 / maxSize;
      }
      
      processedModel.scale.setScalar(targetScale);
      processedModel.position.sub(center.multiplyScalar(targetScale));

      setModel(processedModel);
      setDownloadStatus('Model ready');
      setProgress(100);
      
      console.log('✅ [TEXT-3D-LOADER] Text-to-3D model processing complete:', {
        taskId: modelInfo.taskId,
        polycount: modelInfo.metadata?.polycount,
        fileSize: modelInfo.metadata?.fileSize,
        dimensions: modelInfo.metadata?.dimensions
      });
      
    } catch (loadError) {
      console.error('❌ [TEXT-3D-LOADER] Model loading failed:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load model');
      setDownloadStatus('Download failed');
    } finally {
      setLoading(false);
    }
  }, [modelInfo]);

  // Auto-load when model info changes and status is completed
  useEffect(() => {
    if (modelInfo.status === 'SUCCEEDED' && modelInfo.modelUrl && !model) {
      loadModel();
    }
  }, [modelInfo.status, modelInfo.modelUrl, model, loadModel]);

  return {
    model,
    loading,
    error,
    progress,
    loadModel,
    downloadStatus
  };
};
