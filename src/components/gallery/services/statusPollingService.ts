
import { supabase } from '@/integrations/supabase/client';
import { downloadAndSaveModel } from '@/utils/modelUtils';
import { downloadAndSaveThumbnail } from '@/utils/thumbnailUtils';
import { saveFigurine } from '@/services/figurineService';
import { ConversionCallbacks } from '../types/conversion';

export const pollConversionStatus = async (
  taskId: string,
  fileName: string,
  originalImageUrl: string,
  callbacks: ConversionCallbacks,
  shouldUpdateExisting: boolean = true
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
          percentage: 90,
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
          let figurineCreated = false;
          
          // IMPROVED: Better logic for handling figurine creation vs updating
          if (shouldUpdateExisting) {
            // Try to update existing figurine first
            console.log('🔄 [POLLING] Checking for existing figurine with image URL:', originalImageUrl);
            
            const { data: existingFigurines, error: searchError } = await supabase
              .from('figurines')
              .select('id, title')
              .or(`image_url.eq.${originalImageUrl},saved_image_url.eq.${originalImageUrl}`)
              .limit(1);

            if (searchError) {
              console.error('❌ [POLLING] Error searching for existing figurine:', searchError);
            }

            if (existingFigurines && existingFigurines.length > 0) {
              // Update existing figurine with 3D model
              const existingFigurine = existingFigurines[0];
              console.log('🔄 [POLLING] Updating existing figurine with 3D model:', existingFigurine.id);
              
              const { error: updateError } = await supabase
                .from('figurines')
                .update({ 
                  model_url: savedModelUrl,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingFigurine.id);
              
              if (!updateError) {
                console.log('✅ [POLLING] Successfully updated existing figurine with 3D model');
                figurineCreated = true;
              } else {
                console.error('❌ [POLLING] Failed to update existing figurine:', updateError);
                // Will fall through to create new figurine
              }
            }
          }

          // Create new figurine if not updating existing or if update failed
          if (!figurineCreated) {
            try {
              console.log('🔄 [POLLING] Creating new figurine record for 3D conversion...');
              
              // Generate a meaningful prompt based on the file name
              const prompt = fileName.includes('camera-capture') 
                ? `Camera captured model - ${new Date().toLocaleDateString()}`
                : `Generated from ${fileName.replace(/\.[^/.]+$/, '')}`;
              
              // Create the figurine record
              const figurineId = await saveFigurine(
                prompt,
                'realistic', // Default style for 3D conversions
                originalImageUrl,
                null // No blob since we're using URLs
              );
              
              if (figurineId) {
                // Update the figurine with the 3D model URL and a proper title
                const title = fileName.includes('camera-capture') 
                  ? `Camera 3D Model - ${new Date().toLocaleDateString()}`
                  : `3D Model - ${fileName.replace(/\.[^/.]+$/, '')}`;
                  
                const { error: updateError } = await supabase
                  .from('figurines')
                  .update({ 
                    model_url: savedModelUrl,
                    title: title
                  })
                  .eq('id', figurineId);
                
                if (updateError) {
                  console.error('❌ [POLLING] Failed to update figurine with model URL:', updateError);
                  throw new Error('Failed to save figurine with 3D model');
                } else {
                  console.log('✅ [POLLING] New figurine record created and updated with model URL:', figurineId);
                  figurineCreated = true;
                }
              } else {
                throw new Error('Failed to create figurine record');
              }
            } catch (figurineError) {
              console.error('❌ [POLLING] Failed to create figurine record:', figurineError);
              
              // IMPROVED: Better error handling - still provide the model but notify about save failure
              callbacks.onProgressUpdate({
                status: 'completed',
                progress: 100,
                percentage: 100,
                message: '3D model generated but failed to save to gallery. You can still download it.',
                taskId,
                modelUrl: savedModelUrl,
                thumbnailUrl: savedThumbnailUrl || undefined
              });

              callbacks.onSuccess(savedModelUrl, savedThumbnailUrl || undefined);
              return;
            }
          }

          // Success message based on action taken
          const successMessage = shouldUpdateExisting && figurineCreated
            ? '3D model added to existing figurine!'
            : '3D model generated and saved to gallery!';

          callbacks.onProgressUpdate({
            status: 'completed',
            progress: 100,
            percentage: 100,
            message: successMessage,
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
          percentage: Math.min(progressValue, 89),
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
