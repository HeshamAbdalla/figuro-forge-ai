
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
    const { plan, successUrl, cancelUrl } = body;

    logStep("Request body parsed", { plan, successUrl, cancelUrl });

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

    // Get or create price for the plan
    logStep("Getting or creating price for plan", { planName: plan });
    
    const planConfig = {
      "starter": { name: "Starter Plan", price: 799 }, // $7.99
      "pro": { name: "Pro Plan", price: 1999 }, // $19.99
      "unlimited": { name: "Unlimited Plan", price: 4999 } // $49.99
    };

    const config = planConfig[plan as keyof typeof planConfig];
    if (!config) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    // Check if product already exists
    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find(p => p.name === config.name);
    
    if (!product) {
      product = await stripe.products.create({
        name: config.name,
        description: `${config.name} subscription`,
      });
      logStep("Created new product", { productId: product.id });
    } else {
      logStep("Found existing product", { productId: product.id });
    }

    // Check if price already exists for this product
    const prices = await stripe.prices.list({ product: product.id, limit: 100 });
    let price = prices.data.find(p => p.unit_amount === config.price && p.recurring?.interval === 'month');

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: config.price,
        currency: 'usd',
        recurring: { interval: 'month' },
      });
      logStep("Created new price", { priceId: price.id });
    } else {
      logStep("Found existing price", { priceId: price.id });
    }

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create checkout session
    logStep("Creating checkout session", { priceId: price.id, plan });
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${req.headers.get("origin")}/profile?success=true&plan=${plan}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        user_id: user.id, // Also add this for backward compatibility
        plan: plan,
        planType: plan, // Also add this for backward compatibility
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
