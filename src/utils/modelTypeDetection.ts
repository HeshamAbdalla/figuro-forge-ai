
import { TextTo3DModelInfo, UrlModelInfo } from '@/components/model-viewer/types/ModelViewerTypes';

// Model type detection utilities
export const isTextTo3DModel = (modelUrl: string | null): boolean => {
  if (!modelUrl) return false;
  
  // Check for text-to-3D specific patterns in URL
  return (
    modelUrl.includes('text-to-3d') ||
    modelUrl.includes('meshy.ai') ||
    modelUrl.includes('task_id') ||
    modelUrl.includes('textTo3D')
  );
};

export const isCameraCaptureModel = (modelUrl: string | null): boolean => {
  if (!modelUrl) return false;
  
  return (
    modelUrl.includes('camera-capture') ||
    modelUrl.includes('camera_') ||
    modelUrl.includes('photo-to-3d')
  );
};

export const isImageTo3DModel = (modelUrl: string | null): boolean => {
  if (!modelUrl) return false;
  
  return (
    modelUrl.includes('image-to-3d') ||
    modelUrl.includes('img2mesh') ||
    (modelUrl.includes('generated-image') && !isTextTo3DModel(modelUrl))
  );
};

export const isCustomUpload = (modelUrl: string | null): boolean => {
  if (!modelUrl) return false;
  
  return modelUrl.startsWith('blob:');
};

// Extract task ID from text-to-3D URLs
export const extractTaskId = (modelUrl: string): string | null => {
  if (!modelUrl) return null;
  
  // Try different patterns to extract task ID
  const patterns = [
    /task_id[=\/]([a-zA-Z0-9-_]+)/,
    /tasks\/([a-zA-Z0-9-_]+)/,
    /text-to-3d[\/=]([a-zA-Z0-9-_]+)/,
    /([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})/
  ];
  
  for (const pattern of patterns) {
    const match = modelUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Fallback: generate task ID from URL hash
  return btoa(modelUrl).substring(0, 16);
};

// Create TextTo3DModelInfo from URL
export const createTextTo3DModelInfo = (
  modelUrl: string,
  options: {
    prompt?: string;
    artStyle?: string;
    negativePrompt?: string;
    status?: 'processing' | 'completed' | 'failed';
    progress?: number;
    thumbnailUrl?: string;
  } = {}
): TextTo3DModelInfo => {
  const taskId = extractTaskId(modelUrl) || `task_${Date.now()}`;
  
  return {
    type: 'text-to-3d',
    taskId,
    modelUrl,
    thumbnailUrl: options.thumbnailUrl,
    prompt: options.prompt,
    artStyle: options.artStyle || 'realistic',
    negativePrompt: options.negativePrompt,
    progress: options.progress || 100,
    status: options.status || 'completed'
  };
};

// Create UrlModelInfo from simple URL
export const createUrlModelInfo = (
  modelUrl: string,
  options: {
    fileName?: string;
    autoRotate?: boolean;
  } = {}
): UrlModelInfo => {
  return {
    type: 'url',
    modelUrl,
    fileName: options.fileName,
    autoRotate: options.autoRotate !== false
  };
};

// Get model type information for display
export const getModelTypeInfo = (modelUrl: string | null) => {
  if (!modelUrl) {
    return { type: 'unknown', source: 'No Model', icon: '❓' };
  }
  
  if (isTextTo3DModel(modelUrl)) {
    return { type: 'text-to-3d', source: 'AI Generated', icon: '✨' };
  }
  
  if (isCameraCaptureModel(modelUrl)) {
    return { type: 'camera-capture', source: 'Camera Capture', icon: '📸' };
  }
  
  if (isImageTo3DModel(modelUrl)) {
    return { type: 'image-to-3d', source: 'Image to 3D', icon: '🖼️' };
  }
  
  if (isCustomUpload(modelUrl)) {
    return { type: 'custom-upload', source: 'Custom Upload', icon: '📁' };
  }
  
  return { type: 'generic', source: 'Generic Model', icon: '🎯' };
};

// Convert legacy props to new ModelInfo format
export const convertLegacyToModelInfo = (
  modelUrl: string | null,
  options: {
    autoRotate?: boolean;
    fileName?: string;
    taskId?: string;
    prompt?: string;
    artStyle?: string;
  } = {}
) => {
  if (!modelUrl) return null;
  
  if (isTextTo3DModel(modelUrl)) {
    return createTextTo3DModelInfo(modelUrl, {
      prompt: options.prompt,
      artStyle: options.artStyle
    });
  } else {
    return createUrlModelInfo(modelUrl, {
      fileName: options.fileName,
      autoRotate: options.autoRotate
    });
  }
};
