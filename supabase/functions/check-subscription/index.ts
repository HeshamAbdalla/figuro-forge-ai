
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const rateLimitCache = new Map<string, { lastCall: number; attempts: number }>();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });
    
    // Check rate limiting per user
    const now = Date.now();
    const userCache = rateLimitCache.get(user.id);
    
    if (userCache) {
      const timeSinceLastCall = now - userCache.lastCall;
      
      if (timeSinceLastCall < 10000) {
        logStep("Rate limited - using cached response");
        return new Response(JSON.stringify({
          plan: "free",
          commercial_license: false,
          additional_conversions: 0,
          is_active: false,
          valid_until: null,
          usage: { 
            image_generations_used: 0, 
            model_conversions_used: 0,
            generation_count_today: 0,
            converted_3d_this_month: 0
          },
          limits: { image_generations_limit: 3, model_conversions_limit: 1 },
          credits_remaining: 3,
          status: 'inactive',
          generation_count_today: 0,
          converted_3d_this_month: 0,
          last_generated_at: null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }
    }
    
    rateLimitCache.set(user.id, { lastCall: now, attempts: (userCache?.attempts || 0) + 1 });
    
    // Reset usage counters if needed
    await supabaseAdmin.rpc('reset_daily_usage');
    await supabaseAdmin.rpc('reset_monthly_usage');
    
    // Get current subscription from database with enhanced fields
    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        *,
        generation_count_today,
        converted_3d_this_month,
        last_generated_at,
        daily_reset_date,
        monthly_reset_date
      `)
      .eq("user_id", user.id)
      .single();
    
    // Get usage data
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from("user_usage")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    // Get plan limits
    const { data: allPlans, error: plansError } = await supabaseAdmin
      .from("plan_limits")
      .select("*");
    
    if (plansError) {
      throw new Error(`Failed to fetch plan limits: ${plansError.message}`);
    }
    
    // If no subscription found, create/update free plan record
    if (!subscriptionData || subscriptionError) {
      logStep("No subscription found, creating/updating free plan");
      
      const { data: newSub, error: upsertError } = await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: "free",
          status: "active",
          credits_remaining: 3,
          generation_count_today: 0,
          converted_3d_this_month: 0,
          daily_reset_date: new Date().toISOString().split('T')[0],
          monthly_reset_date: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (upsertError) {
        logStep("Error creating free subscription", { error: upsertError.message });
      }
      
      // Create usage record if it doesn't exist
      if (!usageData || usageError) {
        await supabaseAdmin
          .from("user_usage")
          .upsert({
            user_id: user.id,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
      
      const freePlan = allPlans.find(plan => plan.plan_type === 'free') || {
        image_generations_limit: 3,
        model_conversions_limit: 1
      };
      
      return new Response(JSON.stringify({
        plan: "free",
        commercial_license: false,
        additional_conversions: 0,
        is_active: true,
        valid_until: null,
        usage: {
          image_generations_used: usageData?.image_generations_used || 0,
          model_conversions_used: usageData?.model_conversions_used || 0,
          generation_count_today: 0,
          converted_3d_this_month: 0
        },
        limits: {
          image_generations_limit: freePlan.image_generations_limit,
          model_conversions_limit: freePlan.model_conversions_limit
        },
        credits_remaining: 3,
        status: 'active',
        generation_count_today: 0,
        converted_3d_this_month: 0,
        last_generated_at: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }
    
    // For subscribed users, verify with Stripe if needed
    let currentPlan = subscriptionData.plan_type;
    let isActive = subscriptionData.status === 'active';
    let validUntil = subscriptionData.valid_until;
    let creditsRemaining = subscriptionData.credits_remaining || 0;
    let status = subscriptionData.status || 'inactive';
    
    // Check if subscription has expired
    if (validUntil && new Date(validUntil) <= new Date()) {
      isActive = false;
      status = 'expired';
    }
    
    // Stripe verification logic (existing code)
    if (subscriptionData.stripe_subscription_id && isActive) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
        
        try {
          const lastUpdate = new Date(subscriptionData.updated_at || "").getTime();
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          
          if (lastUpdate < oneHourAgo) {
            logStep("Checking Stripe subscription");
            const subscription = await stripe.subscriptions.retrieve(subscriptionData.stripe_subscription_id);
            
            isActive = subscription.status === 'active' || subscription.status === 'trialing';
            validUntil = new Date(subscription.current_period_end * 1000).toISOString();
            
            if (subscription.status === 'active' || subscription.status === 'trialing') {
              status = 'active';
            } else if (subscription.status === 'past_due') {
              status = 'past_due';
              isActive = false;
            } else if (subscription.status === 'canceled') {
              status = 'canceled';
              isActive = false;
            } else {
              status = 'inactive';
              isActive = false;
            }
            
            await supabaseAdmin
              .from("subscriptions")
              .update({
                valid_until: isActive ? validUntil : null,
                expires_at: isActive ? validUntil : null,
                status: status,
                updated_at: new Date().toISOString()
              })
              .eq("user_id", user.id);
          }
          
          // If subscription is no longer active, downgrade to free plan
          if (!isActive && currentPlan !== 'free') {
            currentPlan = 'free';
            creditsRemaining = 3;
            await supabaseAdmin
              .from("subscriptions")
              .update({
                plan_type: 'free',
                commercial_license: false,
                additional_conversions: 0,
                credits_remaining: 3,
                updated_at: new Date().toISOString()
              })
              .eq("user_id", user.id);
          }
        } catch (stripeError) {
          if (!stripeError.message?.includes('rate limit')) {
            logStep("Error retrieving Stripe subscription", { 
              error: stripeError instanceof Error ? stripeError.message : String(stripeError)
            });
          }
        }
      }
    }
    
    // Create usage record if it doesn't exist
    if (!usageData || usageError) {
      await supabaseAdmin
        .from("user_usage")
        .upsert({
          user_id: user.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }
    
    // Get plan limits
    const currentPlanLimits = allPlans.find(plan => plan.plan_type === currentPlan) || {
      image_generations_limit: 3,
      model_conversions_limit: 1
    };
    
    logStep("Returning enhanced subscription data", { 
      plan: currentPlan,
      isActive,
      status,
      creditsRemaining,
      generationCountToday: subscriptionData.generation_count_today || 0,
      converted3dThisMonth: subscriptionData.converted_3d_this_month || 0
    });
    
    // Return enhanced subscription details
    return new Response(JSON.stringify({
      plan: currentPlan,
      commercial_license: subscriptionData.commercial_license,
      additional_conversions: subscriptionData.additional_conversions,
      is_active: isActive,
      valid_until: validUntil,
      usage: {
        image_generations_used: usageData?.image_generations_used || 0,
        model_conversions_used: usageData?.model_conversions_used || 0,
        generation_count_today: subscriptionData.generation_count_today || 0,
        converted_3d_this_month: subscriptionData.converted_3d_this_month || 0
      },
      limits: {
        image_generations_limit: currentPlanLimits.image_generations_limit,
        model_conversions_limit: currentPlanLimits.model_conversions_limit + 
          (subscriptionData.additional_conversions || 0)
      },
      credits_remaining: creditsRemaining,
      status: status,
      generation_count_today: subscriptionData.generation_count_today || 0,
      converted_3d_this_month: subscriptionData.converted_3d_this_month || 0,
      last_generated_at: subscriptionData.last_generated_at
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CHECK-SUBSCRIPTION] Error: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
