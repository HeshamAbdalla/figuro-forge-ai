
/**
 * Utility functions for detecting different types of 3D models
 */

export interface ModelTypeInfo {
  type: 'image-to-3d' | 'text-to-3d' | 'camera-capture' | 'custom-upload' | 'unknown';
  source: string;
  isGenerated: boolean;
}

/**
 * Detect if a model URL is from text-to-3D generation
 */
export const isTextTo3DModel = (modelUrl: string | null): boolean => {
  if (!modelUrl) return false;
  
  return modelUrl.includes('meshy.ai') || 
         modelUrl.includes('text-to-3d') ||
         modelUrl.includes('figurine-models') || // Supabase storage path for text-to-3D models
         modelUrl.includes('tasks/'); // Meshy task ID pattern
};

/**
 * Detect if a model URL is from image-to-3D conversion
 */
export const isImageTo3DModel = (modelUrl: string | null): boolean => {
  if (!modelUrl) return false;
  
  return modelUrl.includes('image-to-3d') ||
         modelUrl.includes('convert') ||
         modelUrl.includes('remesh');
};

/**
 * Detect if a model URL is from camera capture
 */
export const isCameraCaptureModel = (modelUrl: string | null): boolean => {
  if (!modelUrl) return false;
  
  return modelUrl.includes('camera-capture') ||
         modelUrl.includes('camera-3d') ||
         modelUrl.includes('mobile-capture');
};

/**
 * Detect if a model URL is from custom upload
 */
export const isCustomUploadModel = (modelUrl: string | null): boolean => {
  if (!modelUrl) return false;
  
  return modelUrl.startsWith('blob:') ||
         modelUrl.includes('custom-upload') ||
         modelUrl.includes('user-upload');
};

/**
 * Get comprehensive model type information
 */
export const getModelTypeInfo = (modelUrl: string | null): ModelTypeInfo => {
  if (!modelUrl) {
    return {
      type: 'unknown',
      source: 'none',
      isGenerated: false
    };
  }

  if (isTextTo3DModel(modelUrl)) {
    return {
      type: 'text-to-3d',
      source: 'AI Text-to-3D Generation',
      isGenerated: true
    };
  }

  if (isImageTo3DModel(modelUrl)) {
    return {
      type: 'image-to-3d',
      source: 'AI Image-to-3D Conversion',
      isGenerated: true
    };
  }

  if (isCameraCaptureModel(modelUrl)) {
    return {
      type: 'camera-capture',
      source: 'Camera Capture',
      isGenerated: true
    };
  }

  if (isCustomUploadModel(modelUrl)) {
    return {
      type: 'custom-upload',
      source: 'Custom Upload',
      isGenerated: false
    };
  }

  return {
    type: 'unknown',
    source: 'Unknown Source',
    isGenerated: false
  };
};

/**
 * Create TextTo3DModelInfo from URL for the text-to-3D loader
 */
export const createTextTo3DModelInfo = (modelUrl: string) => {
  // Extract task ID from URL if possible
  const taskIdMatch = modelUrl.match(/tasks\/([^\/]+)/);
  const taskId = taskIdMatch ? taskIdMatch[1] : `extracted-${Date.now()}`;
  
  return {
    taskId,
    modelUrl,
    status: 'SUCCEEDED', // Assume completed if we have the URL
    localModelUrl: undefined,
    thumbnailUrl: undefined,
    downloadStatus: 'completed'
  };
};
