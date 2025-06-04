
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
    if (url.includes('supabase.co/storage/v1/object/public/')) {
      console.log('✅ [MODEL-LOADER] Using direct storage URL');
      return url;
    }
    
    // If it's a Meshy URL, try to find locally saved version first
    if (url.includes('meshy.ai') || url.includes('assets.meshy.ai')) {
      console.log('🔄 [MODEL-LOADER] Meshy URL detected, checking for local version...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.warn('⚠️ [MODEL-LOADER] No authentication, using original URL');
          return url;
        }
        
        // Extract task ID from URL for local lookup
        const taskIdMatch = url.match(/tasks\/([^\/]+)/);
        if (taskIdMatch) {
          const taskId = taskIdMatch[1];
          
          // Check conversion_tasks table for locally saved model
          const { data: conversionTask } = await supabase
            .from('conversion_tasks')
            .select('local_model_url')
            .eq('user_id', session.user.id)
            .eq('task_id', taskId)
            .eq('download_status', 'completed')
            .single();
          
          if (conversionTask?.local_model_url) {
            console.log('✅ [MODEL-LOADER] Found locally saved model:', conversionTask.local_model_url);
            return conversionTask.local_model_url;
          }
          
          // Fallback: check direct storage path
          const savedPath = `${session.user.id}/models/${taskId}.glb`;
          const { data: publicUrlData } = supabase.storage
            .from('figurine-models')
            .getPublicUrl(savedPath);
          
          // Verify the file exists by attempting to fetch it
          try {
            const response = await fetch(publicUrlData.publicUrl, { method: 'HEAD' });
            if (response.ok) {
              console.log('✅ [MODEL-LOADER] Verified local storage file exists:', publicUrlData.publicUrl);
              return publicUrlData.publicUrl;
            }
          } catch (e) {
            console.log('⚠️ [MODEL-LOADER] Local storage file not accessible');
          }
        }
        
        console.log('⚠️ [MODEL-LOADER] Model not found locally, using original Meshy URL');
        return url;
      } catch (error) {
        console.warn('⚠️ [MODEL-LOADER] Error checking for local version:', error);
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

      // Try loading with improved error handling
      await new Promise<void>((resolve, reject) => {
        // For Supabase storage URLs, try direct loading first
        if (resolvedUrl.includes('supabase.co/storage/v1/object/public/')) {
          console.log('🔄 [MODEL-LOADER] Loading directly from Supabase storage');
          
          loader.load(
            resolvedUrl,
            (gltf) => {
              console.log('✅ [MODEL-LOADER] Model loaded successfully from storage');
              setModel(gltf.scene);
              setLoading(false);
              resolve();
            },
            (progress) => {
              const percent = (progress.loaded / progress.total) * 100;
              if (percent % 25 === 0) {
                console.log(`📊 [MODEL-LOADER] Loading progress: ${percent.toFixed(0)}%`);
              }
            },
            (error) => {
              console.warn('⚠️ [MODEL-LOADER] Direct storage load failed, trying CORS proxies:', error);
              // Fallback to CORS proxy loading
              tryLoadWithCorsProxies(
                resolvedUrl,
                (workingUrl: string) => {
                  loader.load(
                    workingUrl,
                    (gltf) => {
                      console.log('✅ [MODEL-LOADER] Model loaded successfully via proxy');
                      setModel(gltf.scene);
                      setLoading(false);
                      resolve();
                    },
                    undefined,
                    (proxyError) => {
                      console.error('❌ [MODEL-LOADER] Proxy GLTFLoader error:', proxyError);
                      reject(new Error(`Failed to load model: ${proxyError.message || 'Unknown error'}`));
                    }
                  );
                },
                (proxyError) => {
                  console.error('❌ [MODEL-LOADER] All loading attempts failed:', proxyError);
                  reject(new Error(`All loading attempts failed: ${proxyError.message || 'Unknown error'}`));
                }
              );
            }
          );
        } else {
          // For external URLs, use CORS proxy loading
          console.log('🔄 [MODEL-LOADER] Loading external URL via CORS proxy');
          
          tryLoadWithCorsProxies(
            resolvedUrl,
            (workingUrl: string) => {
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
                  if (percent % 25 === 0) {
                    console.log(`📊 [MODEL-LOADER] Loading progress: ${percent.toFixed(0)}%`);
                  }
                },
                (error) => {
                  console.error('❌ [MODEL-LOADER] GLTFLoader error:', error);
                  reject(new Error(`Failed to load model: ${error.message || 'Unknown GLTFLoader error'}`));
                }
              );
            },
            (error: Error) => {
              console.error('❌ [MODEL-LOADER] All CORS proxy attempts failed:', error);
              reject(new Error(`Network error: ${error.message || 'Unknown network error'}`));
            }
          );
        }
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
