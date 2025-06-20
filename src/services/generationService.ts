
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

// Enhanced image generation with comprehensive error handling and retry logic
export const generateImage = async (
  prompt: string, 
  style: string, 
  apiKey: string = "",
  retryCount = 0
): Promise<{
  blob: Blob | null; 
  url: string | null; 
  error?: string; 
  method: "edge" | "direct";
  retryAttempt?: number;
}> => {
  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds base delay
  
  console.log(`🎨 [GENERATION] Starting image generation (attempt ${retryCount + 1}/${maxRetries + 1}):`, {
    prompt: prompt.substring(0, 50) + '...',
    style,
    retryCount,
    timestamp: new Date().toISOString()
  });

  try {
    // Enhanced authentication check with retry
    const { isValid, session, error: authError } = await validateAuthentication();
    if (!isValid || !session) {
      const errorMsg = authError || "Authentication required. Please refresh the page and try again.";
      console.error('❌ [GENERATION] Auth failed:', errorMsg);
      return {
        blob: null,
        url: null,
        error: errorMsg,
        method: "edge",
        retryAttempt: retryCount
      };
    }

    const supabaseUrl = SUPABASE_URL;
    if (!supabaseUrl) {
      const errorMsg = "Supabase configuration error";
      console.error('❌ [GENERATION]', errorMsg);
      return {
        blob: null,
        url: null,
        error: errorMsg,
        method: "edge",
        retryAttempt: retryCount
      };
    }
    
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
    
    // Enhanced error handling with retry logic
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [GENERATION] Edge function error (${response.status}):`, errorText);
      
      let errorMessage = `Generation failed: ${response.status}`;
      let shouldRetry = false;
      
      if (response.status === 401) {
        errorMessage = "Authentication expired. Please refresh the page and try again.";
      } else if (response.status === 429) {
        errorMessage = "Generation limit reached. Please upgrade your plan or try again later.";
      } else if (response.status === 503 || response.status === 502) {
        errorMessage = "Service temporarily unavailable. Retrying...";
        shouldRetry = true;
      } else if (response.status >= 500) {
        errorMessage = "Server error. Retrying...";
        shouldRetry = true;
      } else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          
          // Check if error suggests retry
          if (errorData.error?.includes('timeout') || errorData.error?.includes('network')) {
            shouldRetry = true;
          }
        } catch {
          errorMessage = errorText || errorMessage;
          if (errorText.includes('timeout') || errorText.includes('network')) {
            shouldRetry = true;
          }
        }
      }
      
      // Retry logic for recoverable errors
      if (shouldRetry && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`🔄 [GENERATION] Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateImage(prompt, style, apiKey, retryCount + 1);
      }
      
      return { 
        blob: null, 
        url: null,
        error: errorMessage,
        method: "edge",
        retryAttempt: retryCount
      };
    }
    
    // Get and validate the image blob
    const imageBlob = await response.blob();
    
    console.log(`📊 [GENERATION] Image blob received:`, {
      size: imageBlob.size,
      type: imageBlob.type,
      attempt: retryCount + 1
    });
    
    // Validate blob
    if (!imageBlob || imageBlob.size === 0) {
      const errorMsg = "Empty response received from generation service";
      console.error('❌ [GENERATION]', errorMsg);
      
      // Retry on empty response
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(`🔄 [GENERATION] Retrying due to empty response in ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateImage(prompt, style, apiKey, retryCount + 1);
      }
      
      return {
        blob: null,
        url: null,
        error: errorMsg,
        method: "edge",
        retryAttempt: retryCount
      };
    }
    
    // Validate image content type
    if (!imageBlob.type.startsWith('image/')) {
      console.warn('⚠️ [GENERATION] Unexpected content type:', imageBlob.type);
    }
    
    const imageUrl = URL.createObjectURL(imageBlob);
    
    console.log(`✅ [GENERATION] Successfully generated image:`, {
      blobSize: imageBlob.size,
      contentType: imageBlob.type,
      url: imageUrl.substring(0, 50) + '...',
      totalAttempts: retryCount + 1,
      timestamp: new Date().toISOString()
    });
    
    return { 
      blob: imageBlob, 
      url: imageUrl, 
      method: "edge",
      retryAttempt: retryCount
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
    
    // Retry logic for network/timeout errors
    if (shouldRetry && retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`🔄 [GENERATION] Retrying due to ${errorType} in ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateImage(prompt, style, apiKey, retryCount + 1);
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
export const validateImageForDisplay = (blob: Blob | null, url: string | null): boolean =>  {
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
