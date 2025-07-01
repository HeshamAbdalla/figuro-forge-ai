
import { Figurine } from '@/types/figurine';

export interface ModelDebugInfo {
  id: string;
  title: string;
  model_url: string | null;
  style: string;
  image_url: string;
  saved_image_url: string | null;
  prompt: string;
  created_at: string;
  is_public: boolean;
  metadata?: any;
}

export const logModelDebugInfo = (figurine: Figurine) => {
  console.log('🐛 [MODEL-DEBUG] Figurine debug info:', {
    id: figurine.id,
    title: figurine.title,
    hasModelUrl: !!figurine.model_url,
    modelUrl: figurine.model_url ? figurine.model_url.substring(0, 50) + '...' : 'None',
    style: figurine.style,
    hasImageUrl: !!figurine.image_url,
    imageUrl: figurine.image_url ? figurine.image_url.substring(0, 50) + '...' : 'None',
    isPublic: figurine.is_public,
    metadata: figurine.metadata
  });
};

export const testUrlAccessibility = async (url: string): Promise<{ accessible: boolean; error?: string }> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    return { accessible: true };
  } catch (error) {
    return { 
      accessible: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
