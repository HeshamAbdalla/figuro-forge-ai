
import { supabase } from '@/integrations/supabase/client';
import { downloadAndSaveModel } from '@/utils/modelUtils';
import { downloadAndSaveThumbnail } from '@/utils/thumbnailUtils';
import { saveFigurine } from '@/services/figurineService';
import { ConversionCallbacks } from '../types/conversion';

export const pollConversionStatus = async (
  taskId: string,
  fileName: string,
  originalImageUrl: string,
  callbacks: ConversionCallbacks
): Promise<void> => {
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  let attempts = 0;

  const checkStatus = async (): Promise<void> => {
    try {
      attempts++;
      console.log(`🔍 [POLLING] Checking status (${attempts}/${maxAttempts}) for task:`, taskId);

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
      console.log('📊 [POLLING] Status update:', { status, modelUrl, progress: apiProgress, thumbnail_url });

      // Update progress based on status
      let progressValue = 30 + (apiProgress || 0) * 0.6; // 30-90%
      let message = 'Converting image to 3D model...';

      if ((status === 'SUCCEEDED' || status === 'completed') && modelUrl) {
        callbacks.onProgressUpdate({
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
            console.log('🔄 [POLLING] Downloading and saving thumbnail...');
            savedThumbnailUrl = await downloadAndSaveThumbnail(thumbnail_url, taskId);
            console.log('✅ [POLLING] Thumbnail saved:', savedThumbnailUrl);
          } catch (thumbnailError) {
            console.warn('⚠️ [POLLING] Failed to save thumbnail, but continuing:', thumbnailError);
            // Don't fail the entire process if thumbnail save fails
          }
        }
        
        if (savedModelUrl) {
          // Create a figurine record for this 3D conversion
          try {
            console.log('🔄 [POLLING] Creating figurine record for 3D conversion...');
            
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
                console.error('❌ [POLLING] Failed to update figurine with model URL:', updateError);
              } else {
                console.log('✅ [POLLING] Figurine record created and updated with model URL:', figurineId);
              }
            }
          } catch (figurineError) {
            console.error('❌ [POLLING] Failed to create figurine record:', figurineError);
            // Don't fail the entire process if figurine creation fails
            // The user still gets their 3D model
          }

          callbacks.onProgressUpdate({
            status: 'completed',
            progress: 100,
            message: '3D model generated successfully!',
            taskId,
            modelUrl: savedModelUrl,
            thumbnailUrl: savedThumbnailUrl || undefined
          });

          callbacks.onSuccess(savedModelUrl, savedThumbnailUrl || undefined);
        } else {
          throw new Error('Failed to save 3D model to storage');
        }
        return;
      }

      if (status === 'FAILED' || status === 'failed') {
        throw new Error('3D conversion failed on the server');
      }

      if (status === 'IN_PROGRESS' || status === 'PENDING' || status === 'processing') {
        callbacks.onProgressUpdate({
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
      console.error('❌ [POLLING] Status check error:', error);
      callbacks.onError(error instanceof Error ? error.message : 'Status check failed');
      throw error;
    }
  };

  await checkStatus();
};
