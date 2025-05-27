
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

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log('✅ [TEXT-TO-3D] User authenticated:', user.id);

    // Check user limits and consume usage
    console.log('🔍 [TEXT-TO-3D] Checking user limits and consuming usage...');
    
    const { data: canConsume, error: consumeError } = await supabase.rpc('consume_feature_usage', {
      feature_type: 'model_conversion',
      user_id_param: user.id,
      amount: 1
    });

    if (consumeError) {
      console.error('❌ [TEXT-TO-3D] Error consuming usage:', consumeError);
      throw new Error('Failed to consume usage');
    }

    if (!canConsume) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usage limit reached. Please upgrade your plan to continue creating 3D models.' 
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ [TEXT-TO-3D] Usage consumed successfully');

    // Parse request body
    const { prompt, art_style = 'realistic', negative_prompt = '' } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Get Meshy API key
    const meshyApiKey = Deno.env.get('MESHY_API_KEY');
    if (!meshyApiKey) {
      throw new Error('Meshy API key not configured');
    }

    console.log('🔧 [TEXT-TO-3D] Processing text to 3D request with prompt:', prompt);

    // Call Meshy Text to 3D API
    console.log('📤 [TEXT-TO-3D] Sending request to Meshy Text to 3D API...');
    
    const meshyResponse = await fetch('https://api.meshy.ai/v2/text-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${meshyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'preview',
        prompt: prompt,
        art_style: art_style,
        negative_prompt: negative_prompt
      }),
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
          art_style: art_style,
          negative_prompt: negative_prompt || null
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
