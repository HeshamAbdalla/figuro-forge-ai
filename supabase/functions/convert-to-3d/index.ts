
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
    logStep("Request method", req.method)
    logStep("Request headers", Object.fromEntries(req.headers.entries()))

    // Enhanced authorization header validation
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      logStep("ERROR: No authorization header provided")
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Enhanced token extraction
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token || token === 'Bearer' || token === '') {
      logStep("ERROR: Invalid or empty JWT token")
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JWT token format' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    
    if (!supabaseServiceKey || !supabaseUrl) {
      logStep("ERROR: Missing Supabase configuration")
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    logStep("Validating user authentication...")
    
    // Enhanced user authentication with better error handling
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !userData.user) {
      logStep("ERROR: Authentication failed", { error: userError?.message })
      
      // Provide more specific error messages
      if (userError?.message?.includes('invalid claim') || userError?.message?.includes('missing sub claim')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid authentication token. Please refresh the page and try again.' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else if (userError?.message?.includes('expired')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication token expired. Please refresh the page and try again.' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication failed. Please sign in again.' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    const userId = userData.user.id
    logStep("User authenticated", { userId })

    // Enhanced usage consumption with better error handling
    logStep("Checking user limits and consuming usage...")
    
    try {
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
        
        // Handle specific consumption errors
        if (consumeError.message?.includes('JWT token')) {
          return new Response(
            JSON.stringify({ success: false, error: 'Authentication session expired. Please refresh the page and try again.' }),
            { 
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        } else if (consumeError.message?.includes('Invalid user session')) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid user session. Please sign out and sign in again.' }),
            { 
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        } else {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to check usage limits. Please try again.' }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }

      if (!consumeData?.success) {
        logStep("ERROR: User has reached model conversion limit", { response: consumeData })
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: consumeData?.error || 'You have reached your 3D model conversion limit. Please upgrade your plan to continue.',
            credits_remaining: consumeData?.credits_remaining || 0,
            total_credits: consumeData?.total_credits || 0
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      logStep("Usage consumed successfully", { remaining: consumeData.credits_remaining })

    } catch (invokeError) {
      logStep("ERROR: Function invoke error", { error: invokeError })
      
      // Fallback error handling - allow the request to proceed for now but log the issue
      logStep("WARNING: Proceeding without usage check due to authentication issues")
    }

    // Enhanced request body parsing with comprehensive error handling
    let requestBody
    try {
      // Check content-type header
      const contentType = req.headers.get('content-type')
      logStep("Content-Type", contentType)
      
      if (!contentType || !contentType.includes('application/json')) {
        logStep("WARNING: Missing or invalid Content-Type header")
      }

      // Get raw body and validate
      const rawBody = await req.text()
      logStep("Raw request body length", rawBody?.length || 0)
      logStep("Raw request body preview", rawBody?.substring(0, 500) || 'empty')
      
      if (!rawBody || rawBody.trim() === '') {
        logStep("ERROR: Request body is empty")
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Request body is empty. Please provide a valid JSON request.' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Parse JSON with detailed error handling
      try {
        requestBody = JSON.parse(rawBody)
        logStep("Parsed request body successfully")
        logStep("Request body keys", Object.keys(requestBody || {}))
      } catch (jsonError) {
        logStep("ERROR: JSON parsing failed", { error: jsonError })
        logStep("Invalid JSON content", rawBody)
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid JSON format in request body. Please check your request data.' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
    } catch (bodyError) {
      logStep("ERROR: Error reading request body", { error: bodyError })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to read request body. Please try again.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Comprehensive request validation with detailed error messages
    if (!requestBody || typeof requestBody !== 'object') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request body format. Expected a JSON object.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { imageUrl, imageBase64, config } = requestBody

    if (!imageUrl && !imageBase64) {
      logStep("ERROR: Missing image data in request")
      return new Response(
        JSON.stringify({ success: false, error: 'Image URL or Base64 data is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    logStep("Processing with config", { config })
    logStep("Image data type", { type: imageBase64 ? 'base64' : 'url' })

    // Get Meshy.ai API key from environment variables
    const MESHY_API_KEY = Deno.env.get('MESHY_API_KEY')
    if (!MESHY_API_KEY) {
      logStep("ERROR: Meshy API key not configured")
      return new Response(
        JSON.stringify({ success: false, error: 'Service temporarily unavailable. Please try again later.' }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
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
          JSON.stringify({ success: false, error: 'Invalid image format. Base64 data must include data URI prefix.' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
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
            JSON.stringify({ success: false, error: 'Invalid image URL format. Must be a valid HTTP/HTTPS URL.' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
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

    // Call Meshy API with timeout and retry logic
    let meshyResponse
    try {
      // Add timeout to the request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      meshyResponse = await fetch('https://api.meshy.ai/v1/image-to-3d', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MESHY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
    } catch (fetchError) {
      logStep("ERROR: Network error calling Meshy API", { error: fetchError })
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Request timeout. The service is taking too long to respond. Please try again.' 
          }),
          { 
            status: 408,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Network error. Please check your connection and try again.' 
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    logStep("Meshy API response status", { status: meshyResponse.status })

    if (!meshyResponse.ok) {
      const errorText = await meshyResponse.text()
      logStep("ERROR: Meshy API error", { status: meshyResponse.status, error: errorText })
      
      // Handle specific Meshy API errors
      if (meshyResponse.status === 400) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid image format or configuration. Please try a different image or check the image format.' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else if (meshyResponse.status === 401) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Service authentication error. Please try again later.' 
          }),
          { 
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else if (meshyResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Service is currently busy. Please try again in a few minutes.' 
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'External service error. Please try again later.' 
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const meshyData = await meshyResponse.json()
    logStep("Meshy API success response", meshyData)

    // Validate Meshy response
    if (!meshyData.result) {
      logStep("ERROR: Invalid Meshy response - no task ID")
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from 3D generation service. Please try again.' 
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Store task info in conversion_tasks table with proper error handling
    const taskId = meshyData.result
    
    try {
      const { error: storeError } = await supabaseAdmin
        .from('conversion_tasks')
        .insert({
          task_id: taskId,
          user_id: userId,
          status: 'processing',
          task_type: 'image_to_3d',
          image_url: imageBase64 ? 'base64-image' : imageUrl,
          config: config
        })

      if (storeError) {
        logStep("ERROR: Error storing task", { error: storeError })
        // Don't throw here, as the task was created successfully in Meshy
      } else {
        logStep("Stored task info. Task ID", taskId)
      }
    } catch (dbError) {
      logStep("ERROR: Database error", { error: dbError })
      // Continue execution even if database storage fails
    }

    logStep("Task created successfully", { taskId })

    return new Response(
      JSON.stringify({ 
        success: true, 
        taskId: taskId,
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
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Add event listener to handle shutdown
addEventListener('beforeunload', (ev) => {
  console.log('🔄 [CONVERT-TO-3D] Function shutdown due to:', ev.detail?.reason)
})
