
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

// Simplified model configuration
const PRIMARY_MODEL = 'black-forest-labs/FLUX.1-schnell';
const FALLBACK_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';

// Enhanced prompt for better results
const enhancePrompt = (prompt: string): string => {
  return `${prompt.trim()}, high quality, detailed, professional, 8k resolution`;
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

    // Validate content type
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

    // Parse request body
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

    // Validate prompt
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

    // Get Hugging Face API key
    const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!HUGGING_FACE_API_KEY) {
      logStep("Missing API key");
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const enhancedPrompt = enhancePrompt(prompt);
    logStep("Starting image generation", { 
      promptLength: enhancedPrompt.length,
      model: PRIMARY_MODEL
    });

    // Single API call with reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${PRIMARY_MODEL}`,
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
              num_inference_steps: 4, // Fast generation for FLUX.1-schnell
              width: 1024,
              height: 1024
            }
          }),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      
      logStep("API response received", {
        status: response.status,
        statusText: response.statusText,
        model: PRIMARY_MODEL
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logStep("API error", { status: response.status, error: errorText });
        
        // Try fallback model if primary fails
        if (response.status === 503 || response.status === 502) {
          logStep("Trying fallback model", { model: FALLBACK_MODEL });
          
          const fallbackResponse = await fetch(
            `https://api-inference.huggingface.co/models/${FALLBACK_MODEL}`,
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
                  num_inference_steps: 20,
                  width: 1024,
                  height: 1024
                }
              }),
            }
          );
          
          if (fallbackResponse.ok) {
            const imageBlob = await fallbackResponse.blob();
            logStep("Fallback generation successful", {
              size: imageBlob.size,
              model: FALLBACK_MODEL
            });
            
            return new Response(imageBlob, {
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'image/png',
                'X-Generation-Model': FALLBACK_MODEL
              }
            });
          }
        }
        
        return new Response(
          JSON.stringify({ 
            error: `Generation failed: ${response.status}`,
            details: errorText
          }),
          { 
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const imageBlob = await response.blob();
      
      // Validate response
      if (!imageBlob || imageBlob.size === 0) {
        logStep("Empty response received");
        return new Response(
          JSON.stringify({ error: 'Empty response from generation service' }),
          { 
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (imageBlob.size < 1000) {
        logStep("Suspicious small response", { size: imageBlob.size });
        return new Response(
          JSON.stringify({ error: 'Invalid image data received' }),
          { 
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      logStep("Image generated successfully", {
        size: imageBlob.size,
        type: imageBlob.type,
        model: PRIMARY_MODEL
      });
      
      return new Response(imageBlob, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'image/png',
          'X-Generation-Model': PRIMARY_MODEL
        }
      });
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      logStep("Network error", { error: fetchError.message });
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timeout. Please try again.' }),
          { 
            status: 408,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Network error. Please try again.' }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error: any) {
    logStep("Unexpected error", { error: error.message });
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again.',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
