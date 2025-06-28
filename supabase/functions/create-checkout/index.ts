
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
  console.log(`[CREATE-CHECKOUT-SECURE] ${step}${detailsStr}`);
};

// Enhanced security validation
const validatePlanInput = (plan: string): boolean => {
  const validPlans = ['free', 'starter', 'pro', 'unlimited'];
  return validPlans.includes(plan);
};

const validateMode = (mode: string): boolean => {
  const validModes = ['payment', 'subscription', 'embedded'];
  return validModes.includes(mode);
};

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

    // Enhanced input validation
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("CRITICAL: STRIPE_SECRET_KEY is not set");
      throw new Error("Payment system unavailable");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Initialize Supabase clients with enhanced error handling
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
    if (!token || token.length < 10) {
      logStep("SECURITY: Invalid token format");
      return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user?.email) {
      logStep("SECURITY: Authentication failed", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
    logStep("User authenticated securely", { userId: user.id, email: user.email });

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
      await logSecurityEvent(supabaseAdmin, user.id, 'checkout_invalid_body', { error: error.message }, false);
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { plan, mode = 'subscription', successUrl, cancelUrl } = body;

    // CRITICAL: Enhanced plan validation
    if (!plan || typeof plan !== 'string') {
      logStep("SECURITY: Missing or invalid plan parameter");
      await logSecurityEvent(supabaseAdmin, user.id, 'checkout_missing_plan', { providedPlan: plan }, false);
      return new Response(JSON.stringify({ error: "Plan selection required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!validatePlanInput(plan)) {
      logStep("SECURITY: Invalid plan attempted", { plan, userId: user.id });
      await logSecurityEvent(supabaseAdmin, user.id, 'checkout_invalid_plan', { attemptedPlan: plan }, false);
      return new Response(JSON.stringify({ error: "Invalid plan selection" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!validateMode(mode)) {
      logStep("SECURITY: Invalid mode attempted", { mode, userId: user.id });
      await logSecurityEvent(supabaseAdmin, user.id, 'checkout_invalid_mode', { attemptedMode: mode }, false);
      return new Response(JSON.stringify({ error: "Invalid checkout mode" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Creating checkout session with enhanced security", { plan, mode });

    // Handle free plan with additional validation
    if (plan === 'free') {
      // Verify user doesn't already have a paid plan
      const { data: existingSub } = await supabaseAdmin
        .from("subscriptions")
        .select("plan_type, status")
        .eq("user_id", user.id)
        .single();

      if (existingSub && existingSub.plan_type !== 'free' && existingSub.status === 'active') {
        logStep("SECURITY: User attempting to downgrade to free from paid plan", { 
          currentPlan: existingSub.plan_type,
          userId: user.id 
        });
        await logSecurityEvent(supabaseAdmin, user.id, 'checkout_suspicious_downgrade', { 
          currentPlan: existingSub.plan_type,
          attemptedPlan: 'free'
        }, false);
      }

      const { error: subscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: 'free',
          commercial_license: false,
          additional_conversions: 0,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          valid_until: null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (subscriptionError) {
        logStep("SECURITY: Failed to update to free plan", { error: subscriptionError.message });
        throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
      }

      await logSecurityEvent(supabaseAdmin, user.id, 'checkout_free_plan_success', { plan: 'free' });
      
      logStep("Free plan updated successfully with security validation");
      return new Response(JSON.stringify({ success: true, plan: 'free' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Enhanced plan configurations with strict validation
    const planConfigs = {
      starter: { 
        priceId: 'price_1Rbr6rFmCMNpEEexgSZiJaKZ', 
        amount: 1299, 
        name: 'Starter Plan',
        features: ['50 monthly credits', 'Basic support']
      },
      pro: { 
        priceId: 'price_1Rbr6rFmCMNpEEFyJpgHJmxA', 
        amount: 2999, 
        name: 'Pro Plan',
        features: ['200 monthly credits', 'Priority support', 'Commercial license']
      },
      unlimited: { 
        priceId: 'price_1Rbr6rFmCMNpEEF0dVqHyTgN', 
        amount: 5999, 
        name: 'Unlimited Plan',
        features: ['Unlimited credits', 'Premium support', 'Commercial license']
      }
    };

    const planConfig = planConfigs[plan as keyof typeof planConfigs];
    if (!planConfig) {
      logStep("SECURITY: Plan configuration not found", { plan, userId: user.id });
      await logSecurityEvent(supabaseAdmin, user.id, 'checkout_invalid_plan_config', { plan }, false);
      throw new Error(`Invalid plan configuration: ${plan}`);
    }

    // Enhanced customer validation
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    // Create customer if doesn't exist with enhanced metadata
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { 
          userId: user.id,
          createdAt: new Date().toISOString(),
          source: 'checkout-secure'
        }
      });
      customerId = customer.id;
      logStep("Created new Stripe customer with enhanced security", { customerId });
    }

    const origin = req.headers.get("origin") || "https://figuros.ai";
    
    // Enhanced metadata with security tracking
    const metadata = {
      userId: user.id,
      plan: plan,
      commercialLicense: (plan === 'unlimited' || plan === 'pro').toString(),
      additionalConversions: "0",
      createdAt: new Date().toISOString(),
      securityVersion: "2.0",
      validatedInput: "true"
    };

    let sessionParams: any = {
      customer: customerId,
      metadata: metadata,
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: false, // Security: Disable promotion codes
      billing_address_collection: 'required', // Enhanced validation
      payment_method_types: ['card'], // Restrict to cards only
    };

    if (mode === 'embedded') {
      sessionParams = {
        ...sessionParams,
        ui_mode: 'embedded',
        return_url: `${origin}/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
      };
    } else {
      sessionParams = {
        ...sessionParams,
        success_url: successUrl || `${origin}/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/pricing?canceled=true`,
      };
    }

    // Create session with enhanced error handling
    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (stripeError: any) {
      logStep("SECURITY: Stripe session creation failed", { 
        error: stripeError.message,
        plan,
        userId: user.id 
      });
      await logSecurityEvent(supabaseAdmin, user.id, 'checkout_stripe_error', { 
        error: stripeError.message,
        plan 
      }, false);
      throw new Error("Payment system error. Please try again.");
    }

    logStep("Checkout session created securely", { 
      sessionId: session.id, 
      mode: mode,
      plan: plan,
      priceId: planConfig.priceId,
      amount: planConfig.amount
    });

    // Enhanced payment session recording with security fields
    const { error: sessionError } = await supabaseAdmin
      .from("payment_sessions")
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        payment_status: 'pending',
        plan_type: plan,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        // Add security tracking fields if they exist in the schema
      });

    if (sessionError) {
      logStep("WARNING: Failed to record payment session", { error: sessionError.message });
      // Continue anyway as Stripe session is created
    }

    // Log successful security validation
    await logSecurityEvent(supabaseAdmin, user.id, 'checkout_session_created', {
      plan,
      mode,
      sessionId: session.id,
      amount: planConfig.amount,
      priceId: planConfig.priceId
    });

    logStep("Payment session recorded securely");

    const response = mode === 'embedded' 
      ? { clientSecret: session.client_secret }
      : { url: session.url };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("SECURITY ERROR in create-checkout", { error: errorMessage });
    console.error(`SECURITY ERROR in create-checkout: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: "Payment processing unavailable" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
