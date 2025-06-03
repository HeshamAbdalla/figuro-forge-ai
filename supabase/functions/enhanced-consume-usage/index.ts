
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ENHANCED-CONSUME-USAGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { feature_type, amount = 1 } = await req.json();
    if (!feature_type) throw new Error("feature_type is required");

    logStep("Processing usage consumption", { userId: user.id, feature_type, amount });

    // Get user subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      logStep("Error fetching subscription", { error: subError.message });
      throw new Error(`Error fetching subscription: ${subError.message}`);
    }

    // Create default subscription if none exists
    if (!subscription) {
      logStep("Creating default subscription");
      const { data: newSub, error: createError } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_type: 'free',
          generation_count_today: 0,
          converted_3d_this_month: 0,
          generation_count_this_month: 0,
          credits_remaining: 3,
          bonus_credits: 0,
          status: 'active',
          daily_reset_date: new Date().toISOString().split('T')[0],
          monthly_reset_date: new Date().toISOString().split('T')[0].substring(0, 7) + '-01'
        })
        .select()
        .single();

      if (createError) {
        logStep("Error creating subscription", { error: createError.message });
        throw new Error(`Error creating subscription: ${createError.message}`);
      }
      
      const totalCredits = newSub.credits_remaining + (newSub.bonus_credits || 0);
      return new Response(JSON.stringify({
        success: true,
        credits_remaining: newSub.credits_remaining,
        bonus_credits: newSub.bonus_credits || 0,
        total_credits: totalCredits
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Get plan limits
    const { data: planLimits, error: limitsError } = await supabaseAdmin
      .from("plan_limits")
      .select("*")
      .eq("plan_type", subscription.plan_type)
      .single();

    const limits = planLimits || {
      image_generations_limit: 3,
      model_conversions_limit: 1,
      is_unlimited: false
    };

    logStep("Current state", {
      plan: subscription.plan_type,
      credits_remaining: subscription.credits_remaining,
      bonus_credits: subscription.bonus_credits || 0,
      is_unlimited: limits.is_unlimited
    });

    // For unlimited plans, allow consumption without limits
    if (limits.is_unlimited) {
      logStep("Unlimited plan detected, allowing consumption");
      return new Response(JSON.stringify({
        success: true,
        unlimited: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Check if user has enough credits (including bonus credits)
    const totalAvailableCredits = subscription.credits_remaining + (subscription.bonus_credits || 0);
    
    if (totalAvailableCredits < amount) {
      logStep("Insufficient credits", {
        requested: amount,
        available: totalAvailableCredits,
        regular: subscription.credits_remaining,
        bonus: subscription.bonus_credits || 0
      });
      
      return new Response(JSON.stringify({
        success: false,
        error: "Insufficient credits",
        credits_remaining: subscription.credits_remaining,
        bonus_credits: subscription.bonus_credits || 0,
        total_credits: totalAvailableCredits
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Consume credits (bonus credits first, then regular credits)
    let remainingAmount = amount;
    let newBonusCredits = subscription.bonus_credits || 0;
    let newRegularCredits = subscription.credits_remaining;

    // First consume bonus credits
    if (newBonusCredits > 0 && remainingAmount > 0) {
      const bonusToConsume = Math.min(newBonusCredits, remainingAmount);
      newBonusCredits -= bonusToConsume;
      remainingAmount -= bonusToConsume;
      logStep("Consumed bonus credits", { consumed: bonusToConsume, remaining: newBonusCredits });
    }

    // Then consume regular credits if needed
    if (remainingAmount > 0) {
      newRegularCredits -= remainingAmount;
      logStep("Consumed regular credits", { consumed: remainingAmount, remaining: newRegularCredits });
    }

    // Update subscription counters
    const updateData: any = {
      credits_remaining: newRegularCredits,
      bonus_credits: newBonusCredits,
      updated_at: new Date().toISOString()
    };

    // Update feature-specific counters for tracking
    if (feature_type === 'image_generation') {
      updateData.generation_count_today = subscription.generation_count_today + amount;
      updateData.generation_count_this_month = subscription.generation_count_this_month + amount;
      updateData.last_generated_at = new Date().toISOString();
    } else if (feature_type === 'model_conversion') {
      updateData.converted_3d_this_month = subscription.converted_3d_this_month + amount;
    }

    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", user.id);

    if (updateError) {
      logStep("Error updating subscription", { error: updateError.message });
      throw new Error(`Error updating subscription: ${updateError.message}`);
    }

    const newTotalCredits = newRegularCredits + newBonusCredits;
    
    logStep("Successfully consumed credits", {
      consumed: amount,
      new_regular: newRegularCredits,
      new_bonus: newBonusCredits,
      new_total: newTotalCredits
    });

    return new Response(JSON.stringify({
      success: true,
      credits_remaining: newRegularCredits,
      bonus_credits: newBonusCredits,
      total_credits: newTotalCredits
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
