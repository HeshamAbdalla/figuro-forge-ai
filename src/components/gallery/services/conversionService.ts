
import { supabase } from '@/integrations/supabase/client';
import { Generate3DConfig, ConversionCallbacks } from '../types/conversion';

export const startConversion = async (
  imageUrl: string,
  config: Generate3DConfig,
  callbacks: ConversionCallbacks
): Promise<string> => {
  try {
    console.log('🔄 [CONVERSION] Starting 3D conversion with config:', config);

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Please log in to generate 3D models');
    }

    callbacks.onProgressUpdate({
      status: 'converting',
      progress: 20,
      message: 'Starting 3D conversion...'
    });

    // Use the provided config or fall back to defaults
    const finalConfig: Generate3DConfig = {
      art_style: config.art_style || 'realistic',
      ai_model: config.ai_model || 'meshy-5',
      topology: config.topology || 'quad',
      target_polycount: config.target_polycount || 20000,
      texture_richness: config.texture_richness || 'high',
      moderation: config.moderation !== undefined ? config.moderation : true,
      negative_prompt: config.negative_prompt
    };

    // Call the convert-to-3d edge function with configuration
    const { data, error } = await supabase.functions.invoke('convert-to-3d', {
      body: { 
        imageUrl,
        config: finalConfig
      }
    });

    if (error) {
      console.error('❌ [CONVERSION] Conversion error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('limit reached') || error.message?.includes('429')) {
        throw new Error('You have reached your 3D model conversion limit. Please upgrade your plan to continue.');
      }
      
      throw new Error(`Conversion failed: ${error.message}`);
    }

    if (!data?.taskId) {
      throw new Error('No task ID received from conversion service');
    }

    console.log('✅ [CONVERSION] Conversion started, task ID:', data.taskId);

    callbacks.onProgressUpdate({
      status: 'converting',
      progress: 30,
      message: 'Converting image to 3D model...',
      taskId: data.taskId
    });

    return data.taskId;

  } catch (error) {
    console.error('❌ [CONVERSION] 3D generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate 3D model';
    callbacks.onError(errorMessage);
    throw error;
  }
};
