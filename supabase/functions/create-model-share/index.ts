
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`🔗 create-model-share function called - Method: ${req.method}`)
  console.log('📍 Request URL:', req.url)
  console.log('🎫 Auth header present:', req.headers.get('Authorization') ? 'YES' : 'NO')
  console.log('📦 Content-Type:', req.headers.get('Content-Type'))
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🏗️ Creating Supabase client...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('🔐 Auth header:', authHeader ? `Bearer ${authHeader.substring(7, 27)}...` : 'MISSING')
    
    if (!authHeader) {
      console.error('❌ No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('👤 Validating user token...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message || 'No user')
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Parse request body with better error handling
    console.log('📋 Parsing request body...')
    let requestBody;
    
    try {
      const bodyText = await req.text();
      console.log('📝 Raw body text:', bodyText.length > 0 ? `${bodyText.substring(0, 100)}...` : 'EMPTY');
      
      if (!bodyText || bodyText.trim() === '') {
        console.error('❌ Empty request body received')
        return new Response(
          JSON.stringify({ error: 'Request body is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      requestBody = JSON.parse(bodyText);
      console.log('✅ Successfully parsed request body');
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const { figurineId, password, expiresHours, maxViews } = requestBody;
    
    console.log('📝 Request data:', {
      figurineId,
      hasPassword: !!password,
      expiresHours,
      maxViews
    })
    
    if (!figurineId) {
      console.error('❌ Missing figurine ID')
      return new Response(
        JSON.stringify({ error: 'Figurine ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`🔗 Creating share for figurine: ${figurineId}`)

    // Create share using service role client for function access
    console.log('🔧 Creating service role client...')
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🎯 Calling create_shared_model RPC function...')
    const { data: shareToken, error } = await serviceSupabase.rpc('create_shared_model', {
      p_figurine_id: figurineId,
      p_password: password || null,
      p_expires_hours: expiresHours || null,
      p_max_views: maxViews || null
    })

    if (error) {
      console.error('❌ Error creating share:', error)
      console.error('💾 Error details:', JSON.stringify(error, null, 2))
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to create share' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Share created successfully:', shareToken)
    
    return new Response(
      JSON.stringify({ shareToken }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Edge function error:', error)
    console.error('💀 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
