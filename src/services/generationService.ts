
import { supabase } from "@/integrations/supabase/client";

// Progress tracking for better user experience
export interface GenerationProgress {
  stage: 'validating' | 'generating' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  retryAttempt?: number;
  modelUsed?: string;
}

// Simplified authentication validation
const validateAuthentication = async (): Promise<{ isValid: boolean; session: any; error?: string }> => {
  try {
    console.log('🔐 [GENERATION] Validating authentication...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [GENERATION] Auth session error:', error);
      return { isValid: false, session: null, error: error.message };
    }
    
    if (!session?.access_token) {
      const errorMsg = 'No access token available';
      console.error('❌ [GENERATION]', errorMsg);
      return { isValid: false, session: null, error: errorMsg };
    }
    
    console.log('✅ [GENERATION] Auth validation successful');
    return { isValid: true, session };
  } catch (error) {
    const errorMsg = `Auth validation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('❌ [GENERATION]', errorMsg);
    return { isValid: false, session: null, error: errorMsg };
  }
};

// Simplified image generation with single retry
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
  console.log(`🎨 [GENERATION] Starting image generation (attempt ${retryCount + 1}):`, {
    prompt: prompt.substring(0, 50) + '...',
    style
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

    // Validate inputs
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    if (prompt.length > 1000) {
      throw new Error("Prompt is too long (max 1000 characters)");
    }

    // Check authentication
    const { isValid, session, error: authError } = await validateAuthentication();
    if (!isValid || !session) {
      const errorMsg = authError || "Authentication required. Please refresh the page and try again.";
      console.error('❌ [GENERATION] Auth failed:', errorMsg);
      updateProgress('error', 0, errorMsg);
      throw new Error(errorMsg);
    }

    updateProgress('generating', 30, 'Generating image with AI...');

    // Get Supabase URL for edge function
    const supabaseUrl = process.env.NODE_ENV === 'development' 
      ? 'https://cwjxbwqdfejhmiixoiym.supabase.co'  // Direct project URL
      : 'https://cwjxbwqdfejhmiixoiym.supabase.co';
    
    console.log(`🚀 [GENERATION] Making request to edge function`);
    
    // Single request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ [GENERATION] Request timeout`);
      controller.abort();
    }, 45000); // 45 second timeout
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3anhid3FkZmVqaG1paXhvaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTg0MDksImV4cCI6MjA2MzQ3NDQwOX0.g_-L7Bsv0cnEjSLNXEjrDdYYdxtV7yiHFYUV3_Ww3PI"
      },
      body: JSON.stringify({ prompt, style }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📡 [GENERATION] Response received:`, {
      status: response.status,
      statusText: response.statusText
    });

    // Extract generation metadata from headers
    const modelUsed = response.headers.get('X-Generation-Model') || 'unknown';
    updateProgress('processing', 70, `Processing image (Model: ${modelUsed})...`, { modelUsed });
    
    // Handle response
    if (!response.ok) {
      let errorMessage = `Generation failed: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse error as JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      console.error(`❌ [GENERATION] Edge function error (${response.status}):`, errorMessage);
      
      // Single retry for 5xx errors
      if (response.status >= 500 && retryCount === 0) {
        console.log('🔄 [GENERATION] Retrying due to server error...');
        updateProgress('generating', 40, 'Retrying with backup systems...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        return generateImage(prompt, style, apiKey, retryCount + 1, onProgress);
      }
      
      updateProgress('error', 0, errorMessage, { modelUsed });
      throw new Error(errorMessage);
    }
    
    updateProgress('processing', 80, 'Finalizing image...');

    // Get and validate the image blob
    const imageBlob = await response.blob();
    
    console.log(`📊 [GENERATION] Image blob received:`, {
      size: imageBlob.size,
      type: imageBlob.type,
      modelUsed
    });
    
    // Validate blob
    if (!imageBlob || imageBlob.size === 0) {
      const errorMsg = "Empty response received from generation service";
      console.error('❌ [GENERATION]', errorMsg);
      updateProgress('error', 0, errorMsg);
      throw new Error(errorMsg);
    }
    
    if (imageBlob.size < 1000) {
      const errorMsg = "Invalid image data received (file too small)";
      console.error('❌ [GENERATION]', errorMsg, { size: imageBlob.size });
      updateProgress('error', 0, errorMsg);
      throw new Error(errorMsg);
    }
    
    updateProgress('completed', 100, 'Image generated successfully!', { modelUsed });

    const imageUrl = URL.createObjectURL(imageBlob);
    
    console.log(`✅ [GENERATION] Successfully generated image:`, {
      blobSize: imageBlob.size,
      contentType: imageBlob.type,
      modelUsed,
      totalAttempts: retryCount + 1
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
      attempt: retryCount + 1
    });
    
    let finalErrorMessage = "Failed to generate image";
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        finalErrorMessage = `Request timeout. Please try again.`;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        finalErrorMessage = "Network error. Please check your connection and try again.";
      } else {
        finalErrorMessage = errorMessage;
      }
    }
    
    updateProgress('error', 0, finalErrorMessage);
    
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
