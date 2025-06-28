import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT-SESSION-SECURE] ${step}${detailsStr}`);
};

// Enhanced plan validation with strict price checking
const VALID_PLAN_CONFIGS = {
  'free': { monthlyCredits: 3, maxPrice: 0 },
  'starter': { monthlyCredits: 25, maxPrice: 1299 },
  'pro': { monthlyCredits: 200, maxPrice: 2999 },
  'unlimited': { monthlyCredits: 999999, maxPrice: 5999 }
};

const VALID_PRICE_IDS = [
  'price_1Rbr6rFmCMNpEEexgSZiJaKZ', // starter
  'price_1Rbr6rFmCMNpEEFyJpgHJmxA', // pro
  'price_1Rbr6rFmCMNpEEF0dVqHyTgN'  // unlimited
];

// Security event logging
const logSecurityEvent = async (supabaseAdmin: any, userId: string, eventType: string, details: any, success: boolean = true) => {
  try {
    await supabaseAdmin.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_event_details: details,
      p_ip_address: null,
      p_user_agent: null,
      p_success: success
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Request received with enhanced security", { method: req.method });

    // Initialize Stripe with enhanced error handling
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("CRITICAL: STRIPE_SECRET_KEY is not set");
      throw new Error("Payment system unavailable");
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Initialize Supabase with service role for secure operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Enhanced authentication validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("SECURITY: Invalid or missing authorization header");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      logStep("SECURITY: Authentication failed", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;

    // Enhanced request body validation
    let body;
    try {
      const rawBody = await req.text();
      if (!rawBody || rawBody.trim() === '') {
        throw new Error("Empty request body");
      }
      body = JSON.parse(rawBody);
    } catch (error) {
      logStep("SECURITY: Invalid request body", { error: error.message });
      await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_invalid_body', { error: error.message }, false);
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const sessionId = body.session_id;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
      logStep("SECURITY: Invalid session ID", { sessionId });
      await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_invalid_session_id', { sessionId }, false);
      return new Response(JSON.stringify({ error: "Valid session ID required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Verifying payment session with enhanced security", { sessionId, userId: user.id });

    // Check if we already have this session recorded and verified
    const { data: existingSession } = await supabaseAdmin
      .from("payment_sessions")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (existingSession?.verified_at) {
      logStep("Session already verified", { sessionId });
      return new Response(JSON.stringify({
        success: true,
        message: "Payment already verified",
        plan: existingSession.plan_type
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Retrieve the checkout session from Stripe with enhanced validation
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'subscription.items.data.price']
      });
    } catch (stripeError: any) {
      logStep("SECURITY: Failed to retrieve session from Stripe", { 
        sessionId, 
        error: stripeError.message 
      });
      await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_stripe_error', { 
        sessionId, 
        error: stripeError.message 
      }, false);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid payment session"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Checkout session retrieved", { 
      sessionId: session.id, 
      status: session.status,
      paymentStatus: session.payment_status,
      customerId: session.customer
    });

    // CRITICAL: Verify the session belongs to this user
    if (session.metadata?.userId !== user.id) {
      logStep("SECURITY: Session ownership mismatch", { 
        sessionUserId: session.metadata?.userId, 
        authenticatedUserId: user.id 
      });
      await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_ownership_mismatch', { 
        sessionId,
        sessionUserId: session.metadata?.userId,
        authenticatedUserId: user.id 
      }, false);
      return new Response(JSON.stringify({
        success: false,
        error: "Payment session validation failed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Enhanced payment validation
    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      logStep("Payment not completed", { status: session.status, paymentStatus: session.payment_status });
      await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_incomplete', { 
        sessionId,
        status: session.status, 
        paymentStatus: session.payment_status 
      });
      return new Response(JSON.stringify({
        success: false,
        message: "Payment not completed",
        status: session.status,
        paymentStatus: session.payment_status
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const planType = session.metadata?.plan || 'free';
    const commercialLicense = session.metadata?.commercialLicense === 'true';
    const additionalConversions = parseInt(session.metadata?.additionalConversions || '0', 10);

    // CRITICAL: Enhanced plan validation
    if (!VALID_PLAN_CONFIGS[planType]) {
      logStep("SECURITY: Invalid plan type in session", { planType, sessionId });
      await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_invalid_plan', { 
        planType, 
        sessionId 
      }, false);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid subscription plan"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Enhanced price validation for paid plans
    if (planType !== 'free' && session.subscription) {
      const subscription = session.subscription as any;
      const priceId = subscription.items?.data?.[0]?.price?.id;
      
      if (!priceId || !VALID_PRICE_IDS.includes(priceId)) {
        logStep("SECURITY: Invalid or missing price ID", { priceId, planType, sessionId });
        await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_invalid_price', { 
          priceId, 
          planType, 
          sessionId 
        }, false);
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid subscription pricing"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
        });
      }

      // Validate amount paid matches plan
      const paidAmount = subscription.items?.data?.[0]?.price?.unit_amount || 0;
      const maxPrice = VALID_PLAN_CONFIGS[planType].maxPrice;
      
      if (paidAmount < maxPrice * 0.8) { // Allow 20% variance for promotions
        logStep("SECURITY: Insufficient payment amount", { 
          paidAmount, 
          expectedMin: maxPrice * 0.8, 
          planType, 
          sessionId 
        });
        await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_insufficient_amount', { 
          paidAmount, 
          expectedMin: maxPrice * 0.8, 
          planType, 
          sessionId 
        }, false);
        return new Response(JSON.stringify({
          success: false,
          error: "Payment amount validation failed"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    logStep("Processing successful payment with enhanced validation", { 
      planType, 
      commercialLicense, 
      additionalConversions 
    });

    // Helper function to get plan order for comparison
    const getPlanOrder = (planType: string): number => {
      const orders: Record<string, number> = {
        'free': 0,
        'starter': 1,
        'pro': 2,
        'unlimited': 3
      };
      return orders[planType] || 0;
    };

    // Helper function to get default credits for a plan
    const getPlanCredits = (planType: string): number => {
      const credits: Record<string, number> = {
        'free': 10,
        'starter': 50,
        'pro': 200,
        'unlimited': 999999
      };
      return credits[planType] || 10;
    };

    // Get current subscription to check for upgrades
    const { data: currentSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_type")
      .eq("user_id", user.id)
      .single();

    const currentPlanType = currentSubscription?.plan_type || 'free';
    const isUpgrade = getPlanOrder(planType) > getPlanOrder(currentPlanType);
    
    logStep("Plan comparison", { 
      currentPlan: currentPlanType, 
      newPlan: planType, 
      isUpgrade,
      currentOrder: getPlanOrder(currentPlanType),
      newOrder: getPlanOrder(planType)
    });

    // Record the payment session
    await supabaseAdmin
      .from("payment_sessions")
      .upsert({
        user_id: user.id,
        stripe_session_id: sessionId,
        payment_status: 'completed',
        plan_type: planType,
        verified_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }, { onConflict: 'stripe_session_id' });

    // Update subscription
    let validUntil = null;
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      validUntil = new Date(subscription.current_period_end * 1000).toISOString();
    }

    // Prepare subscription update data
    const subscriptionUpdate: any = {
      user_id: user.id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      plan_type: planType,
      commercial_license: commercialLicense,
      additional_conversions: additionalConversions,
      valid_until: validUntil,
      updated_at: new Date().toISOString()
    };

    // If this is an upgrade, reset usage counters and allocate new credits
    if (isUpgrade) {
      logStep("Performing upgrade - resetting usage counters", { fromPlan: currentPlanType, toPlan: planType });
      
      subscriptionUpdate.generation_count_today = 0;
      subscriptionUpdate.generation_count_this_month = 0;
      subscriptionUpdate.converted_3d_this_month = 0;
      subscriptionUpdate.credits_remaining = getPlanCredits(planType);
      subscriptionUpdate.bonus_credits = 0; // Reset bonus credits on upgrade
      subscriptionUpdate.monthly_reset_date = new Date();
      subscriptionUpdate.daily_reset_date = new Date();
      
      logStep("Usage reset complete", { 
        newCredits: subscriptionUpdate.credits_remaining,
        resetCounters: {
          generation_count_today: 0,
          generation_count_this_month: 0,
          converted_3d_this_month: 0
        }
      });
    }

    const { error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(subscriptionUpdate, { onConflict: 'user_id' });

    if (subscriptionError) {
      logStep("SECURITY: Error updating subscription", { error: subscriptionError.message });
      await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_subscription_error', { 
        error: subscriptionError.message,
        sessionId 
      }, false);
      throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
    }

    // Update profile plan
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ plan: planType })
      .eq("id", user.id);

    if (profileError) {
      logStep("WARNING: Error updating profile", { error: profileError.message });
    }

    // Log successful payment verification
    await logSecurityEvent(supabaseAdmin, user.id, 'payment_verify_success', {
      planType,
      sessionId,
      amount: session.amount_total,
      validUntil,
      creditsAllocated: planConfig.monthlyCredits
    });

    logStep("Payment verification completed successfully with enhanced security", { 
      planType, 
      userId: user.id, 
      creditsAllocated: planConfig.monthlyCredits
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Payment verified and subscription updated with enhanced security",
      plan: planType,
      validUntil: validUntil,
      creditsAllocated: planConfig.monthlyCredits
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("SECURITY ERROR in verify-payment-session", { error: errorMessage });
    console.error(`SECURITY ERROR in verify-payment-session: ${errorMessage}`);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: "Payment verification system error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
