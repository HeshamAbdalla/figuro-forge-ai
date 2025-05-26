
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-STRIPE] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get request body and header
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      return new Response("No signature header", { status: 400 });
    }
    
    // Verify webhook with Stripe
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("STRIPE_WEBHOOK_SECRET is not set, skipping signature verification");
      return new Response("Webhook secret not configured", { status: 500 });
    }
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep(`Webhook signature verification failed`, { error: err instanceof Error ? err.message : String(err) });
      return new Response("Webhook signature verification failed", { status: 400 });
    }
    
    logStep("Webhook verified", { type: event.type });
    
    // Create admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        logStep("Checkout session completed", { sessionId: session.id });
        
        // Get metadata from the session
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        const commercialLicense = session.metadata?.commercialLicense === 'true';
        const additionalConversions = parseInt(session.metadata?.additionalConversions || '0', 10);
        
        if (!userId || !planType) {
          logStep("Missing metadata in checkout session", { userId, planType });
          return new Response("Missing metadata", { status: 400 });
        }
        
        // Get subscription ID from the session
        const subscriptionId = session.subscription;
        if (!subscriptionId) {
          logStep("No subscription ID in checkout session");
          return new Response("No subscription ID", { status: 400 });
        }
        
        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const validUntil = new Date(subscription.current_period_end * 1000).toISOString();
        const renewedAt = new Date().toISOString();
        
        // Get plan limits to set initial credits
        const { data: planLimits, error: planError } = await supabaseAdmin
          .from("plan_limits")
          .select("monthly_credits")
          .eq("plan_type", planType)
          .single();
        
        if (planError) {
          logStep("Error fetching plan limits", { error: planError.message });
          return new Response("Error fetching plan limits", { status: 500 });
        }
        
        const monthlyCredits = planLimits?.monthly_credits || 0;
        
        // Update subscription in database
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscriptionId,
            plan_type: planType,
            commercial_license: commercialLicense,
            additional_conversions: additionalConversions,
            valid_until: validUntil,
            expires_at: validUntil,
            renewed_at: renewedAt,
            status: 'active',
            credits_remaining: monthlyCredits,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (updateError) {
          logStep("Error updating subscription in database", { error: updateError.message });
          return new Response("Error updating subscription", { status: 500 });
        }
        
        logStep("Subscription created with initial credits", {
          userId,
          planType,
          monthlyCredits,
          validUntil
        });
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        logStep("Invoice payment succeeded", { 
          invoiceId: invoice.id, 
          customerId: invoice.customer,
          billingReason: invoice.billing_reason 
        });
        
        // Check if this is a subscription renewal
        if (invoice.billing_reason === 'subscription_cycle') {
          logStep("Processing subscription renewal");
          
          // Find user by customer ID
          const { data: subscription, error: subError } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id, plan_type")
            .eq("stripe_customer_id", invoice.customer)
            .single();
          
          if (subError || !subscription) {
            logStep("Could not find subscription for customer", { 
              customerId: invoice.customer, 
              error: subError?.message 
            });
            return new Response("Subscription not found", { status: 404 });
          }
          
          // Get plan limits for credit refresh
          const { data: planLimits, error: planError } = await supabaseAdmin
            .from("plan_limits")
            .select("monthly_credits")
            .eq("plan_type", subscription.plan_type)
            .single();
          
          if (planError) {
            logStep("Error fetching plan limits for renewal", { error: planError.message });
            return new Response("Error fetching plan limits", { status: 500 });
          }
          
          const monthlyCredits = planLimits?.monthly_credits || 0;
          const renewedAt = new Date().toISOString();
          
          // Get subscription period end from Stripe
          if (invoice.subscription) {
            const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const expiresAt = new Date(stripeSubscription.current_period_end * 1000).toISOString();
            
            // Update subscription with renewal info and refresh credits
            const { error: updateError } = await supabaseAdmin
              .from("subscriptions")
              .update({
                renewed_at: renewedAt,
                expires_at: expiresAt,
                valid_until: expiresAt,
                credits_remaining: monthlyCredits,
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq("user_id", subscription.user_id);
            
            if (updateError) {
              logStep("Error updating subscription for renewal", { error: updateError.message });
              return new Response("Error updating subscription", { status: 500 });
            }
            
            logStep("Subscription renewed and credits refreshed", {
              userId: subscription.user_id,
              planType: subscription.plan_type,
              creditsRefreshed: monthlyCredits,
              expiresAt
            });
          }
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        logStep("Invoice payment failed", { 
          invoiceId: invoice.id, 
          customerId: invoice.customer 
        });
        
        // Find user by customer ID and mark subscription as past due
        const { data: subscription, error: subError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", invoice.customer)
          .single();
        
        if (subError || !subscription) {
          logStep("Could not find subscription for failed payment", { 
            customerId: invoice.customer, 
            error: subError?.message 
          });
          return new Response("Subscription not found", { status: 404 });
        }
        
        // Update subscription status to past_due
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq("user_id", subscription.user_id);
        
        if (updateError) {
          logStep("Error updating subscription for failed payment", { error: updateError.message });
          return new Response("Error updating subscription", { status: 500 });
        }
        
        logStep("Subscription marked as past due", { userId: subscription.user_id });
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        logStep("Subscription updated", { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });
        
        // Get customer ID
        const customerId = subscription.customer;
        
        // Find user by customer ID
        const { data: userData, error: userError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();
        
        if (userError || !userData) {
          logStep("Could not find user for customer", { customerId, error: userError?.message });
          return new Response("User not found", { status: 404 });
        }
        
        // Update subscription status based on Stripe status
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        const validUntil = isActive ? new Date(subscription.current_period_end * 1000).toISOString() : null;
        
        // Map Stripe status to our status
        let dbStatus = 'inactive';
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          dbStatus = 'active';
        } else if (subscription.status === 'past_due') {
          dbStatus = 'past_due';
        } else if (subscription.status === 'canceled') {
          dbStatus = 'canceled';
        }
        
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            valid_until: validUntil,
            expires_at: validUntil,
            status: dbStatus,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userData.user_id);
        
        if (updateError) {
          logStep("Error updating subscription status", { error: updateError.message });
          return new Response("Error updating subscription status", { status: 500 });
        }
        
        logStep("Subscription status updated", {
          userId: userData.user_id,
          stripeStatus: subscription.status,
          dbStatus,
          validUntil
        });
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        logStep("Subscription deleted", { subscriptionId: subscription.id });
        
        // Get customer ID
        const customerId = subscription.customer;
        
        // Find user by customer ID
        const { data: userData, error: userError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();
        
        if (userError || !userData) {
          logStep("Could not find user for customer", { customerId, error: userError?.message });
          return new Response("User not found", { status: 404 });
        }
        
        // Downgrade to free plan
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            plan_type: 'free',
            stripe_subscription_id: null,
            valid_until: null,
            expires_at: null,
            commercial_license: false,
            additional_conversions: 0,
            credits_remaining: 3, // Free plan credits
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userData.user_id);
        
        if (updateError) {
          logStep("Error downgrading to free plan", { error: updateError.message });
          return new Response("Error downgrading subscription", { status: 500 });
        }
        
        logStep("Downgraded to free plan", { userId: userData.user_id });
        break;
      }
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[WEBHOOK-STRIPE] Error: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
});
