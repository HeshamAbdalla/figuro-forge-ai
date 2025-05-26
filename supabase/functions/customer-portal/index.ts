
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
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    logStep("Function started");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });
    
    // Create admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Get subscription from database
    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (subscriptionError) {
      logStep("No subscription found, creating free subscription");
      
      // For free users, create a basic customer and redirect to pricing
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      
      // Try to find existing customer by email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      let customerId;
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer for free user", { customerId });
      } else {
        // Create a new customer for the free user
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        customerId = newCustomer.id;
        logStep("Created new Stripe customer for free user", { customerId });
      }
      
      // Create a basic subscription record
      await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan: 'free',
          stripe_customer_id: customerId,
          status: 'active',
          is_active: true,
          commercial_license: false,
          additional_conversions: 0,
          credits_remaining: 3,
          generation_count_today: 0,
          converted_3d_this_month: 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        error: "No active subscription found",
        action: "upgrade",
        message: "Please upgrade to a paid plan to access subscription management."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // If we don't have a stripe_customer_id, try to find one or create a new one
    let customerId = subscriptionData.stripe_customer_id;
    
    if (!customerId) {
      // Try to find existing customer by email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      } else {
        // Create a new customer
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        customerId = newCustomer.id;
        logStep("Created new Stripe customer", { customerId });
      }
      
      // Update customer ID in database
      await supabaseAdmin
        .from("subscriptions")
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
    }
    
    // Create a customer portal session with enhanced return URL
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const returnUrl = `${origin}/profile?portal_return=true`;
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    logStep("Customer portal session created", { 
      url: portalSession.url,
      returnUrl: returnUrl,
      customerId: customerId
    });
    
    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    
    // Provide more specific error responses
    if (errorMessage.includes("Authentication")) {
      return new Response(JSON.stringify({ 
        error: "Authentication failed",
        message: "Please log in again to access subscription management."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      });
    }
    
    if (errorMessage.includes("STRIPE_SECRET_KEY")) {
      return new Response(JSON.stringify({ 
        error: "Service configuration error",
        message: "Payment service is temporarily unavailable."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503
      });
    }
    
    return new Response(JSON.stringify({ 
      error: "Portal creation failed",
      message: "Unable to open subscription management. Please try again."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
