
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { downloadAndSaveModel } from '@/utils/modelUtils';
import { downloadAndSaveThumbnail } from '@/utils/thumbnailUtils';

export interface ImageTo3DStatusResponse {
  success: boolean;
  status: string;
  progress: number;
  modelUrl?: string;
  thumbnailUrl?: string;
  taskId: string;
  downloadStatus?: string;
  error?: string;
}

export interface ImageTo3DCallbacks {
  onProgressUpdate: (update: {
    status: string;
    progress: number;
    percentage: number;
    message: string;
    taskId: string;
    modelUrl?: string;
    thumbnailUrl?: string;
  }) => void;
  onSuccess: (modelUrl: string, thumbnailUrl?: string) => void;
  onError: (error: string) => void;
}

/**
 * Consolidated image-to-3D status checking service
 */
export class ImageTo3DStatusService {
  private maxAttempts = 120; // 10 minutes with 5-second intervals
  private pollingInterval = 5000; // 5 seconds

  /**
   * Check the status of an image-to-3D conversion task
   */
  async checkStatus(taskId: string): Promise<ImageTo3DStatusResponse> {
    try {
      console.log(`🔍 [IMAGE-TO-3D-STATUS] Checking status for task: ${taskId}`);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication required. Please refresh the page and try again.');
      }

      const supabaseUrl = SUPABASE_URL;
      const supabaseKey = SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Service configuration not available');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${supabaseUrl}/functions/v1/check-image-to-3d-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [IMAGE-TO-3D-STATUS] Status check failed:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        } else if (response.status === 404) {
          throw new Error('Task not found. It may have expired.');
        } else {
          throw new Error(`Status check failed: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('📊 [IMAGE-TO-3D-STATUS] Status response:', data);

      return {
        success: data.success || false,
        status: data.status || 'unknown',
        progress: data.progress || 0,
        modelUrl: data.modelUrl,
        thumbnailUrl: data.thumbnailUrl,
        taskId: data.taskId || taskId,
        downloadStatus: data.downloadStatus,
        error: data.error
      };

    } catch (error) {
      console.error('❌ [IMAGE-TO-3D-STATUS] Status check error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Status check failed';
      
      return {
        success: false,
        status: 'error',
        progress: 0,
        taskId,
        error: errorMessage
      };
    }
  }

  /**
   * Poll for conversion completion with enhanced error handling
   */
  async pollForCompletion(
    taskId: string,
    fileName: string,
    originalImageUrl: string,
    callbacks: ImageTo3DCallbacks,
    shouldCreateFigurine: boolean = true
  ): Promise<void> => {
    let attempts = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    const pollStatus = async (): Promise<void> => {
      try {
        attempts++;
        console.log(`🔄 [IMAGE-TO-3D-POLL] Attempt ${attempts}/${this.maxAttempts} for task: ${taskId}`);

        const statusResponse = await this.checkStatus(taskId);

        if (!statusResponse.success) {
          throw new Error(statusResponse.error || 'Status check failed');
        }

        // Reset consecutive error counter on successful response
        consecutiveErrors = 0;

        const { status, progress, modelUrl, thumbnailUrl } = statusResponse;

        // Handle completed conversion
        if ((status === 'SUCCEEDED' || status === 'completed') && modelUrl) {
          console.log('✅ [IMAGE-TO-3D-POLL] Conversion completed, processing results...');

          callbacks.onProgressUpdate({
            status: 'downloading',
            progress: 90,
            percentage: 90,
            message: 'Downloading and saving 3D model...',
            taskId
          });

          try {
            // Download and save the model
            const savedModelUrl = await downloadAndSaveModel(modelUrl, fileName);
            
            // Download and save thumbnail if available
            let savedThumbnailUrl: string | null = null;
            if (thumbnailUrl) {
              try {
                savedThumbnailUrl = await downloadAndSaveThumbnail(thumbnailUrl, taskId);
                console.log('✅ [IMAGE-TO-3D-POLL] Thumbnail saved:', savedThumbnailUrl);
              } catch (thumbnailError) {
                console.warn('⚠️ [IMAGE-TO-3D-POLL] Thumbnail save failed:', thumbnailError);
              }
            }

            if (savedModelUrl) {
              // Create or update figurine record if requested
              if (shouldCreateFigurine) {
                await this.ensureFigurineRecord(
                  originalImageUrl,
                  savedModelUrl,
                  fileName,
                  taskId,
                  savedThumbnailUrl
                );
              }

              // Also ensure conversion task record exists
              await this.ensureConversionTaskRecord(
                taskId,
                originalImageUrl,
                savedModelUrl,
                savedThumbnailUrl,
                fileName
              );

              callbacks.onProgressUpdate({
                status: 'completed',
                progress: 100,
                percentage: 100,
                message: '3D model generated and saved successfully!',
                taskId,
                modelUrl: savedModelUrl,
                thumbnailUrl: savedThumbnailUrl || undefined
              });

              callbacks.onSuccess(savedModelUrl, savedThumbnailUrl || undefined);
              return;
            } else {
              throw new Error('Failed to save 3D model to storage');
            }
          } catch (downloadError) {
            console.error('❌ [IMAGE-TO-3D-POLL] Download/save error:', downloadError);
            throw new Error(`Failed to download 3D model: ${downloadError.message}`);
          }
        }

        // Handle failed conversion
        if (status === 'FAILED' || status === 'failed') {
          const errorMessage = statusResponse.error || 'Conversion failed';
          console.error('❌ [IMAGE-TO-3D-POLL] Conversion failed:', errorMessage);
          throw new Error(`3D conversion failed: ${errorMessage}`);
        }

        // Handle in-progress conversion
        if (status === 'IN_PROGRESS' || status === 'PENDING' || status === 'processing') {
          const progressValue = Math.min(30 + (progress || 0) * 0.6, 89);
          
          callbacks.onProgressUpdate({
            status: 'converting',
            progress: progressValue,
            percentage: progressValue,
            message: 'Converting image to 3D model...',
            taskId,
            thumbnailUrl: thumbnailUrl ? thumbnailUrl : undefined
          });

          // Continue polling if not at max attempts
          if (attempts < this.maxAttempts) {
            setTimeout(pollStatus, this.pollingInterval);
          } else {
            throw new Error('Conversion timeout - please try again');
          }
          return;
        }

        // Unknown status
        console.warn('❌ [IMAGE-TO-3D-POLL] Unknown status:', status);
        throw new Error(`Unknown conversion status: ${status}`);

      } catch (error) {
        console.error('❌ [IMAGE-TO-3D-POLL] Poll error:', error);
        consecutiveErrors++;
        
        const errorMessage = error instanceof Error ? error.message : 'Status check failed';
        
        // Retry on network errors for a few attempts
        if (consecutiveErrors < maxConsecutiveErrors && 
            (errorMessage.includes('network') || 
             errorMessage.includes('fetch') || 
             errorMessage.includes('timeout') ||
             error instanceof Error && error.name === 'AbortError')) {
          
          const retryInterval = Math.min(2000 * Math.pow(2, consecutiveErrors), 10000);
          console.log(`🔄 [IMAGE-TO-3D-POLL] Retrying in ${retryInterval}ms (attempt ${consecutiveErrors}/${maxConsecutiveErrors})`);
          setTimeout(pollStatus, retryInterval);
          return;
        }
        
        callbacks.onError(errorMessage);
        throw error;
      }
    };

    await pollStatus();
  }

  /**
   * Ensure a conversion task record exists in the database
   */
  private async ensureConversionTaskRecord(
    taskId: string,
    originalImageUrl: string,
    modelUrl: string,
    thumbnailUrl: string | null,
    fileName: string
  ): Promise<void> => {
    try {
      console.log('🔄 [IMAGE-TO-3D-POLL] Ensuring conversion task record exists...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const userId = session.user.id;

      // Check if conversion task already exists
      const { data: existingTask, error: searchError } = await supabase
        .from('conversion_tasks')
        .select('id, status, local_model_url')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .limit(1)
        .single();

      if (searchError && searchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ [IMAGE-TO-3D-POLL] Error searching for conversion task:', searchError);
      }

      if (existingTask) {
        // Update existing task
        console.log('🔄 [IMAGE-TO-3D-POLL] Updating existing conversion task:', existingTask.id);
        
        const { error: updateError } = await supabase
          .from('conversion_tasks')
          .update({
            status: 'SUCCEEDED',
            local_model_url: modelUrl,
            local_thumbnail_url: thumbnailUrl,
            download_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTask.id);
        
        if (updateError) {
          console.error('❌ [IMAGE-TO-3D-POLL] Failed to update conversion task:', updateError);
        } else {
          console.log('✅ [IMAGE-TO-3D-POLL] Successfully updated conversion task');
        }
      } else {
        // Create new conversion task
        console.log('🔄 [IMAGE-TO-3D-POLL] Creating new conversion task record...');
        
        const { data: newTask, error: insertError } = await supabase
          .from('conversion_tasks')
          .insert({
            user_id: userId,
            task_id: taskId,
            task_type: 'image_to_3d',
            status: 'SUCCEEDED',
            local_model_url: modelUrl,
            local_thumbnail_url: thumbnailUrl,
            download_status: 'completed',
            prompt: `Image-to-3D conversion from ${fileName}`,
            art_style: 'realistic'
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ [IMAGE-TO-3D-POLL] Failed to create conversion task:', insertError);
        } else {
          console.log('✅ [IMAGE-TO-3D-POLL] Successfully created conversion task:', newTask.id);
        }
      }

    } catch (error) {
      console.error('❌ [IMAGE-TO-3D-POLL] Error ensuring conversion task record:', error);
      // Don't throw here - we still want to provide the model even if task record creation fails
      console.warn('⚠️ [IMAGE-TO-3D-POLL] Continuing without conversion task record');
    }
  }

  /**
   * Ensure a figurine record exists and is properly linked to the 3D model
   */
  private async ensureFigurineRecord(
    originalImageUrl: string,
    modelUrl: string,
    fileName: string,
    taskId: string,
    thumbnailUrl?: string | null
  ): Promise<void> => {
    try {
      console.log('🔄 [IMAGE-TO-3D-POLL] Ensuring figurine record exists...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const userId = session.user.id;

      // Get the stored prompt from conversion_tasks table for better naming
      let storedPrompt = '';
      try {
        const { data: conversionTask, error: taskError } = await supabase
          .from('conversion_tasks')
          .select('prompt')
          .eq('task_id', taskId)
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (!taskError && conversionTask?.prompt) {
          storedPrompt = conversionTask.prompt;
          console.log('✅ [IMAGE-TO-3D-POLL] Retrieved stored prompt for figurine:', storedPrompt);
        }
      } catch (promptError) {
        console.warn('⚠️ [IMAGE-TO-3D-POLL] Could not retrieve stored prompt:', promptError);
      }

      // First, try to find an existing figurine with this image URL
      const { data: existingFigurines, error: searchError } = await supabase
        .from('figurines')
        .select('id, title, model_url')
        .eq('user_id', userId)
        .or(`image_url.eq.${originalImageUrl},saved_image_url.eq.${originalImageUrl}`)
        .limit(1);

      if (searchError) {
        console.error('❌ [IMAGE-TO-3D-POLL] Error searching for existing figurine:', searchError);
      }

      if (existingFigurines && existingFigurines.length > 0) {
        // Update existing figurine
        const existingFigurine = existingFigurines[0];
        console.log('🔄 [IMAGE-TO-3D-POLL] Updating existing figurine:', existingFigurine.id);
        
        const { error: updateError } = await supabase
          .from('figurines')
          .update({ 
            model_url: modelUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingFigurine.id);
        
        if (updateError) {
          console.error('❌ [IMAGE-TO-3D-POLL] Failed to update existing figurine:', updateError);
          throw new Error('Failed to update figurine with 3D model');
        }

        console.log('✅ [IMAGE-TO-3D-POLL] Successfully updated existing figurine');
      } else {
        // Create new figurine with better naming
        console.log('🔄 [IMAGE-TO-3D-POLL] Creating new figurine record...');
        
        const prompt = storedPrompt || (fileName.includes('camera-capture') 
          ? `Camera captured model - ${new Date().toLocaleDateString()}`
          : `Generated from ${fileName.replace(/\.[^/.]+$/, '')}`);

        const title = storedPrompt 
          ? (storedPrompt.length > 50 
            ? `${storedPrompt.substring(0, 47)}...`
            : storedPrompt)
          : (fileName.includes('camera-capture') 
            ? `Camera 3D Model - ${new Date().toLocaleDateString()}`
            : `3D Model - ${fileName.replace(/\.[^/.]+$/, '')}`);

        const { data: newFigurine, error: insertError } = await supabase
          .from('figurines')
          .insert({
            user_id: userId,
            prompt: prompt,
            style: 'realistic' as const,
            title: title,
            image_url: originalImageUrl,
            saved_image_url: thumbnailUrl || originalImageUrl,
            model_url: modelUrl,
            is_public: true,
            file_type: 'image',
            metadata: {
              conversion_type: 'image-to-3d',
              task_id: taskId,
              created_via: 'image_conversion'
            }
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ [IMAGE-TO-3D-POLL] Failed to create figurine:', insertError);
          throw new Error('Failed to create figurine record');
        }

        console.log('✅ [IMAGE-TO-3D-POLL] Successfully created new figurine:', newFigurine.id);
      }

    } catch (error) {
      console.error('❌ [IMAGE-TO-3D-POLL] Error ensuring figurine record:', error);
      // Don't throw here - we still want to provide the model even if figurine creation fails
      console.warn('⚠️ [IMAGE-TO-3D-POLL] Continuing without figurine record');
    }
  }

  /**
   * Recovery mechanism to find and link orphaned models with better naming
   */
  async findOrphanedModels(userId: string): Promise<{found: number, linked: number}> {
    try {
      console.log('🔍 [IMAGE-TO-3D-RECOVERY] Searching for orphaned models...');

      // Get all conversion tasks for this user that succeeded
      const { data: conversionTasks, error: tasksError } = await supabase
        .from('conversion_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'SUCCEEDED')
        .not('local_model_url', 'is', null);

      if (tasksError) {
        console.error('❌ [IMAGE-TO-3D-RECOVERY] Error fetching conversion tasks:', tasksError);
        return { found: 0, linked: 0 };
      }

      if (!conversionTasks || conversionTasks.length === 0) {
        console.log('📝 [IMAGE-TO-3D-RECOVERY] No conversion tasks found');
        return { found: 0, linked: 0 };
      }

      console.log(`📊 [IMAGE-TO-3D-RECOVERY] Found ${conversionTasks.length} completed conversion tasks`);

      let linkedCount = 0;

      for (const task of conversionTasks) {
        try {
          // Check if a figurine already exists for this model
          const { data: existingFigurines, error: searchError } = await supabase
            .from('figurines')
            .select('id')
            .eq('user_id', userId)
            .eq('model_url', task.local_model_url)
            .limit(1);

          if (searchError) {
            console.error('❌ [IMAGE-TO-3D-RECOVERY] Search error for task:', task.task_id, searchError);
            continue;
          }

          if (existingFigurines && existingFigurines.length > 0) {
            console.log(`✅ [IMAGE-TO-3D-RECOVERY] Task ${task.task_id} already has figurine`);
            continue;
          }

          // Create figurine for orphaned model with better naming
          const prompt = task.prompt || `Recovered model from task ${task.task_id}`;
          const title = task.prompt 
            ? (task.prompt.length > 50 
              ? `${task.prompt.substring(0, 47)}...`
              : task.prompt)
            : `3D Model - ${task.task_id.substring(0, 8)}...`;

          const { error: insertError } = await supabase
            .from('figurines')
            .insert({
              user_id: userId,
              prompt: prompt,
              style: (task.art_style as any) || 'realistic' as const,
              title: title,
              image_url: task.local_thumbnail_url || '',
              saved_image_url: task.local_thumbnail_url,
              model_url: task.local_model_url,
              is_public: true,
              file_type: 'image',
              metadata: {
                conversion_type: 'image-to-3d',
                task_id: task.task_id,
                created_via: 'recovery',
                recovered_at: new Date().toISOString()
              }
            });

          if (insertError) {
            console.error('❌ [IMAGE-TO-3D-RECOVERY] Failed to create figurine for task:', task.task_id, insertError);
            continue;
          }

          console.log(`✅ [IMAGE-TO-3D-RECOVERY] Created figurine for orphaned task: ${task.task_id}`);
          linkedCount++;

        } catch (taskError) {
          console.error('❌ [IMAGE-TO-3D-RECOVERY] Error processing task:', task.task_id, taskError);
          continue;
        }
      }

      console.log(`✅ [IMAGE-TO-3D-RECOVERY] Recovery complete: ${linkedCount}/${conversionTasks.length} models linked`);
      return { found: conversionTasks.length, linked: linkedCount };

    } catch (error) {
      console.error('❌ [IMAGE-TO-3D-RECOVERY] Recovery failed:', error);
      return { found: 0, linked: 0 };
    }
  }
}

// Export singleton instance
export const imageToPhotoStatusService = new ImageTo3DStatusService();
