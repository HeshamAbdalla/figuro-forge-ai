
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    console.log("🔄 [CONVERT-TO-3D] Function started")

    // Get authentication header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("❌ [CONVERT-TO-3D] No authorization header provided")
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Create Supabase client for authentication and usage tracking
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    
    if (!supabaseServiceKey || !supabaseUrl) {
      console.error("❌ [CONVERT-TO-3D] Missing Supabase configuration")
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !userData.user) {
      console.error("❌ [CONVERT-TO-3D] Authentication failed:", userError?.message)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const userId = userData.user.id
    console.log("✅ [CONVERT-TO-3D] User authenticated:", userId)

    // Check and consume model conversion usage
    console.log("🔍 [CONVERT-TO-3D] Checking user limits and consuming usage...")
    const { data: canConsume, error: consumeError } = await supabase.rpc('consume_feature_usage', {
      feature_type: 'model_conversion',
      user_id_param: userId,
      amount: 1
    })

    if (consumeError) {
      console.error("❌ [CONVERT-TO-3D] Database error during usage check:", consumeError.message, consumeError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check usage limits',
          details: consumeError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!canConsume) {
      console.log("🚫 [CONVERT-TO-3D] User has reached model conversion limit")
      return new Response(
        JSON.stringify({ 
          error: 'Model conversion limit reached',
          message: 'You have reached your monthly 3D model conversion limit. Please upgrade your plan to continue.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    console.log("✅ [CONVERT-TO-3D] Usage consumed successfully")

    // Parse request body
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error("❌ [CONVERT-TO-3D] Failed to parse request body:", parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { imageUrl, imageBase64, config } = requestBody

    if (!imageUrl && !imageBase64) {
      console.error("❌ [CONVERT-TO-3D] Missing image data in request")
      return new Response(
        JSON.stringify({ error: 'Image URL or Base64 data is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log("🔧 [CONVERT-TO-3D] Processing with config:", config)

    // Get Meshy.ai API key from environment variables
    const MESHY_API_KEY = Deno.env.get('MESHY_API_KEY')
    if (!MESHY_API_KEY) {
      console.error("❌ [CONVERT-TO-3D] Meshy API key not configured")
      return new Response(
        JSON.stringify({ error: 'Meshy API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Get current URL to construct the webhook callback URL
    const url = new URL(req.url)
    const baseUrl = Deno.env.get('SUPABASE_URL') || `${url.protocol}//${url.hostname}`
    const callbackUrl = `${baseUrl}/functions/v1/check-3d-status?webhook=true`
    
    console.log("🔄 [CONVERT-TO-3D] Creating 3D conversion request with enhanced config...")
    console.log(`📞 [CONVERT-TO-3D] Webhook callback URL: ${callbackUrl}`)
    
    // Step 1: Prepare the request payload with enhanced configuration
    const requestPayload: any = {
      ai_model: config?.ai_model || 'meshy-5',
      art_style: config?.art_style || 'realistic',
      topology: config?.topology || 'quad',
      target_polycount: config?.target_polycount || 20000,
      texture_richness: config?.texture_richness || 'high',
      moderation: config?.moderation !== undefined ? config.moderation : true,
      webhook_url: callbackUrl
    }
    
    // Add negative prompt if provided
    if (config?.negative_prompt && config.negative_prompt.trim()) {
      requestPayload.negative_prompt = config.negative_prompt
    }
    
    // Add either the URL or the base64 data
    if (imageBase64) {
      requestPayload.image_url = imageBase64.startsWith('data:') 
        ? imageBase64 
        : `data:image/png;base64,${imageBase64}`
    } else {
      requestPayload.image_url = imageUrl
    }

    console.log("📤 [CONVERT-TO-3D] Sending enhanced request to Meshy API...")
    console.log("🔧 [CONVERT-TO-3D] Final payload config:", {
      ai_model: requestPayload.ai_model,
      art_style: requestPayload.art_style,
      topology: requestPayload.topology,
      target_polycount: requestPayload.target_polycount,
      texture_richness: requestPayload.texture_richness,
      moderation: requestPayload.moderation
    })

    // Using the v2 API endpoint for enhanced configuration support
    const response = await fetch('https://api.meshy.ai/v2/image-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [CONVERT-TO-3D] Meshy API error (${response.status}):`, errorText)
      
      // Provide more specific error messages
      let userMessage = 'Failed to convert image to 3D model'
      if (response.status === 429) {
        userMessage = 'Meshy API rate limit exceeded. Please try again in a few minutes.'
      } else if (response.status === 400) {
        userMessage = 'Invalid image format or configuration. Please try different settings.'
      } else if (response.status === 401) {
        userMessage = 'Meshy API authentication failed. Please contact support.'
      }
      
      throw new Error(`${userMessage}: ${errorText}`)
    }

    // Parse the response from Meshy API
    const initialResult = await response.json()
    console.log("📊 [CONVERT-TO-3D] Enhanced Meshy API response:", JSON.stringify(initialResult))
    
    // Extract the task ID from the response
    const taskId = initialResult.result || initialResult.id
    
    if (!taskId) {
      console.error("❌ [CONVERT-TO-3D] No task ID found in Meshy response:", initialResult)
      throw new Error('No task ID returned from conversion API')
    }
    
    // Store task information with configuration
    try {
      await supabase.from('conversion_tasks').upsert({
        task_id: taskId,
        status: 'processing',
        created_at: new Date().toISOString(),
        image_url: imageUrl || 'base64-image',
        user_id: userId,
        config: config
      }).select()
      
      console.log(`💾 [CONVERT-TO-3D] Stored enhanced task info. Task ID: ${taskId}`)
    } catch (dbError) {
      console.error("⚠️ [CONVERT-TO-3D] Failed to store task info:", dbError)
    }

    // Return the task ID to the client immediately
    console.log(`✅ [CONVERT-TO-3D] Enhanced task created successfully with ID: ${taskId}`)
    return new Response(
      JSON.stringify({ 
        success: true, 
        taskId,
        status: 'processing',
        message: 'Enhanced conversion task started with your custom settings.',
        config: config
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ [CONVERT-TO-3D] Unexpected error:', error.message, error)
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
