
import { supabase } from '@/integrations/supabase/client';
import { Generate3DConfig, ConversionCallbacks } from '../types/conversion';

// Helper function to convert blob URL to base64
const convertBlobToBase64 = async (blobUrl: string): Promise<string> => {
  try {
    console.log('🔄 [CONVERSION] Converting blob URL to base64:', blobUrl);
    
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log('✅ [CONVERSION] Successfully converted blob to base64');
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ [CONVERSION] Failed to convert blob to base64:', error);
    throw new Error('Failed to convert image to base64 format');
  }
};

// Helper function to check if URL is a blob URL
const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

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
      message: 'Processing image for 3D conversion...'
    });

    // Convert blob URL to base64 if necessary
    let processedImageUrl = imageUrl;
    let imageBase64: string | undefined;

    if (isBlobUrl(imageUrl)) {
      console.log('🔄 [CONVERSION] Detected blob URL, converting to base64...');
      callbacks.onProgressUpdate({
        status: 'converting',
        progress: 25,
        message: 'Converting image format...'
      });
      
      imageBase64 = await convertBlobToBase64(imageUrl);
      processedImageUrl = ''; // Clear the URL since we're using base64
    }

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

    callbacks.onProgressUpdate({
      status: 'converting',
      progress: 30,
      message: 'Starting 3D conversion...'
    });

    // Prepare the request payload
    const requestPayload: {
      imageUrl?: string;
      imageBase64?: string;
      config: Generate3DConfig;
    } = {
      config: finalConfig
    };

    // Use either URL or base64 data
    if (imageBase64) {
      requestPayload.imageBase64 = imageBase64;
    } else {
      requestPayload.imageUrl = processedImageUrl;
    }

    console.log('📤 [CONVERSION] Sending conversion request with payload type:', imageBase64 ? 'base64' : 'url');

    // Call the convert-to-3d edge function with configuration
    const { data, error } = await supabase.functions.invoke('convert-to-3d', {
      body: requestPayload
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
      progress: 40,
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
