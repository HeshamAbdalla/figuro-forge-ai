import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Plan configuration - matches frontend config
const PLANS = {
  free: { monthlyCredits: 3, order: 0 },
  starter: { monthlyCredits: 25, order: 1 },
  pro: { monthlyCredits: 120, order: 2 },
  unlimited: { monthlyCredits: 999999, order: 3 },
};

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
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      return new Response("No signature header", { status: 400 });
    }
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("STRIPE_WEBHOOK_SECRET is not set");
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
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Helper function to determine plan from Stripe price
    const determinePlanFromPrice = async (priceId: string): Promise<{ planType: string; planConfig: any }> => {
      const price = await stripe.prices.retrieve(priceId);
      const product = await stripe.products.retrieve(price.product as string);
      const productName = product.name.toLowerCase();
      
      let planType = "free";
      if (productName.includes("starter")) planType = "starter";
      else if (productName.includes("pro")) planType = "pro";
      else if (productName.includes("unlimited")) planType = "unlimited";
      
      return { planType, planConfig: PLANS[planType] || PLANS.free };
    };

    // Helper function to handle plan switching logic
    const handlePlanSwitch = async (userId: string, newPlan: string, oldPlan: string, stripeData: any) => {
      const newPlanConfig = PLANS[newPlan];
      const oldPlanConfig = PLANS[oldPlan];
      
      logStep("Processing plan switch", { userId, oldPlan, newPlan });
      
      // Get current subscription data
      const { data: currentSub } = await supabaseAdmin
        .from("subscriptions")
        .select("credits_remaining, generation_count_today, converted_3d_this_month")
        .eq("user_id", userId)
        .single();
      
      let newCredits = newPlanConfig.monthlyCredits;
      let resetUsage = false;
      
      // Plan switching logic
      if (newPlanConfig.order > oldPlanConfig.order) {
        // Upgrade: preserve existing credits and add new plan credits
        newCredits = Math.max(
          currentSub?.credits_remaining || 0,
          newPlanConfig.monthlyCredits
        );
        resetUsage = true; // Reset usage limits on upgrade
        logStep("Plan upgrade detected", { preservedCredits: newCredits });
      } else if (newPlanConfig.order < oldPlanConfig.order) {
        // Downgrade: cap credits to new plan limits
        newCredits = Math.min(
          currentSub?.credits_remaining || 0,
          newPlanConfig.monthlyCredits
        );
        logStep("Plan downgrade detected", { cappedCredits: newCredits });
      }
      
      // Update subscription with new plan data
      const updateData = {
        plan_type: newPlan,
        stripe_price_id: stripeData.priceId,
        stripe_subscription_id: stripeData.subscriptionId,
        credits_remaining: newCredits,
        valid_until: stripeData.validUntil,
        expires_at: stripeData.validUntil,
        status: 'active',
        updated_at: new Date().toISOString(),
        ...(resetUsage && {
          generation_count_today: 0,
          converted_3d_this_month: 0,
          daily_reset_date: new Date().toISOString().split('T')[0],
          monthly_reset_date: new Date().toISOString().split('T')[0].substring(0, 7) + '-01'
        })
      };
      
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update(updateData)
        .eq("user_id", userId);
      
      if (error) {
        logStep("Error updating subscription for plan switch", { error: error.message });
        throw error;
      }
      
      logStep("Plan switch completed successfully", { newPlan, newCredits });
    };
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        logStep("Checkout session completed", { sessionId: session.id });
        
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        const commercialLicense = session.metadata?.commercialLicense === 'true';
        const additionalConversions = parseInt(session.metadata?.additionalConversions || '0', 10);
        
        if (!userId || !planType) {
          logStep("Missing metadata in checkout session", { userId, planType });
          return new Response("Missing metadata", { status: 400 });
        }
        
        const subscriptionId = session.subscription;
        if (!subscriptionId) {
          logStep("No subscription ID in checkout session");
          return new Response("No subscription ID", { status: 400 });
        }
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const validUntil = new Date(subscription.current_period_end * 1000).toISOString();
        const priceId = subscription.items.data[0].price.id;
        
        const planConfig = PLANS[planType] || PLANS.free;
        
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            plan_type: planType,
            commercial_license: commercialLicense,
            additional_conversions: additionalConversions,
            valid_until: validUntil,
            expires_at: validUntil,
            renewed_at: new Date().toISOString(),
            status: 'active',
            credits_remaining: planConfig.monthlyCredits,
            generation_count_today: 0,
            converted_3d_this_month: 0,
            daily_reset_date: new Date().toISOString().split('T')[0],
            monthly_reset_date: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (updateError) {
          logStep("Error updating subscription in database", { error: updateError.message });
          return new Response("Error updating subscription", { status: 500 });
        }
        
        logStep("Subscription created successfully", { userId, planType, credits: planConfig.monthlyCredits });
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });
        
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0].price.id;
        
        // Determine new plan from price
        const { planType: newPlan } = await determinePlanFromPrice(priceId);
        
        // Find user by customer ID and get current plan
        const { data: currentSub, error: subError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, plan_type")
          .eq("stripe_customer_id", customerId)
          .single();
        
        if (subError || !currentSub) {
          logStep("Could not find subscription for customer", { customerId, error: subError?.message });
          return new Response("Subscription not found", { status: 404 });
        }
        
        const oldPlan = currentSub.plan_type;
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        const validUntil = isActive ? new Date(subscription.current_period_end * 1000).toISOString() : null;
        
        // Handle plan switching if plan changed
        if (newPlan !== oldPlan && isActive) {
          await handlePlanSwitch(currentSub.user_id, newPlan, oldPlan, {
            priceId,
            subscriptionId: subscription.id,
            validUntil
          });
        } else {
          // Just update status and dates
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
              stripe_price_id: priceId,
              valid_until: validUntil,
              expires_at: validUntil,
              status: dbStatus,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", currentSub.user_id);
          
          if (updateError) {
            logStep("Error updating subscription status", { error: updateError.message });
            return new Response("Error updating subscription status", { status: 500 });
          }
        }
        
        logStep("Subscription update processed", { userId: currentSub.user_id, newPlan, status: subscription.status });
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        logStep("Invoice payment succeeded", { 
          invoiceId: invoice.id, 
          billingReason: invoice.billing_reason 
        });
        
        if (invoice.billing_reason === 'subscription_cycle') {
          logStep("Processing subscription renewal");
          
          const { data: subscription, error: subError } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id, plan_type, stripe_subscription_id")
            .eq("stripe_customer_id", invoice.customer)
            .single();
          
          if (subError || !subscription) {
            logStep("Could not find subscription for renewal", { 
              customerId: invoice.customer, 
              error: subError?.message 
            });
            return new Response("Subscription not found", { status: 404 });
          }
          
          const planConfig = PLANS[subscription.plan_type] || PLANS.free;
          
          // Get subscription period end from Stripe
          if (invoice.subscription) {
            const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const expiresAt = new Date(stripeSubscription.current_period_end * 1000).toISOString();
            
            // Refresh credits and reset usage for new billing cycle
            const { error: updateError } = await supabaseAdmin
              .from("subscriptions")
              .update({
                renewed_at: new Date().toISOString(),
                expires_at: expiresAt,
                valid_until: expiresAt,
                credits_remaining: planConfig.monthlyCredits,
                generation_count_today: 0,
                converted_3d_this_month: 0,
                daily_reset_date: new Date().toISOString().split('T')[0],
                monthly_reset_date: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq("user_id", subscription.user_id);
            
            if (updateError) {
              logStep("Error updating subscription for renewal", { error: updateError.message });
              return new Response("Error updating subscription", { status: 500 });
            }
            
            logStep("Subscription renewed successfully", {
              userId: subscription.user_id,
              creditsRefreshed: planConfig.monthlyCredits,
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
