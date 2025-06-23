
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`🎨 [GENERATE-IMAGE] ${step}${detailsStr}`);
};

// Enhanced timeout and retry configuration
const TIMEOUT_CONFIG = {
  defaultTimeout: 45000, // 45 seconds
  retryTimeout: 60000,   // 60 seconds for retries
  maxRetries: 3,
  baseDelay: 2000        // 2 seconds base delay for exponential backoff
};

// Fallback models in order of preference
const FALLBACK_MODELS = [
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-xl-base-1.0',
  'runwayml/stable-diffusion-v1-5'
];

// Enhanced model-specific prompts for better results
const enhancePromptForModel = (prompt: string, model: string): string => {
  const basePrompt = prompt.trim();
  
  if (model.includes('FLUX')) {
    return `${basePrompt}, high quality, detailed, professional, 8k resolution`;
  } else if (model.includes('stable-diffusion-xl')) {
    return `${basePrompt}, masterpiece, best quality, ultra detailed, photorealistic`;
  } else {
    return `${basePrompt}, high quality, detailed`;
  }
};

// Enhanced error classification for better user feedback
const classifyError = (error: any, statusCode?: number): { 
  type: string; 
  userMessage: string; 
  shouldRetry: boolean;
  suggestedAction?: string;
} => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  if (statusCode === 504 || errorMessage.includes('504') || errorMessage.includes('Gateway Timeout')) {
    return {
      type: 'timeout',
      userMessage: 'The AI service is experiencing high load. Trying again with optimized settings...',
      shouldRetry: true,
      suggestedAction: 'retry_with_fallback'
    };
  }
  
  if (statusCode === 503 || errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
    return {
      type: 'service_unavailable',
      userMessage: 'AI service temporarily unavailable. Switching to backup model...',
      shouldRetry: true,
      suggestedAction: 'try_fallback_model'
    };
  }
  
  if (statusCode === 429 || errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return {
      type: 'rate_limit',
      userMessage: 'Service rate limit reached. Please wait a moment and try again.',
      shouldRetry: false,
      suggestedAction: 'wait_and_retry'
    };
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
    return {
      type: 'timeout',
      userMessage: 'Request timed out. Retrying with extended timeout...',
      shouldRetry: true,
      suggestedAction: 'retry_with_longer_timeout'
    };
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      type: 'network',
      userMessage: 'Network connectivity issue. Retrying connection...',
      shouldRetry: true,
      suggestedAction: 'retry_connection'
    };
  }
  
  return {
    type: 'unknown',
    userMessage: 'An unexpected error occurred. Please try again.',
    shouldRetry: false,
    suggestedAction: 'contact_support'
  };
};

// Enhanced image generation with comprehensive retry logic
const generateImageWithRetry = async (
  prompt: string, 
  style: string, 
  retryCount = 0,
  modelIndex = 0
): Promise<{ success: boolean; imageBlob?: Blob; error?: string; modelUsed?: string; retryAttempt?: number }> => {
  const currentModel = FALLBACK_MODELS[modelIndex] || FALLBACK_MODELS[0];
  const enhancedPrompt = enhancePromptForModel(prompt, currentModel);
  const isRetry = retryCount > 0;
  const timeoutMs = isRetry ? TIMEOUT_CONFIG.retryTimeout : TIMEOUT_CONFIG.defaultTimeout;
  
  logStep(`Generation attempt ${retryCount + 1}`, {
    model: currentModel,
    modelIndex,
    timeout: timeoutMs,
    promptLength: enhancedPrompt.length
  });
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      logStep(`Request timeout after ${timeoutMs}ms`, { retryCount, model: currentModel });
      controller.abort();
    }, timeoutMs);
    
    const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!HUGGING_FACE_API_KEY) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not configured');
    }
    
    logStep(`Calling Hugging Face API`, {
      model: currentModel,
      timeout: timeoutMs,
      retryCount
    });
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${currentModel}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: modelIndex === 0 ? 4 : 20, // FLUX.1-schnell uses 4 steps
            width: 1024,
            height: 1024
          }
        }),
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    logStep(`API response received`, {
      status: response.status,
      statusText: response.statusText,
      model: currentModel,
      retryCount
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logStep(`API error response`, {
        status: response.status,
        error: errorText,
        model: currentModel
      });
      
      const errorInfo = classifyError(errorText, response.status);
      
      // Handle specific error cases with appropriate retry logic
      if (errorInfo.shouldRetry && retryCount < TIMEOUT_CONFIG.maxRetries) {
        if (errorInfo.suggestedAction === 'try_fallback_model' && modelIndex < FALLBACK_MODELS.length - 1) {
          logStep(`Trying fallback model`, { nextModel: FALLBACK_MODELS[modelIndex + 1] });
          return generateImageWithRetry(prompt, style, 0, modelIndex + 1);
        } else if (errorInfo.suggestedAction === 'retry_with_fallback') {
          const delay = TIMEOUT_CONFIG.baseDelay * Math.pow(2, retryCount);
          logStep(`Retrying after delay`, { delay, nextRetryCount: retryCount + 1 });
          await new Promise(resolve => setTimeout(resolve, delay));
          return generateImageWithRetry(prompt, style, retryCount + 1, modelIndex);
        }
      }
      
      throw new Error(`${errorInfo.userMessage} (Status: ${response.status})`);
    }
    
    const imageBlob = await response.blob();
    
    // Validate the response
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Empty response received from image generation service');
    }
    
    if (imageBlob.size < 1000) {
      // Likely an error response disguised as image data
      const text = await imageBlob.text();
      logStep(`Suspicious small response`, { size: imageBlob.size, content: text });
      throw new Error('Invalid image data received');
    }
    
    logStep(`Image generated successfully`, {
      size: imageBlob.size,
      type: imageBlob.type,
      model: currentModel,
      retryCount
    });
    
    return {
      success: true,
      imageBlob,
      modelUsed: currentModel,
      retryAttempt: retryCount
    };
    
  } catch (error: any) {
    logStep(`Generation error`, {
      error: error.message,
      name: error.name,
      retryCount,
      model: currentModel
    });
    
    const errorInfo = classifyError(error);
    
    // Implement intelligent retry logic
    if (errorInfo.shouldRetry && retryCount < TIMEOUT_CONFIG.maxRetries) {
      if (error.name === 'AbortError' || errorInfo.type === 'timeout') {
        // For timeout errors, try next model or retry with longer timeout
        if (modelIndex < FALLBACK_MODELS.length - 1) {
          logStep(`Timeout - trying next model`, { nextModel: FALLBACK_MODELS[modelIndex + 1] });
          return generateImageWithRetry(prompt, style, 0, modelIndex + 1);
        } else {
          const delay = TIMEOUT_CONFIG.baseDelay * Math.pow(2, retryCount);
          logStep(`Timeout - retrying with delay`, { delay, nextRetryCount: retryCount + 1 });
          await new Promise(resolve => setTimeout(resolve, delay));
          return generateImageWithRetry(prompt, style, retryCount + 1, 0); // Reset to first model
        }
      } else if (errorInfo.type === 'service_unavailable' && modelIndex < FALLBACK_MODELS.length - 1) {
        logStep(`Service unavailable - trying fallback model`, { nextModel: FALLBACK_MODELS[modelIndex + 1] });
        return generateImageWithRetry(prompt, style, 0, modelIndex + 1);
      } else if (errorInfo.type === 'network') {
        const delay = TIMEOUT_CONFIG.baseDelay * Math.pow(2, retryCount);
        logStep(`Network error - retrying with delay`, { delay, nextRetryCount: retryCount + 1 });
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateImageWithRetry(prompt, style, retryCount + 1, modelIndex);
      }
    }
    
    return {
      success: false,
      error: errorInfo.userMessage,
      modelUsed: currentModel,
      retryAttempt: retryCount
    };
  }
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  return null
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    logStep("Request received", { method: req.method, url: req.url });

    // Enhanced request validation
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      logStep("Invalid content type", { contentType });
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      logStep("JSON parse error", { error: parseError });
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { prompt, style } = requestBody;

    // Enhanced input validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (prompt.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Prompt is too long (max 1000 characters)' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logStep("Starting image generation", { 
      promptLength: prompt.length, 
      style: style || 'default',
      timestamp: new Date().toISOString()
    });

    // Generate image with comprehensive retry logic
    const result = await generateImageWithRetry(prompt, style || 'default');

    if (!result.success) {
      logStep("Generation failed after all retries", { 
        error: result.error,
        modelUsed: result.modelUsed,
        retryAttempt: result.retryAttempt
      });
      
      return new Response(
        JSON.stringify({ 
          error: result.error,
          details: {
            modelUsed: result.modelUsed,
            retryAttempts: result.retryAttempt,
            suggestion: 'Please try again with a different prompt or try later when service load is lower.'
          }
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logStep("Successfully generated image", {
      size: result.imageBlob!.size,
      modelUsed: result.modelUsed,
      retryAttempts: result.retryAttempt
    });

    // Return the image blob directly
    return new Response(result.imageBlob, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'image/png',
        'X-Generation-Model': result.modelUsed || 'unknown',
        'X-Retry-Attempts': (result.retryAttempt || 0).toString()
      }
    });

  } catch (error: any) {
    logStep("Unexpected error in main handler", {
      error: error.message,
      stack: error.stack,
      name: error.name
    });

    const errorInfo = classifyError(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorInfo.userMessage,
        details: {
          type: errorInfo.type,
          suggestion: errorInfo.suggestedAction,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Add event listener to handle shutdown gracefully
addEventListener('beforeunload', (ev) => {
  console.log('🔄 [GENERATE-IMAGE] Function shutdown due to:', ev.detail?.reason);
});
