
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function downloadAndSaveModel(
  modelUrl: string,
  taskId: string,
  userId: string,
  supabase: any
): Promise<string | null> {
  try {
    console.log('🔄 [DOWNLOAD] Starting model download for task:', taskId);
    
    // Download the model file
    const response = await fetch(modelUrl);
    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.status}`);
    }
    
    const modelBlob = await response.blob();
    console.log('✅ [DOWNLOAD] Model downloaded, size:', modelBlob.size);
    
    // Generate file path in user's folder
    const fileName = `${taskId}.glb`;
    const filePath = `${userId}/models/${fileName}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('figurine-models')
      .upload(filePath, modelBlob, {
        contentType: 'model/gltf-binary',
        upsert: true
      });
      
    if (error) {
      console.error('❌ [DOWNLOAD] Storage upload error:', error);
      throw error;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('figurine-models')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ [DOWNLOAD] Model saved to storage:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ [DOWNLOAD] Error downloading/saving model:', error);
    throw error;
  }
}

async function downloadAndSaveThumbnail(
  thumbnailUrl: string,
  taskId: string,
  userId: string,
  supabase: any
): Promise<string | null> {
  try {
    console.log('🔄 [DOWNLOAD] Starting thumbnail download for task:', taskId);
    
    // Download the thumbnail file
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error(`Failed to download thumbnail: ${response.status}`);
    }
    
    const thumbnailBlob = await response.blob();
    console.log('✅ [DOWNLOAD] Thumbnail downloaded, size:', thumbnailBlob.size);
    
    // Generate file path in user's folder
    const fileName = `${taskId}_thumb.png`;
    const filePath = `${userId}/thumbnails/${fileName}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('figurine-models')
      .upload(filePath, thumbnailBlob, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (error) {
      console.error('❌ [DOWNLOAD] Thumbnail storage upload error:', error);
      throw error;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('figurine-models')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ [DOWNLOAD] Thumbnail saved to storage:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ [DOWNLOAD] Error downloading/saving thumbnail:', error);
    return null; // Don't fail the whole process for thumbnail
  }
}

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

    // Prepare update data
    const updateData: any = {
      status: meshyData.status,
      model_url: meshyData.model_urls?.glb || meshyData.model_url,
      thumbnail_url: meshyData.thumbnail_url,
      updated_at: new Date().toISOString()
    };

    let localModelUrl = null;
    let localThumbnailUrl = null;

    // If model is completed and we have URLs, download and save them
    if (meshyData.status === 'SUCCEEDED' && meshyData.model_urls?.glb) {
      console.log('🔄 [CHECK-TEXT-TO-3D-STATUS] Model completed, starting download process...');
      
      try {
        // Update download status to 'downloading'
        await supabase
          .from('conversion_tasks')
          .update({ download_status: 'downloading' })
          .eq('task_id', taskId)
          .eq('user_id', user.id);

        // Download and save model
        localModelUrl = await downloadAndSaveModel(
          meshyData.model_urls.glb,
          taskId,
          user.id,
          supabase
        );

        // Download and save thumbnail if available
        if (meshyData.thumbnail_url) {
          localThumbnailUrl = await downloadAndSaveThumbnail(
            meshyData.thumbnail_url,
            taskId,
            user.id,
            supabase
          );
        }

        // Update with local URLs
        updateData.local_model_url = localModelUrl;
        updateData.local_thumbnail_url = localThumbnailUrl;
        updateData.download_status = 'completed';
        
        console.log('✅ [CHECK-TEXT-TO-3D-STATUS] Model and thumbnail saved successfully');
      } catch (downloadError) {
        console.error('❌ [CHECK-TEXT-TO-3D-STATUS] Download failed:', downloadError);
        updateData.download_status = 'failed';
        updateData.download_error = downloadError.message;
      }
    }

    // Update task status in database
    const { error: updateError } = await supabase
      .from('conversion_tasks')
      .update(updateData)
      .eq('task_id', taskId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ [CHECK-TEXT-TO-3D-STATUS] Error updating task:', updateError);
      // Don't throw here, still return status to user
    }

    // Return status information with preference for local URLs
    const response = {
      success: true,
      status: meshyData.status,
      progress: meshyData.progress || 0,
      modelUrl: localModelUrl || meshyData.model_urls?.glb || meshyData.model_url || null,
      thumbnailUrl: localThumbnailUrl || meshyData.thumbnail_url || null,
      taskId: taskId,
      downloadStatus: updateData.download_status || 'pending'
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
