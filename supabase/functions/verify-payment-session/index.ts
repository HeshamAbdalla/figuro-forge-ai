
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
  console.log(`[VERIFY-PAYMENT-SESSION] ${step}${detailsStr}`);
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Request received", { method: req.method });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Initialize Supabase with service role for secure operations
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
    if (!user) throw new Error("User not authenticated");

    // Get session ID from request body
    const body = await req.json();
    const sessionId = body.session_id;

    if (!sessionId) {
      throw new Error("session_id is required in request body");
    }

    logStep("Verifying payment session", { sessionId, userId: user.id });

    // Check if we already have this session recorded
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

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    logStep("Checkout session retrieved", { 
      sessionId: session.id, 
      status: session.status,
      paymentStatus: session.payment_status,
      customerId: session.customer
    });

    // Verify the session belongs to this user
    if (session.metadata?.userId !== user.id) {
      throw new Error("Session does not belong to authenticated user");
    }

    // Check if payment was successful
    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      logStep("Payment not completed", { status: session.status, paymentStatus: session.payment_status });
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

    logStep("Processing successful payment", { planType, commercialLicense, additionalConversions });

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
      logStep("Error updating subscription", { error: subscriptionError.message });
      throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
    }

    // Update profile plan
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ plan: planType })
      .eq("id", user.id);

    if (profileError) {
      logStep("Error updating profile", { error: profileError.message });
    }

    logStep("Payment verification completed successfully", { 
      planType, 
      userId: user.id, 
      wasUpgrade: isUpgrade,
      creditsAllocated: isUpgrade ? getPlanCredits(planType) : undefined
    });

    return new Response(JSON.stringify({
      success: true,
      message: isUpgrade 
        ? `Payment verified, subscription upgraded to ${planType}, and usage reset`
        : "Payment verified and subscription updated",
      plan: planType,
      validUntil: validUntil,
      wasUpgrade: isUpgrade,
      creditsAllocated: isUpgrade ? getPlanCredits(planType) : undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Error in verify-payment-session", { error: error instanceof Error ? error.message : String(error) });
    console.error(`Error in verify-payment-session: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
