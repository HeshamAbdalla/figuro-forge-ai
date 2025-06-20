
import { prioritizeUrls, validateModelUrl } from './urlValidationUtils';
import { tryLoadWithCorsProxies } from './corsProxy';
import { TextTo3DModelInfo } from '@/components/model-viewer/types/ModelViewerTypes';

export const resolveTextTo3DModelUrl = async (
  modelInfo: TextTo3DModelInfo
): Promise<string> => {
  console.log('🔍 [TEXT-TO-3D-UTILS] Resolving model URL for task:', modelInfo.taskId);
  
  // Collect all available URLs with priority order
  const availableUrls: string[] = [];
  
  // First priority: Local storage URL (if available and downloaded)
  if (modelInfo.localModelUrl && modelInfo.downloadStatus === 'completed') {
    availableUrls.push(modelInfo.localModelUrl);
    console.log('✅ [TEXT-TO-3D-UTILS] Local storage URL available:', modelInfo.localModelUrl);
  }
  
  // Second priority: Original model URL
  if (modelInfo.modelUrl) {
    availableUrls.push(modelInfo.modelUrl);
    console.log('📡 [TEXT-TO-3D-UTILS] Original model URL available:', modelInfo.modelUrl);
  }
  
  if (availableUrls.length === 0) {
    throw new Error('No model URLs available');
  }
  
  // Use URL prioritization to select the best URL
  const selectedUrl = prioritizeUrls(availableUrls);
  if (!selectedUrl) {
    throw new Error('Failed to select a valid model URL');
  }
  
  // Validate the selected URL
  const validation = validateModelUrl(selectedUrl);
  if (!validation.valid) {
    throw new Error(validation.reason || 'Selected model URL is invalid');
  }
  
  console.log('🎯 [TEXT-TO-3D-UTILS] Selected model URL:', selectedUrl);
  return selectedUrl;
};

export const loadTextTo3DModelWithFallback = async (
  modelInfo: TextTo3DModelInfo,
  onProgress?: (progress: ProgressEvent) => void
): Promise<any> => {
  const selectedUrl = await resolveTextTo3DModelUrl(modelInfo);
  
  console.log('🔄 [TEXT-TO-3D-UTILS] Loading model with URL:', selectedUrl);
  
  // Import GLTFLoader dynamically
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    // For Supabase storage URLs, try direct loading first
    if (selectedUrl.includes('supabase.co/storage/v1/object/public/')) {
      console.log('🔄 [TEXT-TO-3D-UTILS] Loading directly from Supabase storage');
      
      loader.load(
        selectedUrl,
        (gltf) => {
          console.log('✅ [TEXT-TO-3D-UTILS] Model loaded successfully from storage');
          resolve(gltf.scene);
        },
        onProgress,
        (error) => {
          console.warn('⚠️ [TEXT-TO-3D-UTILS] Direct storage load failed, trying CORS proxies:', error);
          // Fallback to CORS proxy loading
          tryLoadWithCorsProxies(
            selectedUrl,
            (workingUrl: string) => {
              loader.load(
                workingUrl,
                (gltf) => {
                  console.log('✅ [TEXT-TO-3D-UTILS] Model loaded successfully via proxy');
                  resolve(gltf.scene);
                },
                onProgress,
                (proxyError) => {
                  console.error('❌ [TEXT-TO-3D-UTILS] Proxy GLTFLoader error:', proxyError);
                  reject(proxyError);
                }
              );
            },
            (proxyError) => {
              console.error('❌ [TEXT-TO-3D-UTILS] All loading attempts failed:', proxyError);
              reject(proxyError);
            }
          );
        }
      );
    } else {
      // For external URLs, use CORS proxy loading
      console.log('🔄 [TEXT-TO-3D-UTILS] Loading external URL via CORS proxy');
      
      tryLoadWithCorsProxies(
        selectedUrl,
        (workingUrl: string) => {
          console.log('🔄 [TEXT-TO-3D-UTILS] Attempting load with URL:', workingUrl);
          
          loader.load(
            workingUrl,
            (gltf) => {
              console.log('✅ [TEXT-TO-3D-UTILS] Model loaded successfully');
              resolve(gltf.scene);
            },
            onProgress,
            (error) => {
              console.error('❌ [TEXT-TO-3D-UTILS] GLTFLoader error:', error);
              reject(error);
            }
          );
        },
        (error: Error) => {
          console.error('❌ [TEXT-TO-3D-UTILS] All CORS proxy attempts failed:', error);
          reject(error);
        }
      );
    }
  });
};

export const validateTextTo3DModelInfo = (modelInfo: Partial<TextTo3DModelInfo>): string | null => {
  if (!modelInfo.taskId) {
    return 'Task ID is required';
  }
  
  if (!modelInfo.modelUrl && !modelInfo.localModelUrl) {
    return 'At least one model URL is required';
  }
  
  if (modelInfo.status !== 'SUCCEEDED' && modelInfo.status !== 'completed') {
    return `Model is not ready (status: ${modelInfo.status})`;
  }
  
  return null;
};
