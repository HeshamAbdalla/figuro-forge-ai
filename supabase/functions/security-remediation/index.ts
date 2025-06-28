
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SECURITY-REMEDIATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Security remediation initiated");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get request body for specific user remediation
    const body = await req.json();
    const { action, user_email, user_id } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: "Action required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let results = [];

    switch (action) {
      case "remediate_specific_user":
        if (!user_email && !user_id) {
          return new Response(JSON.stringify({ error: "User email or ID required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        logStep("Remediating specific user", { user_email, user_id });

        // Find user subscription
        let query = supabaseAdmin.from("subscriptions").select("*");
        if (user_id) {
          query = query.eq("user_id", user_id);
        } else {
          // Need to join with profiles to find by email
          const { data: profiles } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("id", user_id); // This would need to be adjusted based on how you store email
          
          if (!profiles || profiles.length === 0) {
            return new Response(JSON.stringify({ error: "User not found" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 404,
            });
          }
          query = query.eq("user_id", profiles[0].id);
        }

        const { data: userSub, error: userSubError } = await query.single();

        if (userSubError || !userSub) {
          return new Response(JSON.stringify({ error: "User subscription not found" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          });
        }

        // Check if user has unlimited plan without payment
        if (userSub.plan_type === 'unlimited' && (!userSub.stripe_customer_id || !userSub.stripe_subscription_id)) {
          logStep("CRITICAL: Found unauthorized unlimited plan", { userId: userSub.user_id });

          // Downgrade to free plan
          const { error: downgradeError } = await supabaseAdmin
            .from("subscriptions")
            .update({
              plan_type: 'free',
              credits_remaining: 3,
              bonus_credits: 0,
              generation_count_today: 0,
              converted_3d_this_month: 0,
              generation_count_this_month: 0,
              stripe_customer_id: null,
              stripe_subscription_id: null,
              stripe_price_id: null,
              valid_until: null,
              expires_at: null,
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq("user_id", userSub.user_id);

          if (downgradeError) {
            logStep("Error downgrading user", { error: downgradeError.message });
            results.push({
              action: "downgrade_user",
              success: false,
              error: downgradeError.message,
              user_id: userSub.user_id
            });
          } else {
            logStep("Successfully downgraded unauthorized user to free plan", { userId: userSub.user_id });
            
            // Log security remediation
            await supabaseAdmin.rpc('log_security_event', {
              p_user_id: userSub.user_id,
              p_event_type: 'security_remediation_downgrade',
              p_event_details: {
                original_plan: 'unlimited',
                new_plan: 'free',
                reason: 'unauthorized_unlimited_access',
                remediation_timestamp: new Date().toISOString()
              },
              p_ip_address: null,
              p_user_agent: 'Security-Remediation',
              p_success: true
            });

            results.push({
              action: "downgrade_user",
              success: true,
              user_id: userSub.user_id,
              previous_plan: userSub.plan_type,
              new_plan: 'free'
            });
          }
        } else {
          results.push({
            action: "check_user",
            success: true,
            user_id: userSub.user_id,
            status: "user_plan_appears_legitimate",
            plan: userSub.plan_type,
            has_stripe_customer: !!userSub.stripe_customer_id,
            has_stripe_subscription: !!userSub.stripe_subscription_id
          });
        }
        break;

      case "audit_all_unlimited_users":
        logStep("Auditing all unlimited plan users");

        const { data: unlimitedUsers, error: unlimitedError } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("plan_type", "unlimited");

        if (unlimitedError) {
          return new Response(JSON.stringify({ error: unlimitedError.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }

        for (const user of unlimitedUsers || []) {
          if (!user.stripe_customer_id || !user.stripe_subscription_id) {
            logStep("CRITICAL: Found unauthorized unlimited user", { userId: user.user_id });
            
            // Downgrade unauthorized user
            const { error: downgradeError } = await supabaseAdmin
              .from("subscriptions")
              .update({
                plan_type: 'free',
                credits_remaining: 3,
                bonus_credits: 0,
                generation_count_today: 0,
                converted_3d_this_month: 0,
                generation_count_this_month: 0,
                stripe_customer_id: null,
                stripe_subscription_id: null,
                stripe_price_id: null,
                valid_until: null,
                expires_at: null,
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq("user_id", user.user_id);

            if (!downgradeError) {
              // Log security remediation
              await supabaseAdmin.rpc('log_security_event', {
                p_user_id: user.user_id,
                p_event_type: 'security_remediation_mass_downgrade',
                p_event_details: {
                  original_plan: 'unlimited',
                  new_plan: 'free',
                  reason: 'unauthorized_unlimited_access_mass_remediation',
                  remediation_timestamp: new Date().toISOString()
                },
                p_ip_address: null,
                p_user_agent: 'Security-Remediation',
                p_success: true
              });
            }

            results.push({
              action: "downgrade_unauthorized_user",
              success: !downgradeError,
              user_id: user.user_id,
              error: downgradeError?.message,
              previous_plan: 'unlimited',
              new_plan: 'free'
            });
          } else {
            results.push({
              action: "validate_legitimate_user",
              success: true,
              user_id: user.user_id,
              status: "legitimate_unlimited_user",
              stripe_customer_id: user.stripe_customer_id,
              stripe_subscription_id: user.stripe_subscription_id
            });
          }
        }
        break;

      case "security_health_check":
        logStep("Performing comprehensive security health check");

        // Get security health from database function
        const { data: healthCheck, error: healthError } = await supabaseAdmin
          .rpc('security_health_check');

        if (healthError) {
          return new Response(JSON.stringify({ error: healthError.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }

        results.push({
          action: "security_health_check",
          success: true,
          health_report: healthCheck
        });
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }

    // Record remediation action
    const { error: recordError } = await supabaseAdmin
      .from("security_monitoring")
      .insert({
        check_type: "security_remediation",
        status: results.some(r => !r.success) ? "PARTIAL_SUCCESS" : "SUCCESS",
        details: {
          action,
          results,
          timestamp: new Date().toISOString(),
          user_email,
          user_id
        }
      });

    if (recordError) {
      logStep("Error recording remediation action", { error: recordError.message });
    }

    logStep("Security remediation completed", { action, results_count: results.length });

    return new Response(JSON.stringify({
      success: true,
      action,
      results,
      summary: {
        total_actions: results.length,
        successful_actions: results.filter(r => r.success).length,
        failed_actions: results.filter(r => !r.success).length
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Error in security remediation", { error: error instanceof Error ? error.message : String(error) });
    console.error(`Error in security remediation: ${error instanceof Error ? error.message : String(error)}`);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
