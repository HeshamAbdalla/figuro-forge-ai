
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

// Mapping of plan names to Stripe price IDs
const PLAN_PRICE_IDS = {
  "starter": "price_1RRpW3Fz9RxnLs0LsxWYzd34",
  "pro": "price_1RRozKFz9RxnLs0LjeVjldW1",
  "unlimited": "price_1RRp0BFz9RxnLs0LjR1zMtLi"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Request received", { method: req.method });

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email || !user?.id) {
      throw new Error("User not authenticated or email/id not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const body = await req.json();
    const { plan, mode = "embedded" } = body;

    logStep("Request body parsed", { plan, mode });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    logStep("Stripe initialized");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // For free plan, just update the user's plan in the database
    if (plan === "free") {
      logStep("Processing free plan");
      
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Update user profile
      await supabaseAdmin
        .from("profiles")
        .update({ plan: "free" })
        .eq("id", user.id);

      // Update subscription
      await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: "free",
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Get the price ID for the requested plan
    const priceId = PLAN_PRICE_IDS[plan as keyof typeof PLAN_PRICE_IDS];
    if (!priceId) {
      throw new Error(`Invalid plan: ${plan}. Available plans: ${Object.keys(PLAN_PRICE_IDS).join(', ')}`);
    }

    logStep("Using existing price ID", { plan, priceId });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create checkout session with embedded UI mode
    logStep("Creating checkout session", { priceId, plan, mode });
    
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      ui_mode: "embedded",
      return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: user.id,
        user_id: user.id,
        plan: plan,
        planType: plan,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, clientSecret: session.client_secret });

    return new Response(JSON.stringify({ 
      clientSecret: session.client_secret,
      sessionId: session.id 
    }), {
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
