
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { downloadAndSaveModel } from '@/utils/modelUtils';
import { downloadAndSaveThumbnail } from '@/utils/thumbnailUtils';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { saveFigurine } from '@/services/figurineService';

interface ConversionProgress {
  status: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
  progress: number;
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

export const useGallery3DGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const { toast } = useToast();
  const { canPerformAction, checkSubscription } = useSubscription();

  const generate3DModel = async (imageUrl: string, fileName: string, config?: Generate3DConfig) => {
    try {
      setIsGenerating(true);
      setProgress({
        status: 'converting',
        progress: 10,
        message: 'Checking usage limits...'
      });

      console.log('🔄 [GALLERY] Starting 3D conversion for:', fileName, 'with config:', config);

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Please log in to generate 3D models');
      }

      // Check if user can perform model conversion
      if (!canPerformAction('model_conversion')) {
        throw new Error('You have reached your 3D model conversion limit. Please upgrade your plan to continue.');
      }

      setProgress({
        status: 'converting',
        progress: 20,
        message: 'Starting 3D conversion...'
      });

      // Call the convert-to-3d edge function with configuration
      const { data, error } = await supabase.functions.invoke('convert-to-3d', {
        body: { 
          imageUrl,
          config: config || {
            art_style: 'realistic',
            ai_model: 'meshy-5',
            topology: 'quad',
            target_polycount: 20000,
            texture_richness: 'high',
            moderation: true
          }
        }
      });

      if (error) {
        console.error('❌ [GALLERY] Conversion error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('limit reached') || error.message?.includes('429')) {
          throw new Error('You have reached your 3D model conversion limit. Please upgrade your plan to continue.');
        }
        
        throw new Error(`Conversion failed: ${error.message}`);
      }

      if (!data?.taskId) {
        throw new Error('No task ID received from conversion service');
      }

      console.log('✅ [GALLERY] Conversion started, task ID:', data.taskId);

      setProgress({
        status: 'converting',
        progress: 30,
        message: 'Converting image to 3D model...',
        taskId: data.taskId
      });

      // Poll for completion
      await pollConversionStatus(data.taskId, fileName, imageUrl);

      // Refresh subscription data after successful conversion
      setTimeout(() => {
        checkSubscription();
      }, 1000);

    } catch (error) {
      console.error('❌ [GALLERY] 3D generation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate 3D model';
      
      setProgress({
        status: 'error',
        progress: 0,
        message: errorMessage
      });
      
      // Show upgrade prompt for limit-related errors
      if (errorMessage.includes('limit') || errorMessage.includes('upgrade')) {
        toast({
          title: "3D Conversion Limit Reached",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "3D Generation Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const pollConversionStatus = async (taskId: string, fileName: string, originalImageUrl: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      try {
        attempts++;
        console.log(`🔍 [GALLERY] Checking status (${attempts}/${maxAttempts}) for task:`, taskId);

        // Get the current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Authentication required');
        }

        // Make direct fetch call with taskId as URL parameter
        const supabaseUrl = 'https://cwjxbwqdfejhmiixoiym.supabase.co';
        const response = await fetch(`${supabaseUrl}/functions/v1/check-3d-status?taskId=${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3anhid3FkZmVqaG1paXhvaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTg0MDksImV4cCI6MjA2MzQ3NDQwOX0.g_-L7Bsv0cnEjSLNXEjrDdYYdxtV7yiHFYUV3_Ww3PI',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Status check failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const { status, modelUrl, progress: apiProgress, thumbnail_url } = data;
        console.log('📊 [GALLERY] Status update:', { status, modelUrl, progress: apiProgress, thumbnail_url });

        // Update progress based on status
        let progressValue = 30 + (apiProgress || 0) * 0.6; // 30-90%
        let message = 'Converting image to 3D model...';

        if ((status === 'SUCCEEDED' || status === 'completed') && modelUrl) {
          setProgress({
            status: 'downloading',
            progress: 90,
            message: 'Downloading and saving 3D model...',
            taskId
          });

          // Download and save the model
          const savedModelUrl = await downloadAndSaveModel(modelUrl, fileName);
          
          // Download and save thumbnail if available
          let savedThumbnailUrl: string | null = null;
          if (thumbnail_url) {
            try {
              console.log('🔄 [GALLERY] Downloading and saving thumbnail...');
              savedThumbnailUrl = await downloadAndSaveThumbnail(thumbnail_url, taskId);
              console.log('✅ [GALLERY] Thumbnail saved:', savedThumbnailUrl);
            } catch (thumbnailError) {
              console.warn('⚠️ [GALLERY] Failed to save thumbnail, but continuing:', thumbnailError);
              // Don't fail the entire process if thumbnail save fails
            }
          }
          
          if (savedModelUrl) {
            // Create a figurine record for this 3D conversion
            try {
              console.log('🔄 [GALLERY] Creating figurine record for 3D conversion...');
              
              // Generate a prompt based on the file name and metadata
              const prompt = `Generated from ${fileName.replace(/\.[^/.]+$/, '')}`;
              
              // Create the figurine record
              const figurineId = await saveFigurine(
                prompt,
                'realistic', // Default style for 3D conversions
                originalImageUrl,
                null // No blob since we're using URLs
              );
              
              if (figurineId) {
                // Update the figurine with the 3D model URL
                const { error: updateError } = await supabase
                  .from('figurines')
                  .update({ 
                    model_url: savedModelUrl,
                    title: `3D Model - ${fileName.replace(/\.[^/.]+$/, '')}`
                  })
                  .eq('id', figurineId);
                
                if (updateError) {
                  console.error('❌ [GALLERY] Failed to update figurine with model URL:', updateError);
                } else {
                  console.log('✅ [GALLERY] Figurine record created and updated with model URL:', figurineId);
                }
              }
            } catch (figurineError) {
              console.error('❌ [GALLERY] Failed to create figurine record:', figurineError);
              // Don't fail the entire process if figurine creation fails
              // The user still gets their 3D model
            }

            setProgress({
              status: 'completed',
              progress: 100,
              message: '3D model generated successfully!',
              taskId,
              modelUrl: savedModelUrl,
              thumbnailUrl: savedThumbnailUrl || undefined
            });

            toast({
              title: "3D Model Generated",
              description: "Your 3D model has been created and saved to the gallery",
              variant: "default"
            });
          } else {
            throw new Error('Failed to save 3D model to storage');
          }
          return;
        }

        if (status === 'FAILED' || status === 'failed') {
          throw new Error('3D conversion failed on the server');
        }

        if (status === 'IN_PROGRESS' || status === 'PENDING' || status === 'processing') {
          setProgress({
            status: 'converting',
            progress: Math.min(progressValue, 89),
            message,
            taskId,
            thumbnailUrl: thumbnail_url ? thumbnail_url : undefined
          });

          // Continue polling if not at max attempts
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 5000);
          } else {
            throw new Error('Conversion timeout - please try again');
          }
          return;
        }

        // Unknown status
        throw new Error(`Unknown conversion status: ${status}`);

      } catch (error) {
        console.error('❌ [GALLERY] Status check error:', error);
        throw error;
      }
    };

    await checkStatus();
  };

  const resetProgress = () => {
    setProgress({
      status: 'idle',
      progress: 0,
      message: ''
    });
    setIsGenerating(false);
  };

  return {
    isGenerating,
    progress,
    generate3DModel,
    resetProgress
  };
};
