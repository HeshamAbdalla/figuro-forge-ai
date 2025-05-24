
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
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Request received", { method: req.method });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Initialize Supabase clients
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { plan, mode = 'payment', successUrl, cancelUrl } = body;

    if (!plan) {
      throw new Error("Plan is required");
    }

    logStep("Creating checkout session", { plan, mode });

    // Handle free plan without Stripe
    if (plan === 'free') {
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
        throw new Error(`Failed to update to free plan: ${subscriptionError.message}`);
      }

      logStep("Updated to free plan successfully");
      return new Response(JSON.stringify({ success: true, plan: 'free' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Plan configurations
    const planConfigs = {
      starter: { priceId: 'price_starter', amount: 1299, name: 'Starter Plan' },
      pro: { priceId: 'price_pro', amount: 2999, name: 'Pro Plan' },
      unlimited: { priceId: 'price_unlimited', amount: 5999, name: 'Unlimited Plan' }
    };

    const planConfig = planConfigs[plan as keyof typeof planConfigs];
    if (!planConfig) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";
    const metadata = {
      userId: user.id,
      plan: plan,
      commercialLicense: (plan === 'unlimited').toString(),
      additionalConversions: "0"
    };

    let sessionParams: any = {
      customer: customerId,
      metadata: metadata,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: planConfig.name },
            unit_amount: planConfig.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
    };

    if (mode === 'embedded') {
      // Embedded checkout mode - use return_url instead of success_url/cancel_url
      sessionParams = {
        ...sessionParams,
        ui_mode: 'embedded',
        return_url: `${origin}/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
      };
    } else {
      // Regular hosted checkout
      sessionParams = {
        ...sessionParams,
        success_url: successUrl || `${origin}/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/pricing?canceled=true`,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    logStep("Checkout session created", { 
      sessionId: session.id, 
      mode: mode,
      plan: plan 
    });

    // Record the payment session in our database
    await supabaseAdmin
      .from("payment_sessions")
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        payment_status: 'pending',
        plan_type: plan,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      });

    logStep("Payment session recorded");

    const response = mode === 'embedded' 
      ? { clientSecret: session.client_secret }
      : { url: session.url };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Error in create-checkout", { error: error instanceof Error ? error.message : String(error) });
    console.error(`Error in create-checkout: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
