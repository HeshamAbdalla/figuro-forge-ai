
export interface ConversionProgress {
  status: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
  progress: number;
  percentage: number;
  message: string;
  taskId?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
}

export interface Generate3DConfig {
  art_style: 'realistic' | 'cartoon' | 'low-poly';
  negative_prompt?: string;
  ai_model: string;
  topology: 'quad' | 'triangle';
  target_polycount?: number;
  texture_richness: 'high' | 'medium' | 'low';
  moderation: boolean;
}

export interface ConversionCallbacks {
  onProgressUpdate: (progress: ConversionProgress) => void;
  onSuccess: (modelUrl: string, thumbnailUrl?: string) => void;
  onError: (error: string) => void;
}
