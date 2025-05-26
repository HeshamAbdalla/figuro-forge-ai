
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

    // Check and consume model conversion usage with enhanced logging
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

    console.log("🔍 [CONVERT-TO-3D] Usage check result:", { canConsume, userId })

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

    const { imageUrl, imageBase64 } = requestBody

    if (!imageUrl && !imageBase64) {
      console.error("❌ [CONVERT-TO-3D] Missing image data in request")
      return new Response(
        JSON.stringify({ error: 'Image URL or Base64 data is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Log which format we're using
    if (imageBase64) {
      console.log("🖼️ [CONVERT-TO-3D] Processing base64 image data for 3D conversion")
    } else {
      console.log(`🖼️ [CONVERT-TO-3D] Processing image URL for 3D conversion: ${imageUrl}`)
    }

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
    
    console.log("🔄 [CONVERT-TO-3D] Creating 3D conversion request with webhook callback...")
    console.log(`📞 [CONVERT-TO-3D] Webhook callback URL: ${callbackUrl}`)
    
    // Step 1: Prepare the request payload with webhook callback
    const requestPayload: any = {
      outputFormat: 'glb',
      enable_pbr: true,
      should_remesh: true,
      should_texture: true,
      background: 'remove',
      webhook_url: callbackUrl  // Add webhook URL for callbacks
    }
    
    // Add either the URL or the base64 data
    if (imageBase64) {
      // Handle base64 data URI
      requestPayload.image_url = imageBase64.startsWith('data:') 
        ? imageBase64 
        : `data:image/png;base64,${imageBase64}`
    } else {
      requestPayload.image_url = imageUrl
    }

    console.log("📤 [CONVERT-TO-3D] Sending request to Meshy API...")

    // Using the v1 OpenAPI endpoint for conversion with webhook
    const response = await fetch('https://api.meshy.ai/openapi/v1/image-to-3d', {
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
      
      // Provide more specific error messages based on status code
      let userMessage = 'Failed to convert image to 3D model'
      if (response.status === 429) {
        userMessage = 'Meshy API rate limit exceeded. Please try again in a few minutes.'
      } else if (response.status === 400) {
        userMessage = 'Invalid image format or size. Please try a different image.'
      } else if (response.status === 401) {
        userMessage = 'Meshy API authentication failed. Please contact support.'
      }
      
      throw new Error(`${userMessage}: ${errorText}`)
    }

    // Parse the response from Meshy API
    const initialResult = await response.json()
    console.log("📊 [CONVERT-TO-3D] Meshy API response:", JSON.stringify(initialResult))
    
    // Extract the task ID from the response
    const taskId = initialResult.result || initialResult.id
    
    if (!taskId) {
      console.error("❌ [CONVERT-TO-3D] No task ID found in Meshy response:", initialResult)
      throw new Error('No task ID returned from conversion API')
    }
    
    // Store task information - this is useful for tracking webhooks
    try {
      await supabase.from('conversion_tasks').upsert({
        task_id: taskId,
        status: 'processing',
        created_at: new Date().toISOString(),
        image_url: imageUrl || 'base64-image',
        user_id: userId
      }).select()
      
      console.log(`💾 [CONVERT-TO-3D] Stored task info in database. Task ID: ${taskId}`)
    } catch (dbError) {
      // Non-critical error - log it but continue
      console.error("⚠️ [CONVERT-TO-3D] Failed to store task info in database:", dbError)
      // Note: Not stopping execution, as this is not critical for the conversion process
    }

    // Return the task ID to the client immediately
    console.log(`✅ [CONVERT-TO-3D] Task created successfully with ID: ${taskId}`)
    return new Response(
      JSON.stringify({ 
        success: true, 
        taskId,
        status: 'processing',
        message: 'Conversion task started. Server-sent events will provide updates.'
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
