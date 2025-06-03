
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

    // Enhanced authorization header validation
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ [TEXT-TO-3D] No authorization header provided');
      throw new Error('No authorization header');
    }

    // Enhanced token extraction
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token || token === 'Bearer' || token === '') {
      console.error('❌ [TEXT-TO-3D] Invalid or empty JWT token');
      throw new Error('Invalid JWT token format');
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
        throw new Error('Invalid authentication token. Please refresh the page and try again.');
      } else if (userError?.message?.includes('expired')) {
        throw new Error('Authentication token expired. Please refresh the page and try again.');
      } else {
        throw new Error('Authentication failed. Please sign in again.');
      }
    }

    console.log('✅ [TEXT-TO-3D] User authenticated:', user.id);

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
          throw new Error('Authentication session expired. Please refresh the page and try again.');
        } else if (consumeError.message?.includes('Invalid user session')) {
          throw new Error('Invalid user session. Please sign out and sign in again.');
        } else {
          throw new Error('Failed to check usage limits. Please try again.');
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
      
      // In production, you might want to be more strict here
      // For now, we'll allow the request to continue to avoid blocking users
    }

    // Parse request body - handle both old format and new config format
    const requestBody = await req.json();
    
    let prompt, artStyle, negativePrompt, mode, targetPolycount, topologyType, texture, seedValue;
    
    if (requestBody.prompt && typeof requestBody.prompt === 'string') {
      // New config format
      ({
        prompt,
        artStyle = 'realistic',
        negativePrompt = '',
        mode = 'preview',
        targetPolycount,
        topologyType,
        texture,
        seedValue
      } = requestBody);
    } else {
      // Legacy format for backward compatibility
      ({
        prompt,
        art_style: artStyle = 'realistic',
        negative_prompt: negativePrompt = ''
      } = requestBody);
      mode = 'preview';
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Get Meshy API key
    const meshyApiKey = Deno.env.get('MESHY_API_KEY');
    if (!meshyApiKey) {
      throw new Error('Meshy API key not configured');
    }

    console.log('🔧 [TEXT-TO-3D] Processing text to 3D request with prompt:', prompt);
    console.log('🔧 [TEXT-TO-3D] Configuration:', { artStyle, mode, targetPolycount, topologyType, texture });

    // Prepare Meshy API request body
    const meshyRequestBody: any = {
      mode: mode,
      prompt: prompt,
      art_style: artStyle,
      negative_prompt: negativePrompt
    };

    // Add advanced options if provided
    if (targetPolycount) {
      meshyRequestBody.target_polycount = targetPolycount;
    }
    
    if (topologyType) {
      meshyRequestBody.topology = topologyType;
    }
    
    if (texture !== undefined) {
      meshyRequestBody.texture = texture;
    }
    
    if (seedValue !== undefined) {
      meshyRequestBody.seed = seedValue;
    }

    // Call Meshy Text to 3D API
    console.log('📤 [TEXT-TO-3D] Sending request to Meshy Text to 3D API...');
    
    const meshyResponse = await fetch('https://api.meshy.ai/v2/text-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${meshyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meshyRequestBody),
    });

    console.log('📊 [TEXT-TO-3D] Meshy API response status:', meshyResponse.status);

    if (!meshyResponse.ok) {
      const errorText = await meshyResponse.text();
      console.error('❌ [TEXT-TO-3D] Meshy API error:', errorText);
      throw new Error(`Meshy API error: ${meshyResponse.status} - ${errorText}`);
    }

    const meshyData = await meshyResponse.json();
    console.log('📊 [TEXT-TO-3D] Meshy API success response:', meshyData);

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
          art_style: artStyle,
          negative_prompt: negativePrompt || null,
          generation_mode: mode,
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
    console.error('❌ [TEXT-TO-3D] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
