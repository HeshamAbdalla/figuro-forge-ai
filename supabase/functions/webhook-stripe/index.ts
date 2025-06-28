import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Plan configuration with strict validation - MUST match create-checkout
const PLANS = {
  free: { monthlyCredits: 3, order: 0, maxAmount: 0 },
  starter: { monthlyCredits: 25, order: 1, maxAmount: 1299 },
  pro: { monthlyCredits: 120, order: 2, maxAmount: 2999 },
  unlimited: { monthlyCredits: 999999, order: 3, maxAmount: 5999 },
};

// SECURITY: Strict price ID validation with live Stripe price IDs
const PRICE_TO_PLAN = {
  'price_1Rbr6rFmCMNpEEexgSZiJaKZ': 'starter',
  'price_1Rbr6rFmCMNpEEFyJpgHJmxA': 'pro', 
  'price_1Rbr6rFmCMNpEEF0dVqHyTgN': 'unlimited'
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-STRIPE-SECURE] ${step}${detailsStr}`);
};

// Enhanced security logging
const logSecurityEvent = async (supabaseAdmin: any, eventType: string, details: any, success: boolean = true) => {
  try {
    await supabaseAdmin.rpc('log_security_event', {
      p_user_id: details.user_id || null,
      p_event_type: eventType,
      p_event_details: details,
      p_ip_address: null,
      p_user_agent: 'Stripe-Webhook',
      p_success: success
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Enhanced plan validation with security checks
const validatePlanTransition = (oldPlan: string, newPlan: string, paidAmount: number): boolean => {
  const oldConfig = PLANS[oldPlan];
  const newConfig = PLANS[newPlan];
  
  if (!oldConfig || !newConfig) {
    logStep("SECURITY: Invalid plan in transition", { oldPlan, newPlan });
    return false;
  }
  
  // Free plans should not have payments
  if (newPlan === 'free' && paidAmount > 0) {
    logStep("SECURITY: Free plan with payment detected", { newPlan, paidAmount });
    return false;
  }
  
  // Paid plans must have appropriate payment amounts
  if (newPlan !== 'free' && paidAmount < newConfig.maxAmount * 0.8) { // Allow 20% variance for promotions
    logStep("SECURITY: Insufficient payment for plan", { newPlan, paidAmount, expected: newConfig.maxAmount });
    return false;
  }
  
  return true;
};

serve(async (req) => {
  try {
    logStep("Webhook received with enhanced security");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      logStep("SECURITY: No signature header in webhook");
      return new Response("No signature header", { status: 400 });
    }
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("CRITICAL: STRIPE_WEBHOOK_SECRET is not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep(`SECURITY: Webhook signature verification failed`, { error: err instanceof Error ? err.message : String(err) });
      return new Response("Webhook signature verification failed", { status: 400 });
    }
    
    logStep("Webhook verified securely", { type: event.type });
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Enhanced plan determination with strict validation
    const determinePlanFromPrice = async (priceId: string): Promise<{ planType: string; planConfig: any; paidAmount: number }> => {
      logStep("SECURITY: Validating price ID", { priceId });
      
      // CRITICAL: Only allow pre-approved price IDs
      if (PRICE_TO_PLAN[priceId]) {
        const planType = PRICE_TO_PLAN[priceId];
        const planConfig = PLANS[planType];
        logStep("SECURITY: Valid price ID confirmed", { priceId, planType });
        
        // Get the actual amount paid from Stripe
        try {
          const price = await stripe.prices.retrieve(priceId);
          const paidAmount = price.unit_amount || 0;
          
          return { planType, planConfig, paidAmount };
        } catch (error) {
          logStep("SECURITY: Failed to retrieve price details", { priceId, error: error.message });
          throw new Error("Invalid price configuration");
        }
      }
      
      logStep("SECURITY: UNAUTHORIZED PRICE ID DETECTED", { priceId });
      await logSecurityEvent(supabaseAdmin, 'webhook_unauthorized_price', { priceId }, false);
      throw new Error(`Unauthorized price ID: ${priceId}`);
    };

    // Enhanced plan switching logic with proportional credit preservation
    const handleEnhancedPlanSwitch = async (userId: string, newPlan: string, oldPlan: string, stripeData: any) => {
      const newPlanConfig = PLANS[newPlan];
      const oldPlanConfig = PLANS[oldPlan];
      
      logStep("Processing enhanced plan switch", { userId, oldPlan, newPlan });
      
      // Get current subscription data
      const { data: currentSub } = await supabaseAdmin
        .from("subscriptions")
        .select("credits_remaining, generation_count_today, converted_3d_this_month, generation_count_this_month, monthly_reset_date, bonus_credits")
        .eq("user_id", userId)
        .single();
      
      if (!currentSub) {
        logStep("No current subscription found, creating new one");
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan_type: newPlan,
            stripe_price_id: stripeData.priceId,
            stripe_subscription_id: stripeData.subscriptionId,
            credits_remaining: newPlanConfig.monthlyCredits,
            valid_until: stripeData.validUntil,
            expires_at: stripeData.validUntil,
            status: 'active',
            bonus_credits: 0,
            generation_count_today: 0,
            converted_3d_this_month: 0,
            generation_count_this_month: 0,
            daily_reset_date: new Date().toISOString().split('T')[0],
            monthly_reset_date: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          logStep("Error creating new subscription", { error: error.message });
          throw error;
        }
        return;
      }

      // Calculate days remaining in current billing cycle
      const now = new Date();
      const monthlyResetDate = new Date(currentSub.monthly_reset_date);
      const nextResetDate = new Date(monthlyResetDate);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      
      const totalDaysInCycle = Math.ceil((nextResetDate.getTime() - monthlyResetDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.ceil((nextResetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const proportionRemaining = Math.max(0, Math.min(1, daysRemaining / totalDaysInCycle));
      
      logStep("Billing cycle calculation", { 
        totalDaysInCycle, 
        daysRemaining, 
        proportionRemaining,
        monthlyResetDate: monthlyResetDate.toISOString(),
        nextResetDate: nextResetDate.toISOString()
      });

      let newCredits = newPlanConfig.monthlyCredits;
      let bonusCredits = currentSub.bonus_credits || 0;
      let resetUsage = false;

      // Enhanced plan switching logic
      if (newPlanConfig.order > oldPlanConfig.order) {
        // UPGRADE: Calculate proportional credits for remaining period
        const remainingOldPlanCredits = Math.floor(oldPlanConfig.monthlyCredits * proportionRemaining);
        const remainingNewPlanCredits = Math.floor(newPlanConfig.monthlyCredits * proportionRemaining);
        
        // Give the higher of current remaining credits or proportional new plan credits
        const currentRemaining = currentSub.credits_remaining || 0;
        const creditDifference = remainingNewPlanCredits - remainingOldPlanCredits;
        
        if (creditDifference > 0) {
          // Add the difference as bonus credits to preserve the upgrade benefit
          bonusCredits += creditDifference;
          newCredits = Math.max(currentRemaining, remainingNewPlanCredits);
        } else {
          // Keep existing credits if they're higher
          newCredits = Math.max(currentRemaining, remainingNewPlanCredits);
        }
        
        resetUsage = true; // Reset usage limits on upgrade
        logStep("Plan upgrade processed", { 
          currentRemaining,
          remainingOldPlanCredits,
          remainingNewPlanCredits,
          creditDifference,
          newCredits,
          bonusCredits
        });
        
      } else if (newPlanConfig.order < oldPlanConfig.order) {
        // DOWNGRADE: Preserve proportional credits but cap to new plan limits
        const remainingOldPlanCredits = Math.floor(oldPlanConfig.monthlyCredits * proportionRemaining);
        const remainingNewPlanCredits = Math.floor(newPlanConfig.monthlyCredits * proportionRemaining);
        const currentRemaining = currentSub.credits_remaining || 0;
        
        // Calculate what user should have with new plan for remaining period
        const proportionalNewPlanCredits = Math.min(currentRemaining, remainingNewPlanCredits);
        
        // If they have more credits than new plan allows, preserve excess as bonus for this cycle only
        if (currentRemaining > remainingNewPlanCredits) {
          const excessCredits = currentRemaining - remainingNewPlanCredits;
          bonusCredits += excessCredits;
          newCredits = remainingNewPlanCredits;
        } else {
          newCredits = currentRemaining;
        }
        
        logStep("Plan downgrade processed", { 
          currentRemaining,
          remainingOldPlanCredits,
          remainingNewPlanCredits,
          proportionalNewPlanCredits,
          excessCredits: currentRemaining - remainingNewPlanCredits,
          newCredits,
          bonusCredits
        });
        
      } else {
        // SAME PLAN: Just update metadata
        newCredits = currentSub.credits_remaining || newPlanConfig.monthlyCredits;
        logStep("Same plan renewal", { preservedCredits: newCredits });
      }
      
      // Update subscription with new plan data
      const updateData = {
        plan_type: newPlan,
        stripe_price_id: stripeData.priceId,
        stripe_subscription_id: stripeData.subscriptionId,
        credits_remaining: newCredits,
        bonus_credits: bonusCredits,
        valid_until: stripeData.validUntil,
        expires_at: stripeData.validUntil,
        status: 'active',
        updated_at: new Date().toISOString(),
        ...(resetUsage && {
          generation_count_today: 0,
          converted_3d_this_month: 0,
          generation_count_this_month: 0,
          daily_reset_date: new Date().toISOString().split('T')[0],
          monthly_reset_date: new Date().toISOString().split('T')[0].substring(0, 7) + '-01'
        })
      };
      
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update(updateData)
        .eq("user_id", userId);
      
      if (error) {
        logStep("Error updating subscription for enhanced plan switch", { error: error.message });
        throw error;
      }
      
      logStep("Enhanced plan switch completed successfully", { 
        newPlan, 
        newCredits, 
        bonusCredits,
        totalAvailableCredits: newCredits + bonusCredits
      });
    };
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        logStep("Processing checkout.session.completed with enhanced security", { sessionId: session.id });
        
        const userId = session.metadata?.userId;
        const planType = session.metadata?.plan;
        const commercialLicense = session.metadata?.commercialLicense === 'true';
        const additionalConversions = parseInt(session.metadata?.additionalConversions || '0', 10);
        
        // Enhanced validation
        if (!userId || !planType) {
          logStep("SECURITY: Missing critical metadata in checkout session", { userId, planType });
          await logSecurityEvent(supabaseAdmin, 'webhook_missing_metadata', { sessionId: session.id, userId, planType }, false);
          return new Response("Missing metadata", { status: 400 });
        }
        
        const subscriptionId = session.subscription;
        if (!subscriptionId) {
          logStep("SECURITY: No subscription ID in checkout session");
          await logSecurityEvent(supabaseAdmin, 'webhook_missing_subscription', { sessionId: session.id, userId }, false);
          return new Response("No subscription ID", { status: 400 });
        }
        
        // Enhanced subscription validation
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const validUntil = new Date(subscription.current_period_end * 1000).toISOString();
        const priceId = subscription.items.data[0].price.id;
        
        // CRITICAL: Validate price ID and plan match
        const { planType: validatedPlan, planConfig, paidAmount } = await determinePlanFromPrice(priceId);
        
        if (validatedPlan !== planType) {
          logStep("SECURITY: Plan mismatch detected", { 
            sessionPlan: planType, 
            validatedPlan, 
            priceId,
            userId 
          });
          await logSecurityEvent(supabaseAdmin, 'webhook_plan_mismatch', {
            sessionPlan: planType,
            validatedPlan,
            priceId,
            userId,
            sessionId: session.id
          }, false);
          return new Response("Plan validation failed", { status: 400 });
        }
        
        // Validate payment amount
        if (!validatePlanTransition('free', validatedPlan, paidAmount)) {
          logStep("SECURITY: Invalid plan transition detected", { 
            plan: validatedPlan, 
            paidAmount,
            userId 
          });
          await logSecurityEvent(supabaseAdmin, 'webhook_invalid_transition', {
            plan: validatedPlan,
            paidAmount,
            userId,
            sessionId: session.id
          }, false);
          return new Response("Invalid plan transition", { status: 400 });
        }
        
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            plan_type: validatedPlan,
            commercial_license: commercialLicense,
            additional_conversions: additionalConversions,
            valid_until: validUntil,
            expires_at: validUntil,
            renewed_at: new Date().toISOString(),
            status: 'active',
            credits_remaining: planConfig.monthlyCredits,
            bonus_credits: 0,
            generation_count_today: 0,
            converted_3d_this_month: 0,
            generation_count_this_month: 0,
            daily_reset_date: new Date().toISOString().split('T')[0],
            monthly_reset_date: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (updateError) {
          logStep("SECURITY: Error updating subscription in database", { error: updateError.message });
          await logSecurityEvent(supabaseAdmin, 'webhook_database_error', {
            error: updateError.message,
            userId,
            sessionId: session.id
          }, false);
          return new Response("Error updating subscription", { status: 500 });
        }
        
        await logSecurityEvent(supabaseAdmin, 'webhook_subscription_created', {
          userId,
          plan: validatedPlan,
          credits: planConfig.monthlyCredits,
          priceId,
          paidAmount,
          sessionId: session.id
        });
        
        logStep("Subscription created successfully with enhanced security", { 
          userId, 
          planType: validatedPlan, 
          credits: planConfig.monthlyCredits, 
          priceId 
        });
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        logStep("Processing subscription.updated with enhanced security", { subscriptionId: subscription.id, status: subscription.status });
        
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0].price.id;
        
        // Enhanced plan determination with security validation
        const { planType: newPlan, paidAmount } = await determinePlanFromPrice(priceId);
        
        // Find user by customer ID
        const { data: currentSub, error: subError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, plan_type")
          .eq("stripe_customer_id", customerId)
          .single();
        
        if (subError || !currentSub) {
          logStep("SECURITY: Could not find subscription for customer", { customerId, error: subError?.message });
          await logSecurityEvent(supabaseAdmin, 'webhook_customer_not_found', { customerId }, false);
          return new Response("Subscription not found", { status: 404 });
        }
        
        const oldPlan = currentSub.plan_type;
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        const validUntil = isActive ? new Date(subscription.current_period_end * 1000).toISOString() : null;
        
        // Enhanced plan transition validation
        if (newPlan !== oldPlan && isActive) {
          if (!validatePlanTransition(oldPlan, newPlan, paidAmount)) {
            logStep("SECURITY: Invalid plan transition in subscription update", { 
              oldPlan, 
              newPlan, 
              paidAmount,
              userId: currentSub.user_id 
            });
            await logSecurityEvent(supabaseAdmin, 'webhook_invalid_plan_change', {
              oldPlan,
              newPlan,
              paidAmount,
              userId: currentSub.user_id,
              subscriptionId: subscription.id
            }, false);
            return new Response("Invalid plan change", { status: 400 });
          }
          
          await logSecurityEvent(supabaseAdmin, 'webhook_plan_change_validated', {
            oldPlan,
            newPlan,
            paidAmount,
            userId: currentSub.user_id,
            subscriptionId: subscription.id
          });
        }
        
        // Update subscription with enhanced security logging
        const updateData = {
          plan_type: newPlan,
          stripe_price_id: priceId,
          status: isActive ? 'active' : 'cancelled',
          valid_until: validUntil,
          expires_at: validUntil,
          updated_at: new Date().toISOString()
        };
        
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update(updateData)
          .eq("user_id", currentSub.user_id);
        
        if (updateError) {
          logStep("SECURITY: Error updating subscription", { error: updateError.message });
          await logSecurityEvent(supabaseAdmin, 'webhook_update_error', {
            error: updateError.message,
            userId: currentSub.user_id,
            subscriptionId: subscription.id
          }, false);
        }
        
        logStep("Subscription updated successfully with security validation", { 
          newPlan, 
          userId: currentSub.user_id,
          status: subscription.status 
        });
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        logStep("Processing invoice.payment_succeeded with enhanced security", { 
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
            logStep("SECURITY: Could not find subscription for renewal", { 
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
            
            // Refresh credits and reset usage for new billing cycle (clear bonus credits on renewal)
            const { error: updateError } = await supabaseAdmin
              .from("subscriptions")
              .update({
                renewed_at: new Date().toISOString(),
                expires_at: expiresAt,
                valid_until: expiresAt,
                credits_remaining: planConfig.monthlyCredits,
                bonus_credits: 0, // Clear bonus credits on renewal
                generation_count_today: 0,
                converted_3d_this_month: 0,
                generation_count_this_month: 0,
                daily_reset_date: new Date().toISOString().split('T')[0],
                monthly_reset_date: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq("user_id", subscription.user_id);
            
            if (updateError) {
              logStep("SECURITY: Error updating subscription for renewal", { error: updateError.message });
              return new Response("Error updating subscription", { status: 500 });
            }
            
            logStep("Subscription renewed successfully", {
              userId: subscription.user_id,
              creditsRefreshed: planConfig.monthlyCredits,
              bonusCreditsCleared: true,
              expiresAt
            });
          }
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        logStep("Processing invoice.payment_failed with enhanced security", { 
          invoiceId: invoice.id, 
          customerId: invoice.customer 
        });
        
        const { data: subscription, error: subError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", invoice.customer)
          .single();
        
        if (subError || !subscription) {
          logStep("SECURITY: Could not find subscription for failed payment", { 
            customerId: invoice.customer, 
            error: subError?.message 
          });
          return new Response("Subscription not found", { status: 404 });
        }
        
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq("user_id", subscription.user_id);
        
        if (updateError) {
          logStep("SECURITY: Error updating subscription for failed payment", { error: updateError.message });
          return new Response("Error updating subscription", { status: 500 });
        }
        
        logStep("Subscription marked as past due with security validation", { userId: subscription.user_id });
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        logStep("Processing customer.subscription.deleted with enhanced security", { subscriptionId: subscription.id });
        
        const customerId = subscription.customer;
        
        const { data: userData, error: userError } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();
        
        if (userError || !userData) {
          logStep("SECURITY: Could not find user for customer", { customerId, error: userError?.message });
          return new Response("User not found", { status: 404 });
        }
        
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            plan_type: 'free',
            stripe_subscription_id: null,
            valid_until: null,
            expires_at: null,
            commercial_license: false,
            additional_conversions: 0,
            credits_remaining: 3,
            bonus_credits: 0,
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userData.user_id);
        
        if (updateError) {
          logStep("SECURITY: Error downgrading to free plan", { error: updateError.message });
          return new Response("Error downgrading subscription", { status: 500 });
        }
        
        logStep("Downgraded to free plan with security validation", { userId: userData.user_id });
        break;
      }
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("SECURITY ERROR processing webhook", { error: error instanceof Error ? error.message : String(error) });
    console.error(`SECURITY ERROR in webhook: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(`Server error: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
});
