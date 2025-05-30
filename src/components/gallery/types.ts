
export interface BucketImage {
  name: string;
  fullPath?: string;
  url: string;
  id: string;
  created_at: string;
  type: 'image' | '3d-model' | 'web-icon';
  thumbnailUrl?: string; // Optional thumbnail URL for 3D models
  metadata?: Record<string, any>; // Optional metadata for web icons and other types
}

export interface ConversionConfig {
  artStyle: string;
  targetPolycount: string;
  generateTexture: boolean;
  seedValue?: number;
  negativePrompt?: string;
}

export interface ConversionProgress {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  taskId?: string;
}
