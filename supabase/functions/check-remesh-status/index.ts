
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    // Get the user from the session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId');
    
    if (!taskId) {
      return new Response(
        JSON.stringify({ error: 'Task ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get task from database
    const { data: task, error: taskError } = await supabaseClient
      .from('remesh_tasks')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: 'Task not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulate progress for demo purposes
    // In a real implementation, you would check the actual remeshing service status
    let status = task.status;
    let progress = task.progress;
    let remeshedModelUrl = task.remeshed_model_url;

    if (status === 'processing') {
      // Simulate progress
      const now = new Date();
      const created = new Date(task.created_at);
      const elapsed = (now.getTime() - created.getTime()) / 1000; // seconds

      if (elapsed < 30) {
        progress = Math.min(Math.floor((elapsed / 30) * 100), 90);
      } else if (elapsed >= 30 && elapsed < 60) {
        // Simulate completion
        status = 'completed';
        progress = 100;
        // Generate a demo URL (in real implementation, this would come from the remeshing service)
        remeshedModelUrl = `https://example.com/remeshed/${taskId}.glb`;
        
        // Update task in database
        await supabaseClient
          .from('remesh_tasks')
          .update({
            status: 'completed',
            progress: 100,
            remeshed_model_url: remeshedModelUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('task_id', taskId);
      }

      // Update progress if still processing
      if (status === 'processing' && progress !== task.progress) {
        await supabaseClient
          .from('remesh_tasks')
          .update({
            progress: progress,
            updated_at: new Date().toISOString(),
          })
          .eq('task_id', taskId);
      }
    }

    return new Response(
      JSON.stringify({
        taskId: taskId,
        status: status,
        progress: progress,
        remeshedModelUrl: remeshedModelUrl,
        originalModelUrl: task.original_model_url,
        settings: task.settings,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in check-remesh-status function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
