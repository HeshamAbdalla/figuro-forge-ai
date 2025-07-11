
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
    console.log('🔄 [TEXT-TO-3D] Function started');
    console.log('📋 [TEXT-TO-3D] Request method:', req.method);
    console.log('📋 [TEXT-TO-3D] Request headers:', Object.fromEntries(req.headers.entries()));

    // Enhanced authorization header validation
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ [TEXT-TO-3D] No authorization header provided');
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
      console.error('❌ [TEXT-TO-3D] Invalid or empty JWT token');
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

    console.log('🔐 [TEXT-TO-3D] Validating user authentication...');

    // Enhanced user authentication with better error handling
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ [TEXT-TO-3D] Auth error:', userError);
      
      // Provide more specific error messages
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

    console.log('✅ [TEXT-TO-3D] User authenticated:', user.id);

    // Enhanced request body parsing with comprehensive error handling
    let requestBody;
    try {
      // Check content-type header
      const contentType = req.headers.get('content-type');
      console.log('📋 [TEXT-TO-3D] Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ [TEXT-TO-3D] Missing or invalid Content-Type header');
      }

      // Get raw body and validate
      const rawBody = await req.text();
      console.log('📝 [TEXT-TO-3D] Raw request body length:', rawBody?.length || 0);
      console.log('📝 [TEXT-TO-3D] Raw request body preview:', rawBody?.substring(0, 500) || 'empty');
      
      if (!rawBody || rawBody.trim() === '') {
        console.error('❌ [TEXT-TO-3D] Request body is empty');
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
      
      // Parse JSON with detailed error handling
      try {
        requestBody = JSON.parse(rawBody);
        console.log('📊 [TEXT-TO-3D] Parsed request body successfully');
        console.log('📊 [TEXT-TO-3D] Request body keys:', Object.keys(requestBody || {}));
        console.log('📊 [TEXT-TO-3D] Request body:', JSON.stringify(requestBody));
      } catch (jsonError) {
        console.error('❌ [TEXT-TO-3D] JSON parsing failed:', jsonError);
        console.error('❌ [TEXT-TO-3D] Invalid JSON content:', rawBody);
        
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
      console.error('❌ [TEXT-TO-3D] Error reading request body:', bodyError);
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

    // Enhanced usage consumption with better error handling
    console.log('🔍 [TEXT-TO-3D] Checking user limits using enhanced consumption...');
    
    try {
      const { data: consumeData, error: consumeError } = await supabase.functions.invoke('enhanced-consume-usage', {
        body: {
          feature_type: 'model_conversion',
          amount: 1
        },
        headers: {
          'Authorization': authHeader
        }
      });

      if (consumeError) {
        console.error('❌ [TEXT-TO-3D] Error consuming usage:', consumeError);
        
        // Handle specific consumption errors
        if (consumeError.message?.includes('JWT token')) {
          return new Response(
            JSON.stringify({ success: false, error: 'Authentication session expired. Please refresh the page and try again.' }),
            { 
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } else if (consumeError.message?.includes('Invalid user session')) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid user session. Please sign out and sign in again.' }),
            { 
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } else {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to check usage limits. Please try again.' }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }

      if (!consumeData?.success) {
        console.log('❌ [TEXT-TO-3D] Usage limit reached:', consumeData?.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: consumeData?.error || 'Usage limit reached. Please upgrade your plan to continue creating 3D models.' 
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('✅ [TEXT-TO-3D] Usage consumed successfully');

    } catch (invokeError) {
      console.error('❌ [TEXT-TO-3D] Function invoke error:', invokeError);
      
      // Fallback error handling - allow the request to proceed for now but log the issue
      console.log('⚠️ [TEXT-TO-3D] Proceeding without usage check due to authentication issues');
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
      );
    }

    // Validate required fields
    if (!requestBody.prompt || typeof requestBody.prompt !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Prompt is required and must be a string' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract and validate parameters with defaults
    const {
      prompt,
      artStyle = 'realistic',
      negativePrompt = '',
      mode = 'preview',
      targetPolycount,
      topologyType,
      texture,
      seedValue
    } = requestBody;

    // Validate prompt length
    if (prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Prompt cannot be empty' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (prompt.length > 1000) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Prompt is too long. Maximum 1000 characters allowed.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate art style
    const validArtStyles = ['realistic', 'cartoon', 'low-poly', 'sculpture', 'pbr'];
    const finalArtStyle = validArtStyles.includes(artStyle) ? artStyle : 'realistic';
    if (artStyle !== finalArtStyle) {
      console.log('⚠️ [TEXT-TO-3D] Invalid art style, using default: realistic');
    }

    // Validate mode
    const validModes = ['preview', 'refine'];
    const finalMode = validModes.includes(mode) ? mode : 'preview';
    if (mode !== finalMode) {
      console.log('⚠️ [TEXT-TO-3D] Invalid mode, using default: preview');
    }

    // Get Meshy API key
    const meshyApiKey = Deno.env.get('MESHY_API_KEY');
    if (!meshyApiKey) {
      console.error('❌ [TEXT-TO-3D] Meshy API key not configured');
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

    console.log('🔧 [TEXT-TO-3D] Processing text to 3D request with prompt:', prompt.substring(0, 50) + '...');
    console.log('🔧 [TEXT-TO-3D] Configuration:', { artStyle: finalArtStyle, mode: finalMode, targetPolycount, topologyType, texture });

    // Prepare Meshy API request body with validated parameters
    const meshyRequestBody: any = {
      mode: finalMode,
      prompt: prompt.trim(),
      art_style: finalArtStyle,
      negative_prompt: negativePrompt || ''
    };

    // Add advanced options if provided and valid
    if (targetPolycount && typeof targetPolycount === 'number' && targetPolycount > 0) {
      meshyRequestBody.target_polycount = targetPolycount;
    }
    
    if (topologyType && typeof topologyType === 'string') {
      meshyRequestBody.topology = topologyType;
    }
    
    if (texture !== undefined && typeof texture === 'boolean') {
      meshyRequestBody.texture = texture;
    }
    
    if (seedValue !== undefined && typeof seedValue === 'number') {
      meshyRequestBody.seed = seedValue;
    }

    console.log('📤 [TEXT-TO-3D] Meshy request body:', meshyRequestBody);

    // Call Meshy Text to 3D API with timeout and retry logic
    console.log('📤 [TEXT-TO-3D] Sending request to Meshy Text to 3D API...');
    
    let meshyResponse;
    try {
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      meshyResponse = await fetch('https://api.meshy.ai/v2/text-to-3d', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${meshyApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meshyRequestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
    } catch (fetchError) {
      console.error('❌ [TEXT-TO-3D] Network error calling Meshy API:', fetchError);
      
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

    console.log('📊 [TEXT-TO-3D] Meshy API response status:', meshyResponse.status);

    if (!meshyResponse.ok) {
      const errorText = await meshyResponse.text();
      console.error('❌ [TEXT-TO-3D] Meshy API error:', errorText);
      
      // Handle specific Meshy API errors
      if (meshyResponse.status === 400) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid request parameters. Please check your prompt and settings.' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
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
        );
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
        );
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
      );
    }

    const meshyData = await meshyResponse.json();
    console.log('📊 [TEXT-TO-3D] Meshy API success response:', meshyData);

    // Validate Meshy response
    if (!meshyData.result) {
      console.error('❌ [TEXT-TO-3D] Invalid Meshy response - no task ID');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from 3D generation service. Please try again.' 
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Store task info in conversion_tasks table with proper error handling
    const taskId = meshyData.result;
    
    try {
      const { error: storeError } = await supabase
        .from('conversion_tasks')
        .insert({
          task_id: taskId,
          user_id: user.id,
          status: 'processing',
          task_type: 'text_to_3d',
          prompt: prompt,
          art_style: finalArtStyle,
          negative_prompt: negativePrompt || null,
          generation_mode: finalMode,
          target_polycount: targetPolycount,
          topology_type: topologyType,
          generate_texture: texture,
          seed_value: seedValue
        });

      if (storeError) {
        console.error('❌ [TEXT-TO-3D] Error storing task:', storeError);
        // Don't throw here, as the task was created successfully in Meshy
      } else {
        console.log('💾 [TEXT-TO-3D] Stored task info. Task ID:', taskId);
      }
    } catch (dbError) {
      console.error('❌ [TEXT-TO-3D] Database error:', dbError);
      // Continue execution even if database storage fails
    }

    console.log('✅ [TEXT-TO-3D] Task created successfully with ID:', taskId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        taskId: taskId,
        status: 'processing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [TEXT-TO-3D] Unexpected error:', error);
    
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
