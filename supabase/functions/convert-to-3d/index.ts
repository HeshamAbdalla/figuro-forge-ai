
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`🔄 [CONVERT-TO-3D] ${step}${detailsStr}`);
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
    logStep("Function started")

    // Get authentication header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      logStep("ERROR: No authorization header provided")
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Create Supabase client for authentication and usage tracking
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    
    if (!supabaseServiceKey || !supabaseUrl) {
      logStep("ERROR: Missing Supabase configuration")
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Verify user authentication using the new enhanced auth system
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !userData.user) {
      logStep("ERROR: Authentication failed", { error: userError?.message })
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const userId = userData.user.id
    logStep("User authenticated", { userId })

    // Check and consume model conversion usage using the new enhanced system
    logStep("Checking user limits and consuming usage...")
    const { data: consumeData, error: consumeError } = await supabaseAdmin.functions.invoke('enhanced-consume-usage', {
      body: {
        feature_type: 'model_conversion',
        amount: 1
      },
      headers: {
        'Authorization': authHeader
      }
    })

    if (consumeError) {
      logStep("ERROR: Usage consumption failed", { error: consumeError.message })
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check usage limits',
          details: consumeError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!consumeData?.success) {
      logStep("ERROR: User has reached model conversion limit", { response: consumeData })
      return new Response(
        JSON.stringify({ 
          error: 'Model conversion limit reached',
          message: 'You have reached your 3D model conversion limit. Please upgrade your plan to continue.',
          credits_remaining: consumeData?.credits_remaining || 0,
          total_credits: consumeData?.total_credits || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    logStep("Usage consumed successfully", { remaining: consumeData.credits_remaining })

    // Parse request body
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      logStep("ERROR: Failed to parse request body", { error: parseError })
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { imageUrl, imageBase64, config } = requestBody

    if (!imageUrl && !imageBase64) {
      logStep("ERROR: Missing image data in request")
      return new Response(
        JSON.stringify({ error: 'Image URL or Base64 data is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    logStep("Processing with config", { config })
    logStep("Image data type", { type: imageBase64 ? 'base64' : 'url' })

    // Get Meshy.ai API key from environment variables
    const MESHY_API_KEY = Deno.env.get('MESHY_API_KEY')
    if (!MESHY_API_KEY) {
      logStep("ERROR: Meshy API key not configured")
      return new Response(
        JSON.stringify({ error: 'Meshy API key not configured. Please contact support.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    logStep("Creating 3D conversion request with Meshy API...")
    
    // Step 1: Prepare the request payload with correct structure for Meshy API v1
    const requestPayload: any = {}
    
    // Use base64 data if available, otherwise use URL
    if (imageBase64) {
      // Ensure base64 string has proper data URI format
      if (!imageBase64.startsWith('data:')) {
        logStep("ERROR: Invalid base64 format, missing data URI prefix")
        return new Response(
          JSON.stringify({ error: 'Invalid image format. Base64 data must include data URI prefix.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      requestPayload.image_url = imageBase64
      logStep("Using base64 image data")
    } else {
      // Validate HTTP URL format for non-blob URLs
      if (!imageUrl.startsWith('blob:')) {
        try {
          const url = new URL(imageUrl)
          if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('URL must use HTTP or HTTPS protocol')
          }
        } catch (urlError) {
          logStep("ERROR: Invalid image URL format", { error: urlError })
          return new Response(
            JSON.stringify({ error: 'Invalid image URL format. Must be a valid HTTP/HTTPS URL.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }
      }
      requestPayload.image_url = imageUrl
      logStep("Using image URL", { url: imageUrl.substring(0, 100) + '...' })
    }
    
    // Add optional configuration if provided
    if (config?.negative_prompt && config.negative_prompt.trim()) {
      requestPayload.negative_prompt = config.negative_prompt
    }
    
    // Add art style if provided
    if (config?.art_style) {
      requestPayload.art_style = config.art_style
    }

    logStep("Sending request to Meshy API endpoint...")

    // Using the correct v1 API endpoint for image-to-3d
    const response = await fetch('https://api.meshy.ai/v1/image-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    })

    logStep("Meshy API response status", { status: response.status })

    if (!response.ok) {
      const errorText = await response.text()
      logStep("ERROR: Meshy API error", { status: response.status, error: errorText })
      
      // Provide more specific error messages based on status code
      let userMessage = 'Failed to convert image to 3D model'
      if (response.status === 429) {
        userMessage = 'Meshy API rate limit exceeded. Please try again in a few minutes.'
      } else if (response.status === 400) {
        userMessage = 'Invalid image format or configuration. Please try a different image or check the image format.'
      } else if (response.status === 401) {
        userMessage = 'Meshy API authentication failed. Please contact support.'
      } else if (response.status === 404) {
        userMessage = 'Meshy API endpoint not found. The service may be temporarily unavailable.'
      }
      
      return new Response(
        JSON.stringify({ 
          error: userMessage,
          details: `API Error ${response.status}: ${errorText}`,
          meshy_status: response.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Parse the response from Meshy API
    const initialResult = await response.json()
    logStep("Meshy API success response", { result: initialResult })
    
    // Extract the task ID from the response
    const taskId = initialResult.result || initialResult.id || initialResult.task_id
    
    if (!taskId) {
      logStep("ERROR: No task ID found in Meshy response", { response: initialResult })
      return new Response(
        JSON.stringify({ 
          error: 'No task ID returned from conversion API',
          response: initialResult
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Store task information with configuration
    try {
      await supabaseAdmin.from('conversion_tasks').upsert({
        task_id: taskId,
        status: 'processing',
        created_at: new Date().toISOString(),
        image_url: imageBase64 ? 'base64-image' : imageUrl,
        user_id: userId,
        config: config
      }).select()
      
      logStep("Stored task info", { taskId })
    } catch (dbError) {
      logStep("WARNING: Failed to store task info", { error: dbError })
    }

    // Return the task ID to the client immediately
    logStep("Task created successfully", { taskId })
    return new Response(
      JSON.stringify({ 
        success: true, 
        taskId,
        status: 'processing',
        message: 'Conversion task started successfully.',
        config: config
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    logStep("ERROR: Unexpected error", { message: error.message, stack: error.stack })
    return new Response(
      JSON.stringify({ 
        error: 'Failed to convert image to 3D', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Add event listener to handle shutdown
addEventListener('beforeunload', (ev) => {
  console.log('🔄 [CONVERT-TO-3D] Function shutdown due to:', ev.detail?.reason)
})
