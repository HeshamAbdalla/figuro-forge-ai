
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

  // Validate modelInfo structure and provide defaults
  const validateModelInfo = useCallback((info: TextTo3DModelInfo): boolean => {
    if (!info) {
      console.error('❌ [TEXT-3D-LOADER] No modelInfo provided');
      return false;
    }
    
    if (!info.taskId) {
      console.warn('⚠️ [TEXT-3D-LOADER] Missing taskId in modelInfo');
    }
    
    if (!info.modelUrl) {
      console.warn('⚠️ [TEXT-3D-LOADER] Missing modelUrl in modelInfo');
      return false;
    }
    
    // Validate status format - normalize to standardized values
    const validStatuses = ['processing', 'completed', 'failed', 'SUCCEEDED'];
    if (!validStatuses.includes(info.status)) {
      console.warn('⚠️ [TEXT-3D-LOADER] Invalid status in modelInfo:', info.status);
    }
    
    return true;
  }, []);

  const loadModel = useCallback(async () => {
    // Early validation of modelInfo structure
    if (!validateModelInfo(modelInfo)) {
      setError('Invalid model information provided');
      return;
    }

    console.log('🔄 [TEXT-3D-LOADER] Loading text-to-3D model:', {
      taskId: modelInfo.taskId,
      modelUrl: !!modelInfo.modelUrl,
      status: modelInfo.status,
      hasLocalUrl: !!modelInfo.localModelUrl
    });

    setLoading(true);
    setError(null);
    setProgress(0);
    setDownloadStatus('Downloading model...');

    try {
      const loader = new GLTFLoader();
      
      // Prioritize local model URL for better performance, fallback to remote URL
      const urlToLoad = modelInfo.localModelUrl || modelInfo.modelUrl;
      
      if (!urlToLoad) {
        throw new Error('No valid model URL available');
      }
      
      console.log('📥 [TEXT-3D-LOADER] Loading from URL:', urlToLoad.substring(0, 50) + '...');
      
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
              
              console.log('📊 [TEXT-3D-LOADER] Download progress:', Math.round(progressPercent) + '%');
            } else {
              // For non-computable progress, show indeterminate progress
              setDownloadStatus('Downloading...');
            }
          },
          (error) => {
            console.error('❌ [TEXT-3D-LOADER] Failed to load model:', error);
            reject(error);
          }
        );
      });

      // Enhanced model processing specifically for text-to-3D models
      const processedModel = gltf.scene.clone();
      
      // Apply text-to-3D specific optimizations and enhancements
      processedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Enhance materials for better visual quality in text-to-3D models
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  // Optimize material properties for text-to-3D models
                  mat.envMapIntensity = 0.5;
                  mat.roughness = Math.min(mat.roughness + 0.1, 1.0);
                  mat.metalness = Math.max(mat.metalness - 0.1, 0.0);
                }
              });
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.envMapIntensity = 0.5;
              child.material.roughness = Math.min(child.material.roughness + 0.1, 1.0);
              child.material.metalness = Math.max(child.material.metalness - 0.1, 0.0);
            }
          }
          
          // Enable shadow casting for text-to-3D models for better visual integration
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Center and scale the model based on available metadata or computed bounds
      const box = new THREE.Box3().setFromObject(processedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Apply intelligent scaling based on metadata if available
      let targetScale = 1;
      if (modelInfo.metadata?.dimensions) {
        // Use metadata dimensions for precise scaling
        const maxDimension = Math.max(
          modelInfo.metadata.dimensions.width,
          modelInfo.metadata.dimensions.height,
          modelInfo.metadata.dimensions.depth
        );
        targetScale = 2 / maxDimension; // Scale to fit in a 2-unit cube
        
        console.log('🎯 [TEXT-3D-LOADER] Using metadata dimensions for scaling:', {
          dimensions: modelInfo.metadata.dimensions,
          targetScale
        });
      } else {
        // Fallback to computed bounding box scaling
        const maxSize = Math.max(size.x, size.y, size.z);
        targetScale = maxSize > 0 ? 2 / maxSize : 1;
        
        console.log('🎯 [TEXT-3D-LOADER] Using computed dimensions for scaling:', {
          computedSize: { x: size.x, y: size.y, z: size.z },
          targetScale
        });
      }
      
      // Apply transformations
      processedModel.scale.setScalar(targetScale);
      processedModel.position.sub(center.multiplyScalar(targetScale));

      setModel(processedModel);
      setDownloadStatus('Model ready');
      setProgress(100);
      
      console.log('✅ [TEXT-3D-LOADER] Text-to-3D model processing complete:', {
        taskId: modelInfo.taskId,
        polycount: modelInfo.metadata?.polycount || 'unknown',
        fileSize: modelInfo.metadata?.fileSize || 'unknown',
        dimensions: modelInfo.metadata?.dimensions || 'computed from bounds',
        finalScale: targetScale
      });
      
    } catch (loadError) {
      console.error('❌ [TEXT-3D-LOADER] Model loading failed:', loadError);
      
      // Enhanced error handling with specific error messages
      let errorMessage = 'Failed to load 3D model';
      if (loadError instanceof Error) {
        if (loadError.message.includes('404')) {
          errorMessage = 'Model file not found - it may still be processing';
        } else if (loadError.message.includes('network')) {
          errorMessage = 'Network error while downloading model';
        } else if (loadError.message.includes('CORS')) {
          errorMessage = 'Access denied - model URL may be invalid';
        } else if (loadError.message.includes('No valid model URL')) {
          errorMessage = 'No model URL available for download';
        } else {
          errorMessage = loadError.message;
        }
      }
      
      setError(errorMessage);
      setDownloadStatus('Download failed');
    } finally {
      setLoading(false);
    }
  }, [modelInfo, validateModelInfo]);

  // Auto-load when model info changes and status indicates completion
  useEffect(() => {
    // Only attempt to load if model has a successful status and URL
    const shouldAutoLoad = (
      modelInfo?.status === 'SUCCEEDED' || 
      modelInfo?.status === 'completed'
    ) && modelInfo?.modelUrl && !model && !loading;
    
    if (shouldAutoLoad) {
      console.log('🔄 [TEXT-3D-LOADER] Auto-loading model due to status change:', {
        status: modelInfo.status,
        hasUrl: !!modelInfo.modelUrl,
        hasModel: !!model,
        isLoading: loading
      });
      
      loadModel();
    }
  }, [modelInfo?.status, modelInfo?.modelUrl, model, loading, loadModel]);

  return {
    model,
    loading,
    error,
    progress,
    loadModel,
    downloadStatus
  };
};
