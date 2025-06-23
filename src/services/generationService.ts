
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

// Enhanced authentication validation with retry logic
const validateAuthentication = async (retryCount = 0): Promise<{ isValid: boolean; session: any; error?: string }> => {
  const maxRetries = 2;
  
  try {
    console.log(`🔐 [GENERATION] Auth validation attempt ${retryCount + 1}/${maxRetries + 1}`);
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [GENERATION] Auth session error:', error);
      
      // Retry on transient errors
      if (retryCount < maxRetries && (error.message.includes('network') || error.message.includes('timeout'))) {
        console.log('🔄 [GENERATION] Retrying auth validation...');
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return validateAuthentication(retryCount + 1);
      }
      
      return { isValid: false, session: null, error: error.message };
    }
    
    if (!session?.access_token) {
      const errorMsg = 'No access token available';
      console.error('❌ [GENERATION]', errorMsg);
      return { isValid: false, session: null, error: errorMsg };
    }
    
    // Check token expiration with buffer
    const bufferTime = 60; // 60 seconds buffer
    if (session.expires_at && (Date.now() / 1000) > (session.expires_at - bufferTime)) {
      const errorMsg = 'Session expired or expiring soon';
      console.error('❌ [GENERATION]', errorMsg);
      return { isValid: false, session: null, error: errorMsg };
    }
    
    console.log('✅ [GENERATION] Auth validation successful');
    return { isValid: true, session };
  } catch (error) {
    const errorMsg = `Auth validation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('❌ [GENERATION]', errorMsg);
    
    // Retry on network errors
    if (retryCount < maxRetries) {
      console.log('🔄 [GENERATION] Retrying auth validation...');
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return validateAuthentication(retryCount + 1);
    }
    
    return { isValid: false, session: null, error: errorMsg };
  }
};

// Progress tracking for better user experience
interface GenerationProgress {
  stage: 'validating' | 'generating' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  retryAttempt?: number;
  modelUsed?: string;
}

// Enhanced image generation with comprehensive error handling and retry logic
export const generateImage = async (
  prompt: string, 
  style: string, 
  apiKey: string = "",
  retryCount = 0,
  onProgress?: (progress: GenerationProgress) => void
): Promise<{
  blob: Blob | null; 
  url: string | null; 
  error?: string; 
  method: "edge" | "direct";
  retryAttempt?: number;
  modelUsed?: string;
}> => {
  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds base delay
  
  console.log(`🎨 [GENERATION] Starting image generation (attempt ${retryCount + 1}/${maxRetries + 1}):`, {
    prompt: prompt.substring(0, 50) + '...',
    style,
    retryCount,
    timestamp: new Date().toISOString()
  });

  // Progress tracking
  const updateProgress = (stage: GenerationProgress['stage'], progress: number, message: string, extra?: Partial<GenerationProgress>) => {
    if (onProgress) {
      onProgress({
        stage,
        progress,
        message,
        retryAttempt: retryCount,
        ...extra
      });
    }
  };

  try {
    updateProgress('validating', 10, 'Validating authentication...');

    // Enhanced authentication check with retry
    const { isValid, session, error: authError } = await validateAuthentication();
    if (!isValid || !session) {
      const errorMsg = authError || "Authentication required. Please refresh the page and try again.";
      console.error('❌ [GENERATION] Auth failed:', errorMsg);
      updateProgress('error', 0, errorMsg);
      return {
        blob: null,
        url: null,
        error: errorMsg,
        method: "edge",
        retryAttempt: retryCount
      };
    }

    updateProgress('validating', 20, 'Preparing generation request...');

    const supabaseUrl = SUPABASE_URL;
    if (!supabaseUrl) {
      const errorMsg = "Supabase configuration error";
      console.error('❌ [GENERATION]', errorMsg);
      updateProgress('error', 0, errorMsg);
      return {
        blob: null,
        url: null,
        error: errorMsg,
        method: "edge",
        retryAttempt: retryCount
      };
    }
    
    updateProgress('generating', 30, 'Generating image with AI...');

    // Enhanced timeout based on retry attempt
    const timeoutMs = 60000 + (retryCount * 30000); // Increase timeout with retries
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ [GENERATION] Request timeout (${timeoutMs}ms) - attempt ${retryCount + 1}`);
      controller.abort();
    }, timeoutMs);
    
    console.log(`🚀 [GENERATION] Making request to edge function (timeout: ${timeoutMs}ms)`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": SUPABASE_PUBLISHABLE_KEY
      },
      body: JSON.stringify({ 
        prompt,
        style,
        retryAttempt: retryCount
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📡 [GENERATION] Response received:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      attempt: retryCount + 1
    });

    // Extract generation metadata from headers
    const modelUsed = response.headers.get('X-Generation-Model') || 'unknown';
    const serverRetryAttempts = parseInt(response.headers.get('X-Retry-Attempts') || '0');
    
    updateProgress('processing', 70, `Processing image (Model: ${modelUsed})...`, { modelUsed });
    
    // Enhanced error handling with retry logic
    if (!response.ok) {
      let errorData: any = {};
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
        } else {
          const errorText = await response.text();
          errorData = { error: errorText };
        }
      } catch (parseError) {
        console.error('❌ [GENERATION] Failed to parse error response:', parseError);
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }

      console.error(`❌ [GENERATION] Edge function error (${response.status}):`, errorData);
      
      let errorMessage = `Generation failed: ${response.status}`;
      let shouldRetry = false;
      
      if (response.status === 401) {
        errorMessage = "Authentication expired. Please refresh the page and try again.";
      } else if (response.status === 429) {
        errorMessage = "Generation limit reached. Please upgrade your plan or try again later.";
      } else if (response.status === 503 || response.status === 502) {
        errorMessage = errorData.error || "Service temporarily unavailable. Retrying...";
        shouldRetry = true;
      } else if (response.status >= 500) {
        errorMessage = errorData.error || "Server error. Retrying...";
        shouldRetry = true;
      } else if (response.status === 408) {
        errorMessage = "Request timeout. Retrying with longer timeout...";
        shouldRetry = true;
      } else {
        errorMessage = errorData.error || errorMessage;
        
        // Check if error suggests retry
        if (errorData.error?.includes('timeout') || errorData.error?.includes('network') || errorData.error?.includes('load')) {
          shouldRetry = true;
        }
      }
      
      updateProgress('error', 0, errorMessage, { modelUsed });
      
      // Retry logic for recoverable errors
      if (shouldRetry && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`🔄 [GENERATION] Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        
        updateProgress('generating', 40, `Retrying with backup systems... (${delay/1000}s)`, { modelUsed });
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateImage(prompt, style, apiKey, retryCount + 1, onProgress);
      }
      
      return { 
        blob: null, 
        url: null,
        error: errorMessage,
        method: "edge",
        retryAttempt: retryCount,
        modelUsed
      };
    }
    
    updateProgress('processing', 80, 'Finalizing image...');

    // Get and validate the image blob
    const imageBlob = await response.blob();
    
    console.log(`📊 [GENERATION] Image blob received:`, {
      size: imageBlob.size,
      type: imageBlob.type,
      attempt: retryCount + 1,
      modelUsed,
      serverRetries: serverRetryAttempts
    });
    
    // Validate blob
    if (!imageBlob || imageBlob.size === 0) {
      const errorMsg = "Empty response received from generation service";
      console.error('❌ [GENERATION]', errorMsg);
      updateProgress('error', 0, errorMsg);
      
      // Retry on empty response
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`🔄 [GENERATION] Retrying due to empty response in ${delay}ms`);
        
        updateProgress('generating', 50, `Retrying due to empty response... (${delay/1000}s)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateImage(prompt, style, apiKey, retryCount + 1, onProgress);
      }
      
      return {
        blob: null,
        url: null,
        error: errorMsg,
        method: "edge",
        retryAttempt: retryCount,
        modelUsed
      };
    }
    
    // Additional validation for suspicious responses
    if (imageBlob.size < 1000) {
      const errorMsg = "Invalid image data received (file too small)";
      console.error('❌ [GENERATION]', errorMsg, { size: imageBlob.size });
      updateProgress('error', 0, errorMsg);
      
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`🔄 [GENERATION] Retrying due to invalid data in ${delay}ms`);
        
        updateProgress('generating', 60, `Retrying due to invalid data... (${delay/1000}s)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateImage(prompt, style, apiKey, retryCount + 1, onProgress);
      }
      
      return {
        blob: null,
        url: null,
        error: errorMsg,
        method: "edge",
        retryAttempt: retryCount,
        modelUsed
      };
    }
    
    // Validate image content type
    if (!imageBlob.type.startsWith('image/')) {
      console.warn('⚠️ [GENERATION] Unexpected content type:', imageBlob.type);
    }
    
    updateProgress('completed', 100, 'Image generated successfully!', { modelUsed });

    const imageUrl = URL.createObjectURL(imageBlob);
    
    console.log(`✅ [GENERATION] Successfully generated image:`, {
      blobSize: imageBlob.size,
      contentType: imageBlob.type,
      url: imageUrl.substring(0, 50) + '...',
      totalAttempts: retryCount + 1,
      modelUsed,
      serverRetries: serverRetryAttempts,
      timestamp: new Date().toISOString()
    });
    
    return { 
      blob: imageBlob, 
      url: imageUrl, 
      method: "edge",
      retryAttempt: retryCount,
      modelUsed
    };
    
  } catch (error) {
    const errorType = error instanceof Error ? error.name : 'Unknown';
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ [GENERATION] Generation error (${errorType}):`, {
      message: errorMessage,
      attempt: retryCount + 1,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    let finalErrorMessage = "Failed to generate image";
    let shouldRetry = false;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        finalErrorMessage = `Request timeout after ${60 + (retryCount * 30)} seconds. Please try again.`;
        shouldRetry = true;
      } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('NetworkError')) {
        finalErrorMessage = "Network error. Please check your connection and try again.";
        shouldRetry = true;
      } else if (error.message.includes('timeout')) {
        finalErrorMessage = "Request timeout. Please try again.";
        shouldRetry = true;
      } else {
        finalErrorMessage = errorMessage;
      }
    }
    
    updateProgress('error', 0, finalErrorMessage);
    
    // Retry logic for network/timeout errors
    if (shouldRetry && retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`🔄 [GENERATION] Retrying due to ${errorType} in ${delay}ms`);
      
      updateProgress('generating', 25, `Retrying due to ${errorType.toLowerCase()}... (${delay/1000}s)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateImage(prompt, style, apiKey, retryCount + 1, onProgress);
    }
    
    return { 
      blob: null, 
      url: null,
      error: finalErrorMessage,
      method: "edge",
      retryAttempt: retryCount
    };
  }
};

// Helper function to cleanup generated image URLs
export const cleanupImageUrl = (url: string | null) => {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
      console.log('🧹 [GENERATION] Cleaned up blob URL');
    } catch (error) {
      console.warn('⚠️ [GENERATION] Failed to cleanup blob URL:', error);
    }
  }
};

// Helper function to validate image before display
export const validateImageForDisplay = (blob: Blob | null, url: string | null): boolean => {
  if (!blob || !url) {
    console.warn('⚠️ [GENERATION] Invalid image data for display');
    return false;
  }
  
  if (blob.size === 0) {
    console.warn('⚠️ [GENERATION] Empty image blob');
    return false;
  }
  
  if (!blob.type.startsWith('image/')) {
    console.warn('⚠️ [GENERATION] Invalid image content type:', blob.type);
    return false;
  }
  
  console.log('✅ [GENERATION] Image validated for display');
  return true;
};

// Enhanced progress tracking types
export type { GenerationProgress };
