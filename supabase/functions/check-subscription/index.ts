
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
    console.log("[CHECK-SUBSCRIPTION] Function started")

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const userId = userData.user.id
    console.log(`[CHECK-SUBSCRIPTION] User authenticated - ${JSON.stringify({ userId })}`)

    // Reset counters if needed
    await supabase.rpc('reset_daily_usage')
    await supabase.rpc('reset_monthly_usage')

    // Get subscription data
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    // If no subscription, create free plan
    if (subError && subError.code === 'PGRST116') {
      const { data: newSub, error: createError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: 'free',
          status: 'active',
          generation_count_today: 0,
          converted_3d_this_month: 0,
          generation_count_this_month: 0
        })
        .select()
        .single()

      if (createError) {
        console.error("[CHECK-SUBSCRIPTION] Error creating subscription:", createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create subscription' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const responseData = {
        plan: 'free',
        commercial_license: false,
        additional_conversions: 0,
        is_active: true,
        valid_until: null,
        usage: {
          image_generations_used: 0,
          model_conversions_used: 0,
          generation_count_today: 0,
          converted_3d_this_month: 0,
          generation_count_this_month: 0
        },
        limits: {
          image_generations_limit: 3,
          model_conversions_limit: 1
        },
        status: 'active',
        generation_count_today: 0,
        converted_3d_this_month: 0,
        generation_count_this_month: 0,
        last_generated_at: null
      }

      console.log(`[CHECK-SUBSCRIPTION] Returning new subscription data - ${JSON.stringify({
        plan: responseData.plan,
        isActive: responseData.is_active,
        status: responseData.status,
        generationCountToday: responseData.generation_count_today,
        converted3dThisMonth: responseData.converted_3d_this_month,
        generationCountThisMonth: responseData.generation_count_this_month
      })}`)

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (subError) {
      console.error("[CHECK-SUBSCRIPTION] Error fetching subscription:", subError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscription' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get plan limits
    const { data: planLimits } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('plan_type', subscription.plan_type)
      .single()

    const limits = planLimits || {
      image_generations_limit: 3,
      model_conversions_limit: 1,
      is_unlimited: false
    }

    const responseData = {
      plan: subscription.plan_type,
      commercial_license: subscription.commercial_license || false,
      additional_conversions: subscription.additional_conversions || 0,
      is_active: subscription.status === 'active',
      valid_until: subscription.valid_until,
      usage: {
        image_generations_used: subscription.generation_count_today || 0,
        model_conversions_used: subscription.converted_3d_this_month || 0,
        generation_count_today: subscription.generation_count_today || 0,
        converted_3d_this_month: subscription.converted_3d_this_month || 0,
        generation_count_this_month: subscription.generation_count_this_month || 0
      },
      limits: {
        image_generations_limit: limits.image_generations_limit,
        model_conversions_limit: limits.model_conversions_limit
      },
      status: subscription.status,
      generation_count_today: subscription.generation_count_today || 0,
      converted_3d_this_month: subscription.converted_3d_this_month || 0,
      generation_count_this_month: subscription.generation_count_this_month || 0,
      last_generated_at: subscription.last_generated_at
    }

    console.log(`[CHECK-SUBSCRIPTION] Returning enhanced subscription data - ${JSON.stringify({
      plan: responseData.plan,
      isActive: responseData.is_active,
      status: responseData.status,
      generationCountToday: responseData.generation_count_today,
      converted3dThisMonth: responseData.converted_3d_this_month,
      generationCountThisMonth: responseData.generation_count_this_month
    })}`)

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[CHECK-SUBSCRIPTION] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
