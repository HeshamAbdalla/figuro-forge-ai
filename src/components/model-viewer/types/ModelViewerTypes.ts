
import * as THREE from 'three';

// Base model info interface
export interface BaseModelInfo {
  type: 'url' | 'text-to-3d';
}

// Simple URL-based model info
export interface UrlModelInfo extends BaseModelInfo {
  type: 'url';
  modelUrl: string;
  fileName?: string;
  autoRotate?: boolean;
}

// Text-to-3D model info with enhanced metadata
export interface TextTo3DModelInfo extends BaseModelInfo {
  type: 'text-to-3d';
  taskId: string;
  modelUrl: string;
  localModelUrl?: string;
  thumbnailUrl?: string;
  prompt?: string;
  artStyle?: string;
  negativePrompt?: string;
  progress?: number;
  status: 'processing' | 'completed' | 'failed' | 'SUCCEEDED';
  downloadStatus?: string;
  metadata?: {
    polycount?: number;
    fileSize?: number;
    dimensions?: { width: number; height: number; depth: number };
    materials?: string[];
  };
}

// Discriminated union type
export type ModelInfo = UrlModelInfo | TextTo3DModelInfo;

// Model viewer variant types
export type ModelViewerVariant = 'standard' | 'compact' | 'gallery' | 'dialog';

// Common model viewer props
export interface BaseModelViewerProps {
  isLoading?: boolean;
  progress?: number;
  errorMessage?: string | null;
  onCustomModelLoad?: (url: string, file: File) => void;
  variant?: ModelViewerVariant;
  showControls?: boolean;
  className?: string;
  onModelError?: (error: any) => void;
  fillHeight?: boolean;
}

// Enhanced model viewer props with discriminated union
export interface EnhancedModelViewerProps extends BaseModelViewerProps {
  modelInfo: ModelInfo | null;
}

// Legacy props for backward compatibility
export interface LegacyModelViewerProps extends BaseModelViewerProps {
  modelUrl: string | null;
  autoRotate?: boolean;
}

// Union of all possible props
export type ModelViewerProps = EnhancedModelViewerProps | LegacyModelViewerProps;

// Type guards
export const isTextTo3DModelInfo = (modelInfo: ModelInfo | null): modelInfo is TextTo3DModelInfo => {
  return modelInfo?.type === 'text-to-3d';
};

export const isUrlModelInfo = (modelInfo: ModelInfo | null): modelInfo is UrlModelInfo => {
  return modelInfo?.type === 'url';
};

export const isLegacyProps = (props: ModelViewerProps): props is LegacyModelViewerProps => {
  return 'modelUrl' in props;
};

export const isEnhancedProps = (props: ModelViewerProps): props is EnhancedModelViewerProps => {
  return 'modelInfo' in props;
};

// Model loading state
export interface ModelLoadingState {
  loading: boolean;
  model: THREE.Group | null;
  error: string | null;
  progress: number;
}

// Model viewer context type
export interface ModelViewerContextType {
  modelInfo: ModelInfo | null;
  loadingState: ModelLoadingState;
  controls: {
    autoRotate: boolean;
    setAutoRotate: (value: boolean) => void;
    showWireframe: boolean;
    setShowWireframe: (value: boolean) => void;
    resetCamera: () => void;
  };
  actions: {
    loadModel: () => Promise<void>;
    downloadModel: () => void;
    shareModel: () => void;
  };
}
