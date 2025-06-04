
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tryLoadWithCorsProxies } from '@/utils/corsProxy';

interface ModelLoaderResult {
  loading: boolean;
  model: any;
  error: string | null;
  loadModel: (url: string) => Promise<void>;
}

export const useModelLoader = (): ModelLoaderResult => {
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const resolveModelUrl = async (url: string): Promise<string> => {
    console.log('🔍 [MODEL-LOADER] Resolving model URL:', url);
    
    // If it's already a public URL from our storage, use it directly
    if (url.includes('cwjxbwqdfejhmiixoiym.supabase.co/storage')) {
      console.log('✅ [MODEL-LOADER] Using direct storage URL');
      return url;
    }
    
    // If it's a Meshy URL, try to download and save it
    if (url.includes('meshy.ai') || url.includes('assets.meshy.ai')) {
      console.log('🔄 [MODEL-LOADER] Meshy URL detected, attempting to resolve...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('Authentication required');
        }
        
        // Check if we already have this model saved locally
        const taskIdMatch = url.match(/tasks\/([^\/]+)/);
        if (taskIdMatch) {
          const taskId = taskIdMatch[1];
          const savedPath = `${session.user.id}/models/${taskId}.glb`;
          
          const { data: existingFile } = await supabase.storage
            .from('figurine-models')
            .list(`${session.user.id}/models`, {
              search: `${taskId}.glb`
            });
          
          if (existingFile && existingFile.length > 0) {
            const { data: publicUrlData } = supabase.storage
              .from('figurine-models')
              .getPublicUrl(savedPath);
            
            console.log('✅ [MODEL-LOADER] Found locally saved model:', publicUrlData.publicUrl);
            return publicUrlData.publicUrl;
          }
        }
        
        // If not found locally, use the original URL with CORS handling
        console.log('⚠️ [MODEL-LOADER] Model not found locally, using original URL');
        return url;
      } catch (error) {
        console.warn('⚠️ [MODEL-LOADER] Error resolving Meshy URL:', error);
        return url;
      }
    }
    
    return url;
  };

  const loadModel = useCallback(async (url: string) => {
    if (!url) {
      setError('No model URL provided');
      return;
    }

    setLoading(true);
    setError(null);
    setModel(null);

    try {
      console.log('🔄 [MODEL-LOADER] Starting model load for:', url);
      
      const resolvedUrl = await resolveModelUrl(url);
      console.log('🔄 [MODEL-LOADER] Resolved URL:', resolvedUrl);

      // Import GLTFLoader dynamically
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();

      // Try loading with CORS proxy handling
      await new Promise<void>((resolve, reject) => {
        tryLoadWithCorsProxies(
          resolvedUrl,
          async (workingUrl: string) => {
            console.log('🔄 [MODEL-LOADER] Attempting load with URL:', workingUrl);
            
            loader.load(
              workingUrl,
              (gltf) => {
                console.log('✅ [MODEL-LOADER] Model loaded successfully');
                setModel(gltf.scene);
                setLoading(false);
                resolve();
              },
              (progress) => {
                const percent = (progress.loaded / progress.total) * 100;
                console.log(`📊 [MODEL-LOADER] Loading progress: ${percent.toFixed(0)}%`);
              },
              (error) => {
                console.error('❌ [MODEL-LOADER] GLTFLoader error:', error);
                reject(new Error(`Failed to load model: ${error.message}`));
              }
            );
          },
          (error: Error) => {
            console.error('❌ [MODEL-LOADER] All CORS proxy attempts failed:', error);
            reject(new Error(`Network error: ${error.message}`));
          }
        );
      });

    } catch (error) {
      console.error('❌ [MODEL-LOADER] Model loading failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  return {
    loading,
    model,
    error,
    loadModel
  };
};
