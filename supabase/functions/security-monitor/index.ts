
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SECURITY-MONITOR] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Security monitoring check initiated");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const alerts = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check 1: Users with unlimited plans but no payment records
    logStep("Checking for unlimited plans without payments");
    const { data: suspiciousUsers, error: suspiciousError } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        user_id,
        plan_type,
        stripe_customer_id,
        stripe_subscription_id,
        created_at,
        updated_at
      `)
      .eq("plan_type", "unlimited")
      .or("stripe_customer_id.is.null,stripe_subscription_id.is.null");

    if (suspiciousError) {
      logStep("Error checking suspicious users", { error: suspiciousError.message });
    } else if (suspiciousUsers && suspiciousUsers.length > 0) {
      alerts.push({
        type: "CRITICAL",
        category: "UNAUTHORIZED_UNLIMITED_PLANS",
        count: suspiciousUsers.length,
        details: suspiciousUsers,
        description: "Users with unlimited plans but no Stripe payment records"
      });
      logStep("CRITICAL: Found users with unlimited plans but no payments", { count: suspiciousUsers.length });
    }

    // Check 2: Recent security events with failures
    logStep("Checking recent security events");
    const { data: failedEvents, error: eventsError } = await supabaseAdmin
      .from("security_audit_log")
      .select("*")
      .eq("success", false)
      .gte("created_at", oneHourAgo.toISOString())
      .order("created_at", { ascending: false });

    if (eventsError) {
      logStep("Error checking security events", { error: eventsError.message });
    } else if (failedEvents && failedEvents.length > 0) {
      const groupedEvents = failedEvents.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {});

      alerts.push({
        type: "WARNING",
        category: "FAILED_SECURITY_EVENTS",
        count: failedEvents.length,
        groupedEvents,
        description: "Recent failed security events detected"
      });
      logStep("WARNING: Found recent failed security events", { count: failedEvents.length, types: groupedEvents });
    }

    // Check 3: Payment sessions that expired without completion
    logStep("Checking expired payment sessions");
    const { data: expiredSessions, error: expiredError } = await supabaseAdmin
      .from("payment_sessions")
      .select("*")
      .eq("payment_status", "pending")
      .lt("expires_at", now.toISOString());

    if (expiredError) {
      logStep("Error checking expired sessions", { error: expiredError.message });
    } else if (expiredSessions && expiredSessions.length > 0) {
      alerts.push({
        type: "INFO",
        category: "EXPIRED_PAYMENT_SESSIONS",
        count: expiredSessions.length,
        description: "Payment sessions that expired without completion"
      });
      logStep("INFO: Found expired payment sessions", { count: expiredSessions.length });
    }

    // Check 4: Rate limit violations
    logStep("Checking rate limit violations");
    const { data: rateLimitViolations, error: rateLimitError } = await supabaseAdmin
      .from("rate_limits")
      .select("*")
      .gte("request_count", 50) // Threshold for suspicious activity
      .gte("window_start", oneHourAgo.toISOString());

    if (rateLimitError) {
      logStep("Error checking rate limits", { error: rateLimitError.message });
    } else if (rateLimitViolations && rateLimitViolations.length > 0) {
      alerts.push({
        type: "WARNING",
        category: "RATE_LIMIT_VIOLATIONS",
        count: rateLimitViolations.length,
        description: "High request counts detected (potential abuse)"
      });
      logStep("WARNING: Found rate limit violations", { count: rateLimitViolations.length });
    }

    // Record security monitoring results
    const monitoringResult = {
      timestamp: now.toISOString(),
      alerts_count: alerts.length,
      critical_alerts: alerts.filter(a => a.type === "CRITICAL").length,
      warning_alerts: alerts.filter(a => a.type === "WARNING").length,
      info_alerts: alerts.filter(a => a.type === "INFO").length,
      status: alerts.some(a => a.type === "CRITICAL") ? "CRITICAL" : 
              alerts.some(a => a.type === "WARNING") ? "WARNING" : "OK"
    };

    // Store monitoring result
    const { error: monitoringError } = await supabaseAdmin
      .from("security_monitoring")
      .insert({
        check_type: "automated_security_scan",
        status: monitoringResult.status,
        details: {
          ...monitoringResult,
          alerts: alerts
        }
      });

    if (monitoringError) {
      logStep("Error storing monitoring result", { error: monitoringError.message });
    }

    // If critical alerts, also log as security event
    if (alerts.some(a => a.type === "CRITICAL")) {
      await supabaseAdmin.rpc('log_security_event', {
        p_user_id: null,
        p_event_type: 'security_monitoring_critical_alert',
        p_event_details: { alerts: alerts.filter(a => a.type === "CRITICAL") },
        p_ip_address: null,
        p_user_agent: 'Security-Monitor',
        p_success: true
      });
    }

    logStep("Security monitoring completed", monitoringResult);

    return new Response(JSON.stringify({
      success: true,
      monitoring_result: monitoringResult,
      alerts: alerts
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Error in security monitoring", { error: error instanceof Error ? error.message : String(error) });
    console.error(`Error in security monitoring: ${error instanceof Error ? error.message : String(error)}`);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
