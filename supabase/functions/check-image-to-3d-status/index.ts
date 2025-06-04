
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 [CHECK-IMAGE-TO-3D-STATUS] Function started');

    // Enhanced authorization header validation
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Enhanced token extraction
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token || token === 'Bearer' || token === '') {
      console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] Invalid or empty JWT token');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JWT token format' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔐 [CHECK-IMAGE-TO-3D-STATUS] Validating user authentication...');

    // Enhanced user authentication with better error handling
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] Auth error:', userError);
      
      if (userError?.message?.includes('invalid claim') || userError?.message?.includes('missing sub claim')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid authentication token. Please refresh the page and try again.' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else if (userError?.message?.includes('expired')) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication token expired. Please refresh the page and try again.' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Authentication failed. Please sign in again.' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    console.log('✅ [CHECK-IMAGE-TO-3D-STATUS] User authenticated:', user.id);

    // Enhanced request body parsing
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log('📝 [CHECK-IMAGE-TO-3D-STATUS] Raw request body length:', rawBody?.length || 0);
      
      if (!rawBody || rawBody.trim() === '') {
        console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] Request body is empty');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Request body is empty. Please provide a valid JSON request.' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      try {
        requestBody = JSON.parse(rawBody);
        console.log('📊 [CHECK-IMAGE-TO-3D-STATUS] Parsed request body successfully');
      } catch (jsonError) {
        console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] JSON parsing failed:', jsonError);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid JSON format in request body. Please check your request data.' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
    } catch (bodyError) {
      console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] Error reading request body:', bodyError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to read request body. Please try again.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate task ID
    const { taskId } = requestBody;
    if (!taskId || typeof taskId !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Task ID is required and must be a string' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔍 [CHECK-IMAGE-TO-3D-STATUS] Checking status for task:', taskId);

    // Get Meshy API key
    const meshyApiKey = Deno.env.get('MESHY_API_KEY');
    if (!meshyApiKey) {
      console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] Meshy API key not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Service temporarily unavailable. Please try again later.' 
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check status with Meshy API using the v1 endpoint for image-to-3d
    let meshyResponse;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      meshyResponse = await fetch(`https://api.meshy.ai/v1/image-to-3d/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${meshyApiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
    } catch (fetchError) {
      console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] Network error calling Meshy API:', fetchError);
      
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
        );
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
      );
    }

    console.log('📊 [CHECK-IMAGE-TO-3D-STATUS] Meshy API response status:', meshyResponse.status);

    if (!meshyResponse.ok) {
      const errorText = await meshyResponse.text();
      console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] Meshy API error:', errorText);
      
      if (meshyResponse.status === 404) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Task not found. It may have expired or been removed.' 
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to check generation status. Please try again later.' 
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const meshyData = await meshyResponse.json();
    console.log('📊 [CHECK-IMAGE-TO-3D-STATUS] Meshy API response:', meshyData);

    // Handle completed status and download models
    if (meshyData.status === 'SUCCEEDED' && meshyData.model_url) {
      console.log('🔄 [CHECK-IMAGE-TO-3D-STATUS] Model completed, starting download process...');

      try {
        // Download and save the model
        console.log('🔄 [DOWNLOAD] Starting model download for task:', taskId);
        
        const modelResponse = await fetch(meshyData.model_url);
        if (!modelResponse.ok) {
          throw new Error(`Failed to download model: ${modelResponse.status}`);
        }
        
        const modelBlob = await modelResponse.arrayBuffer();
        console.log('✅ [DOWNLOAD] Model downloaded, size:', modelBlob.byteLength);
        
        // Save model to storage
        const modelFileName = `${taskId}.glb`;
        const modelPath = `${user.id}/models/${modelFileName}`;
        
        const { data: modelUploadData, error: modelUploadError } = await supabase.storage
          .from('figurine-models')
          .upload(modelPath, modelBlob, {
            contentType: 'model/gltf-binary',
            upsert: true
          });

        if (modelUploadError) {
          throw new Error(`Failed to save model: ${modelUploadError.message}`);
        }

        const { data: modelUrlData } = supabase.storage
          .from('figurine-models')
          .getPublicUrl(modelPath);

        console.log('✅ [DOWNLOAD] Model saved to storage:', modelUrlData.publicUrl);

        // Download and save thumbnail if available
        let savedThumbnailUrl = '';
        if (meshyData.thumbnail_url) {
          console.log('🔄 [DOWNLOAD] Starting thumbnail download for task:', taskId);
          
          try {
            const thumbResponse = await fetch(meshyData.thumbnail_url);
            if (thumbResponse.ok) {
              const thumbBlob = await thumbResponse.arrayBuffer();
              console.log('✅ [DOWNLOAD] Thumbnail downloaded, size:', thumbBlob.byteLength);
              
              const thumbFileName = `${taskId}_thumb.png`;
              const thumbPath = `${user.id}/thumbnails/${thumbFileName}`;
              
              const { error: thumbUploadError } = await supabase.storage
                .from('figurine-images')
                .upload(thumbPath, thumbBlob, {
                  contentType: 'image/png',
                  upsert: true
                });

              if (!thumbUploadError) {
                const { data: thumbUrlData } = supabase.storage
                  .from('figurine-images')
                  .getPublicUrl(thumbPath);
                savedThumbnailUrl = thumbUrlData.publicUrl;
                console.log('✅ [DOWNLOAD] Thumbnail saved to storage:', savedThumbnailUrl);
              }
            }
          } catch (thumbError) {
            console.error('⚠️ [DOWNLOAD] Thumbnail download failed:', thumbError);
          }
        }

        // Update conversion task status if it exists
        try {
          await supabase
            .from('conversion_tasks')
            .update({
              status: 'SUCCEEDED',
              model_url: modelUrlData.publicUrl,
              thumbnail_url: savedThumbnailUrl,
              local_model_url: modelUrlData.publicUrl,
              local_thumbnail_url: savedThumbnailUrl,
              download_status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('task_id', taskId);
        } catch (dbError) {
          console.error('⚠️ [CHECK-IMAGE-TO-3D-STATUS] Failed to update conversion task:', dbError);
        }

        console.log('✅ [CHECK-IMAGE-TO-3D-STATUS] Model and thumbnail saved successfully');

        const response = {
          success: true,
          status: 'SUCCEEDED',
          progress: 100,
          modelUrl: modelUrlData.publicUrl,
          thumbnailUrl: savedThumbnailUrl,
          taskId: taskId,
          downloadStatus: 'completed'
        };

        console.log('✅ [CHECK-IMAGE-TO-3D-STATUS] Returning response:', response);
        return new Response(
          JSON.stringify(response),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (downloadError) {
        console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] Download/save failed:', downloadError);
        
        return new Response(
          JSON.stringify({
            success: true,
            status: 'SUCCEEDED',
            progress: 100,
            modelUrl: meshyData.model_url,
            thumbnailUrl: meshyData.thumbnail_url || '',
            taskId: taskId,
            downloadStatus: 'failed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Return current status for non-completed tasks
    const response = {
      success: true,
      status: meshyData.status,
      progress: meshyData.progress || 0,
      modelUrl: meshyData.model_url || null,
      thumbnailUrl: meshyData.thumbnail_url || null,
      taskId: taskId,
      downloadStatus: 'pending'
    };

    console.log('✅ [CHECK-IMAGE-TO-3D-STATUS] Returning response:', response);
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [CHECK-IMAGE-TO-3D-STATUS] Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
