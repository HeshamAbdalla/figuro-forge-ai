
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Rate limiting cache
const rateLimitCache = new Map<string, { lastCall: number; attempts: number }>();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Use the service role key for admin operations
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
      
      // If less than 10 seconds since last call, use cached response
      if (timeSinceLastCall < 10000) {
        logStep("Rate limited - using cached response");
        // Return a basic free plan response to prevent errors
        return new Response(JSON.stringify({
          plan: "free",
          commercial_license: false,
          additional_conversions: 0,
          is_active: false,
          valid_until: null,
          usage: { image_generations_used: 0, model_conversions_used: 0 },
          limits: { image_generations_limit: 3, model_conversions_limit: 1 },
          credits_remaining: 3,
          status: 'inactive'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }
    }
    
    // Update rate limit cache
    rateLimitCache.set(user.id, { lastCall: now, attempts: (userCache?.attempts || 0) + 1 });
    
    // Get current subscription from database
    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
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
    
    // If no subscription found, user is on free plan
    if (!subscriptionData || subscriptionError) {
      logStep("No subscription found, using free plan");
      
      // Create free plan record if it doesn't exist
      await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: "free",
          status: "active",
          credits_remaining: 3,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      // Create usage record if it doesn't exist
      if (!usageData || usageError) {
        await supabaseAdmin
          .from("user_usage")
          .upsert({
            user_id: user.id,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
      
      // Find free plan limits
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
        usage: usageData || { 
          image_generations_used: 0, 
          model_conversions_used: 0 
        },
        limits: {
          image_generations_limit: freePlan.image_generations_limit,
          model_conversions_limit: freePlan.model_conversions_limit
        },
        credits_remaining: 3,
        status: 'active'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }
    
    // For subscribed users, verify subscription with Stripe if they have stripe_subscription_id
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
    
    if (subscriptionData.stripe_subscription_id && isActive) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
      
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      
      try {
        // Only check Stripe if it's been more than 1 hour since last update
        const lastUpdate = new Date(subscriptionData.updated_at || "").getTime();
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        if (lastUpdate < oneHourAgo) {
          logStep("Checking Stripe subscription (hourly check)");
          const subscription = await stripe.subscriptions.retrieve(subscriptionData.stripe_subscription_id);
          logStep("Retrieved Stripe subscription", { 
            id: subscription.id,
            status: subscription.status 
          });
          
          isActive = subscription.status === 'active' || subscription.status === 'trialing';
          validUntil = new Date(subscription.current_period_end * 1000).toISOString();
          
          // Map Stripe status to our status
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
          
          // Update subscription in database
          await supabaseAdmin
            .from("subscriptions")
            .update({
              valid_until: isActive ? validUntil : null,
              expires_at: isActive ? validUntil : null,
              status: status,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);
          
          logStep("Updated subscription in database", { 
            isActive, 
            validUntil,
            status 
          });
        } else {
          logStep("Using cached subscription data (recent update)");
        }
        
        // If subscription is no longer active, downgrade to free plan
        if (!isActive && currentPlan !== 'free') {
          currentPlan = 'free';
          creditsRemaining = 3; // Free plan credits
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
          
          logStep("Downgraded to free plan due to inactive subscription");
        }
      } catch (stripeError) {
        // Handle rate limiting gracefully
        if (stripeError.message?.includes('rate limit')) {
          logStep("Stripe rate limited - using database data");
        } else {
          logStep("Error retrieving Stripe subscription", { 
            error: stripeError instanceof Error ? stripeError.message : String(stripeError)
          });
          
          // On Stripe errors, use database status but mark as potentially stale
          logStep("Using database subscription status due to Stripe error");
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
    
    logStep("Returning subscription data", { 
      plan: currentPlan,
      commercial_license: subscriptionData.commercial_license,
      additional_conversions: subscriptionData.additional_conversions,
      isActive,
      status,
      creditsRemaining
    });
    
    // Return subscription details
    return new Response(JSON.stringify({
      plan: currentPlan,
      commercial_license: subscriptionData.commercial_license,
      additional_conversions: subscriptionData.additional_conversions,
      is_active: isActive,
      valid_until: validUntil,
      usage: usageData || { 
        image_generations_used: 0, 
        model_conversions_used: 0 
      },
      limits: {
        image_generations_limit: currentPlanLimits.image_generations_limit,
        model_conversions_limit: currentPlanLimits.model_conversions_limit + 
          (subscriptionData.additional_conversions || 0)
      },
      credits_remaining: creditsRemaining,
      status: status
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
