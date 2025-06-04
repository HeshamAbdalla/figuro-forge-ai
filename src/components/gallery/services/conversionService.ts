
import { supabase } from '@/integrations/supabase/client';
import { Generate3DConfig, ConversionCallbacks } from '../types/conversion';

// Helper function to convert blob URL to base64
const convertBlobToBase64 = async (blobUrl: string): Promise<string> => {
  try {
    console.log('🔄 [CONVERSION] Converting blob URL to base64:', blobUrl);
    
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Validate blob size (limit to 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      throw new Error('Image file is too large (max 10MB)');
    }
    
    // Validate blob type
    if (!blob.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log('✅ [CONVERSION] Successfully converted blob to base64, size:', blob.size);
        resolve(base64String);
      };
      reader.onerror = () => {
        console.error('❌ [CONVERSION] FileReader error');
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ [CONVERSION] Failed to convert blob to base64:', error);
    throw new Error(`Failed to convert image: ${error.message}`);
  }
};

// Helper function to check if URL is a blob URL
const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

// Helper function to validate authentication
const validateAuthentication = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ [CONVERSION] Auth session error:', error);
      return false;
    }
    
    if (!session?.user) {
      console.error('❌ [CONVERSION] No authenticated user');
      return false;
    }
    
    // Check if token is still valid (not expired)
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      console.error('❌ [CONVERSION] Session expired');
      return false;
    }
    
    console.log('✅ [CONVERSION] Authentication validated for user:', session.user.id);
    return true;
  } catch (error) {
    console.error('❌ [CONVERSION] Authentication validation failed:', error);
    return false;
  }
};

export const startConversion = async (
  imageUrl: string,
  config: Generate3DConfig,
  callbacks: ConversionCallbacks,
  prompt?: string
): Promise<string> => {
  try {
    console.log('🔄 [CONVERSION] Starting 3D conversion with config:', config);

    // Enhanced authentication check
    const isAuthenticated = await validateAuthentication();
    if (!isAuthenticated) {
      throw new Error('Please log in to generate 3D models');
    }

    callbacks.onProgressUpdate({
      status: 'converting',
      progress: 10,
      percentage: 10,
      message: 'Validating authentication...'
    });

    // Get fresh session for API calls
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Authentication session expired. Please refresh the page and try again.');
    }

    callbacks.onProgressUpdate({
      status: 'converting',
      progress: 20,
      percentage: 20,
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
        percentage: 25,
        message: 'Converting camera image...'
      });
      
      try {
        imageBase64 = await convertBlobToBase64(imageUrl);
        processedImageUrl = ''; // Clear the URL since we're using base64
        console.log('✅ [CONVERSION] Blob URL successfully converted to base64');
      } catch (blobError) {
        console.error('❌ [CONVERSION] Blob conversion failed:', blobError);
        throw new Error(`Failed to process camera image: ${blobError.message}`);
      }
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
      percentage: 30,
      message: 'Starting 3D conversion...'
    });

    // Prepare the request payload
    const requestPayload: {
      imageUrl?: string;
      imageBase64?: string;
      config: Generate3DConfig;
      prompt?: string;
    } = {
      config: finalConfig
    };

    // Use either URL or base64 data
    if (imageBase64) {
      requestPayload.imageBase64 = imageBase64;
    } else {
      requestPayload.imageUrl = processedImageUrl;
    }

    // Add prompt if provided
    if (prompt) {
      requestPayload.prompt = prompt;
    }

    console.log('📤 [CONVERSION] Sending conversion request with payload type:', imageBase64 ? 'base64' : 'url');

    // Call the convert-to-3d edge function with fresh authentication
    const { data, error } = await supabase.functions.invoke('convert-to-3d', {
      body: requestPayload,
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('❌ [CONVERSION] Conversion error:', error);
      
      // Enhanced error handling for different failure types
      let errorMessage = 'Conversion failed';
      
      if (error.message?.includes('limit reached') || error.message?.includes('429')) {
        errorMessage = 'You have reached your 3D model conversion limit. Please upgrade your plan to continue.';
      } else if (error.message?.includes('authentication') || error.message?.includes('401')) {
        errorMessage = 'Authentication failed. Please refresh the page and try again.';
      } else if (error.message?.includes('Invalid image')) {
        errorMessage = 'Invalid image format. Please try a different image.';
      } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }

    if (!data?.taskId) {
      console.error('❌ [CONVERSION] No task ID received:', data);
      throw new Error('No task ID received from conversion service. Please try again.');
    }

    console.log('✅ [CONVERSION] Conversion started, task ID:', data.taskId);

    callbacks.onProgressUpdate({
      status: 'converting',
      progress: 40,
      percentage: 40,
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
