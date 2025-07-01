
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tryLoadWithCorsProxies } from '@/utils/corsProxy';
import { validateAndCleanUrl, prioritizeUrlsWithInfo } from '@/utils/urlValidationUtils';

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
    console.log('🔍 [MODEL-LOADER] Resolving model URL:', url.substring(0, 50) + '...');
    
    // Validate URL first
    const validation = validateAndCleanUrl(url);
    if (!validation.isValid) {
      console.warn('⚠️ [MODEL-LOADER] Invalid URL provided:', validation.error);
      throw new Error(validation.error || 'Invalid URL');
    }
    
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
          console.warn('⚠️ [MODEL-LOADER] No authentication, checking if URL is expired...');
          
          // Check if URL is expired
          const urlObj = new URL(url);
          const expiresParam = urlObj.searchParams.get('Expires');
          if (expiresParam) {
            const expiresTimestamp = parseInt(expiresParam);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            if (expiresTimestamp < currentTimestamp) {
              throw new Error('Model URL has expired and no authentication available to find alternatives');
            }
          }
          
          return url;
        }
        
        // Extract task ID from URL for local lookup
        const taskIdMatch = url.match(/tasks\/([^\/]+)/);
        if (taskIdMatch) {
          const taskId = taskIdMatch[1];
          
          // Check conversion_tasks table for locally saved model
          const { data: conversionTask } = await supabase
            .from('conversion_tasks')
            .select('local_model_url, model_url')
            .eq('user_id', session.user.id)
            .eq('task_id', taskId)
            .eq('download_status', 'completed')
            .single();
          
          if (conversionTask) {
            // Use URL prioritization to select best available URL
            const availableUrls = [conversionTask.local_model_url, conversionTask.model_url].filter(Boolean);
            const prioritization = prioritizeUrlsWithInfo(availableUrls);
            
            if (prioritization.url) {
              console.log('✅ [MODEL-LOADER] Found alternative URL via database:', prioritization.url.substring(0, 50) + '...');
              return prioritization.url;
            }
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
              console.log('✅ [MODEL-LOADER] Verified local storage file exists:', publicUrlData.publicUrl.substring(0, 50) + '...');
              return publicUrlData.publicUrl;
            }
          } catch (e) {
            console.log('⚠️ [MODEL-LOADER] Local storage file not accessible');
          }
        }
        
        console.log('⚠️ [MODEL-LOADER] Model not found locally, using original Meshy URL');
      } catch (error) {
        console.warn('⚠️ [MODEL-LOADER] Error checking for local version:', error);
        
        // If original URL is expired, throw a more specific error
        if (error instanceof Error && error.message?.includes('expired')) {
          throw error;
        }
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
      console.log('🔄 [MODEL-LOADER] Starting model load for:', url.substring(0, 50) + '...');
      
      const resolvedUrl = await resolveModelUrl(url);
      console.log('🔄 [MODEL-LOADER] Resolved URL:', resolvedUrl.substring(0, 50) + '...');

      // Import GLTFLoader dynamically
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();

      // Try loading with improved error handling and specific error messages
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
                      reject(createSpecificError(proxyError, resolvedUrl));
                    }
                  );
                },
                (proxyError) => {
                  console.error('❌ [MODEL-LOADER] All loading attempts failed:', proxyError);
                  reject(createSpecificError(proxyError, resolvedUrl));
                }
              );
            }
          );
        } else {
          // For external URLs, use CORS proxy loading with specific error handling
          console.log('🔄 [MODEL-LOADER] Loading external URL via CORS proxy');
          
          tryLoadWithCorsProxies(
            resolvedUrl,
            (workingUrl: string) => {
              console.log('🔄 [MODEL-LOADER] Attempting load with URL:', workingUrl.substring(0, 50) + '...');
              
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
                  reject(createSpecificError(error, workingUrl));
                }
              );
            },
            (error: Error) => {
              console.error('❌ [MODEL-LOADER] All CORS proxy attempts failed:', error);
              reject(createSpecificError(error, resolvedUrl));
            }
          );
        }
      });

    } catch (error) {
      console.error('❌ [MODEL-LOADER] Model loading failed:', error);
      const errorMessage = createSpecificError(error, url);
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  // Helper method to create specific error messages
  const createSpecificError = (error: any, url: string): string => {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMsg.includes('expired')) {
      return 'Model URL has expired. Please regenerate the model.';
    } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network error')) {
      return 'Network error loading model. The model may be temporarily unavailable.';
    } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      return 'Model file not found. It may have been moved or deleted.';
    } else if (errorMsg.includes('CORS') || errorMsg.includes('blocked')) {
      return 'Access blocked by security policy. Try downloading the model instead.';
    } else if (url.includes('meshy.ai')) {
      return 'External model service temporarily unavailable. Download may still work.';
    } else {
      return `Failed to load model: ${errorMsg}`;
    }
  };

  return {
    loading,
    model,
    error,
    loadModel
  };
};
