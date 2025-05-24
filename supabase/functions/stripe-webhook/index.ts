
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// This is a public endpoint, no authentication needed
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    logStep("Webhook received");
    
    // Get request body and signature header
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      logStep("No signature header");
      return new Response("No signature header", { status: 400 });
    }
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("Missing Stripe webhook secret");
      console.error("Missing Stripe webhook secret");
      return new Response("Webhook secret not configured", { status: 500 });
    }
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
      console.error(`Webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}`);
      return new Response(`Webhook Error: ${err instanceof Error ? err.message : String(err)}`, { status: 400 });
    }
    
    console.log(`Stripe event received: ${event.type}`);
    
    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Handle checkout session completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId || session.metadata?.user_id;
      const customerId = session.customer;
      const plan = session.metadata?.plan || session.metadata?.planType;
      
      logStep("Processing checkout.session.completed", { userId, customerId, plan });
      
      if (!userId || !plan) {
        logStep("Missing user_id or plan in session metadata");
        console.error("Missing user_id or plan in session metadata");
        return new Response("Missing metadata", { status: 400 });
      }
      
      console.log(`Updating user ${userId} with plan ${plan} and customer ${customerId}`);
      
      // Update user profile with Stripe customer ID and plan
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ 
          stripe_customer_id: customerId,
          plan: plan 
        })
        .eq("id", userId);
      
      if (profileError) {
        logStep("Error updating profile", { error: profileError.message });
        console.error(`Error updating profile: ${profileError.message}`);
      } else {
        logStep("Successfully updated profile with new plan");
      }
      
      // Update or create subscription record
      const { error: subscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: userId,
          plan_type: plan,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (subscriptionError) {
        logStep("Error updating subscription", { error: subscriptionError.message });
        console.error(`Error updating subscription: ${subscriptionError.message}`);
      } else {
        logStep("Successfully updated subscription");
      }
      
      // Reset usage tracking for the new subscription period
      const { error: usageError } = await supabaseAdmin
        .from("user_usage")
        .upsert({
          user_id: userId,
          image_generations_used: 0,
          model_conversions_used: 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (usageError) {
        logStep("Error resetting usage", { error: usageError.message });
        console.error(`Error resetting usage: ${usageError.message}`);
      } else {
        logStep("Successfully reset usage counters");
      }
        
      logStep("Successfully processed checkout.session.completed");
    }
    
    // Handle subscription updated (e.g. plan changes or cancellations)
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      
      logStep("Processing customer.subscription.updated", { customerId });
      
      // Get the price object to determine the plan
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const product = await stripe.products.retrieve(price.product.toString());
      
      // Determine plan based on the product name
      const productName = product.name.toLowerCase();
      let plan = "free";
      
      if (productName.includes("starter")) {
        plan = "starter";
      } else if (productName.includes("pro")) {
        plan = "pro";
      } else if (productName.includes("unlimited")) {
        plan = "unlimited";
      }
      
      logStep("Determined plan from product", { productName, plan });
      
      // Find user by customer ID
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId);
      
      if (profileError || !profiles?.length) {
        logStep("Error finding user for customer", { customerId, error: profileError?.message });
        console.error(`Error finding user for customer ${customerId}: ${profileError?.message || "Not found"}`);
        return new Response("User not found", { status: 404 });
      }
      
      const userId = profiles[0].id;
      
      // Update plan in profiles table
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ plan })
        .eq("id", userId);
      
      if (updateError) {
        logStep("Error updating profile plan", { error: updateError.message });
        console.error(`Error updating profile plan: ${updateError.message}`);
      } else {
        logStep("Successfully updated profile plan");
      }
      
      // Update subscription table
      const { error: subUpdateError } = await supabaseAdmin
        .from("subscriptions")
        .update({ 
          plan_type: plan,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
      
      if (subUpdateError) {
        logStep("Error updating subscription plan", { error: subUpdateError.message });
      } else {
        logStep("Successfully updated subscription plan");
      }
      
      logStep("Successfully processed customer.subscription.updated");
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Error processing webhook", { error: error instanceof Error ? error.message : String(error) });
    console.error(`Error processing webhook: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(`Server error: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
});
