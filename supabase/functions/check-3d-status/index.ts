
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Extract taskId from URL parameters for GET requests
    const url = new URL(req.url)
    let taskId = url.searchParams.get('taskId')
    
    // If no taskId in URL params, try to get it from request body (for backward compatibility)
    if (!taskId && req.method === 'POST') {
      try {
        const body = await req.json()
        taskId = body.taskId
      } catch (e) {
        // Ignore JSON parsing errors for GET requests
      }
    }
    
    if (!taskId) {
      throw new Error('taskId parameter is required')
    }
    
    console.log('Checking status for task:', taskId)

    const meshyApiKey = Deno.env.get('MESHY_API_KEY')
    if (!meshyApiKey) {
      throw new Error('MESHY_API_KEY not configured')
    }

    const response = await fetch(`https://api.meshy.ai/v2/image-to-3d/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${meshyApiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`Meshy API error: ${response.status}`)
    }

    const taskData = await response.json()
    console.log('Task status response:', JSON.stringify(taskData))

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (taskData.status === 'SUCCEEDED' && taskData.model_urls) {
      // Prefer GLB format, fallback to OBJ if GLB not available
      let modelUrl = taskData.model_urls.glb || taskData.model_urls.obj
      
      if (!modelUrl) {
        console.error('No supported model format found in response:', taskData.model_urls)
        throw new Error('No supported model format available')
      }

      console.log('Task completed with model URL:', modelUrl)
      console.log('Available model formats:', Object.keys(taskData.model_urls))
      
      // Also capture thumbnail URL if available
      const thumbnailUrl = taskData.thumbnail_url || null
      console.log('Task completed with thumbnail URL:', thumbnailUrl)
      
      return new Response(JSON.stringify({
        status: 'completed',
        modelUrl: modelUrl,
        thumbnailUrl: thumbnailUrl,
        progress: 100
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else if (taskData.status === 'FAILED') {
      const errorMessage = taskData.task_error?.message || 'Unknown error occurred'
      console.error('Task failed with error:', errorMessage)
      
      return new Response(JSON.stringify({
        status: 'failed',
        error: errorMessage,
        progress: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({
        status: 'processing',
        progress: taskData.progress || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error checking 3D status:', error)
    return new Response(JSON.stringify({
      status: 'failed',
      error: error.message || 'Unknown error occurred',
      progress: 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
