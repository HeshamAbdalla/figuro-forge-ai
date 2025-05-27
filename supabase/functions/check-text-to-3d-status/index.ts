
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
    console.log('🔄 [CHECK-TEXT-TO-3D-STATUS] Function started');

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

    console.log('✅ [CHECK-TEXT-TO-3D-STATUS] User authenticated:', user.id);

    // Get task ID from URL params or request body
    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId') || (await req.json()).taskId;

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    console.log('🔍 [CHECK-TEXT-TO-3D-STATUS] Checking status for task:', taskId);

    // Get Meshy API key
    const meshyApiKey = Deno.env.get('MESHY_API_KEY');
    if (!meshyApiKey) {
      throw new Error('Meshy API key not configured');
    }

    // Call Meshy API to check status
    const meshyResponse = await fetch(`https://api.meshy.ai/v2/text-to-3d/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${meshyApiKey}`,
      },
    });

    console.log('📊 [CHECK-TEXT-TO-3D-STATUS] Meshy API response status:', meshyResponse.status);

    if (!meshyResponse.ok) {
      const errorText = await meshyResponse.text();
      console.error('❌ [CHECK-TEXT-TO-3D-STATUS] Meshy API error:', errorText);
      throw new Error(`Meshy API error: ${meshyResponse.status} - ${errorText}`);
    }

    const meshyData = await meshyResponse.json();
    console.log('📊 [CHECK-TEXT-TO-3D-STATUS] Meshy API response:', meshyData);

    // Update task status in database
    const { error: updateError } = await supabase
      .from('conversion_tasks')
      .update({
        status: meshyData.status,
        model_url: meshyData.model_urls?.glb || meshyData.model_url,
        thumbnail_url: meshyData.thumbnail_url,
        updated_at: new Date().toISOString()
      })
      .eq('task_id', taskId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ [CHECK-TEXT-TO-3D-STATUS] Error updating task:', updateError);
      // Don't throw here, still return status to user
    }

    // Return status information
    const response = {
      success: true,
      status: meshyData.status,
      progress: meshyData.progress || 0,
      modelUrl: meshyData.model_urls?.glb || meshyData.model_url || null,
      thumbnailUrl: meshyData.thumbnail_url || null,
      taskId: taskId
    };

    console.log('✅ [CHECK-TEXT-TO-3D-STATUS] Returning response:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [CHECK-TEXT-TO-3D-STATUS] Error:', error);
    
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
