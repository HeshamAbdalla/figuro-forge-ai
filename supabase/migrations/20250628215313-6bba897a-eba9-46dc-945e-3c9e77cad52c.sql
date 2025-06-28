
-- Phase 1: Critical RLS Policy Fixes
-- Enable RLS on all critical tables that don't have it
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for security_audit_log
DROP POLICY IF EXISTS "Users can view their own security events" ON public.security_audit_log;
DROP POLICY IF EXISTS "System can log all security events" ON public.security_audit_log;

CREATE POLICY "Users can view their own security events" ON public.security_audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can log all security events" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

-- Admin policies for security_audit_log
CREATE POLICY "Admins can view all security events" ON public.security_audit_log
  FOR SELECT USING (public.is_admin_user());

-- Create RLS policies for security_monitoring
DROP POLICY IF EXISTS "Admins can view all security monitoring" ON public.security_monitoring;
DROP POLICY IF EXISTS "System can create security monitoring entries" ON public.security_monitoring;

CREATE POLICY "Admins can view all security monitoring" ON public.security_monitoring
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "System can create security monitoring entries" ON public.security_monitoring
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for payment_sessions
DROP POLICY IF EXISTS "Users can view their own payment sessions" ON public.payment_sessions;
DROP POLICY IF EXISTS "Users can create their own payment sessions" ON public.payment_sessions;

CREATE POLICY "Users can view their own payment sessions" ON public.payment_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment sessions" ON public.payment_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for user_roles table
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Rate limits policies (system only)
CREATE POLICY "System can manage rate limits" ON public.rate_limits
  FOR ALL USING (true);

-- Phase 2: Enhanced Security Functions
-- Create comprehensive security health check function
CREATE OR REPLACE FUNCTION public.enhanced_security_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  admin_count integer;
  recent_failures integer;
  suspicious_unlimited_users integer;
  expired_sessions integer;
  high_rate_limit_users integer;
  critical_issues text[];
  security_score integer;
BEGIN
  -- Initialize critical issues array
  critical_issues := ARRAY[]::text[];
  
  -- Check admin count
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  IF admin_count = 0 THEN
    critical_issues := array_append(critical_issues, 'NO_ADMIN_USERS');
  END IF;
  
  -- Check recent security failures
  SELECT COUNT(*) INTO recent_failures
  FROM public.security_audit_log
  WHERE success = false
  AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Check for suspicious unlimited users without payment
  SELECT COUNT(*) INTO suspicious_unlimited_users
  FROM public.subscriptions
  WHERE plan_type = 'unlimited'
  AND (stripe_customer_id IS NULL OR stripe_subscription_id IS NULL);
  
  IF suspicious_unlimited_users > 0 THEN
    critical_issues := array_append(critical_issues, 'UNAUTHORIZED_UNLIMITED_USERS');
  END IF;
  
  -- Check expired payment sessions
  SELECT COUNT(*) INTO expired_sessions
  FROM public.payment_sessions
  WHERE expires_at < NOW()
  AND payment_status = 'pending';
  
  -- Check high rate limit violations
  SELECT COUNT(DISTINCT user_id) INTO high_rate_limit_users
  FROM public.rate_limits
  WHERE request_count > 100
  AND window_start > NOW() - INTERVAL '1 hour';
  
  -- Calculate security score
  security_score := 100;
  
  IF admin_count = 0 THEN
    security_score := security_score - 30;
  END IF;
  
  IF suspicious_unlimited_users > 0 THEN
    security_score := security_score - 40;
  END IF;
  
  IF recent_failures > 20 THEN
    security_score := security_score - 20;
  ELSIF recent_failures > 10 THEN
    security_score := security_score - 10;
  END IF;
  
  IF high_rate_limit_users > 5 THEN
    security_score := security_score - 10;
  END IF;
  
  -- Ensure minimum score of 0
  security_score := GREATEST(security_score, 0);
  
  result := jsonb_build_object(
    'timestamp', NOW(),
    'admin_count', admin_count,
    'recent_failures', recent_failures,
    'suspicious_unlimited_users', suspicious_unlimited_users,
    'expired_sessions', expired_sessions,
    'high_rate_limit_users', high_rate_limit_users,
    'critical_issues', to_jsonb(critical_issues),
    'security_score', security_score,
    'status', CASE
      WHEN security_score < 30 THEN 'CRITICAL'
      WHEN security_score < 60 THEN 'WARNING'
      ELSE 'HEALTHY'
    END
  );
  
  RETURN result;
END;
$$;

-- Enhanced payment session validation
CREATE OR REPLACE FUNCTION public.validate_payment_session(
  session_id text,
  expected_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_record RECORD;
BEGIN
  -- Get session with validation
  SELECT * INTO session_record
  FROM public.payment_sessions
  WHERE stripe_session_id = session_id
  AND user_id = expected_user_id
  AND expires_at > NOW()
  AND payment_status = 'pending';
  
  -- Return true if valid session found
  RETURN session_record IS NOT NULL;
END;
$$;

-- Automated security cleanup function
CREATE OR REPLACE FUNCTION public.security_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean up expired payment sessions
  DELETE FROM public.payment_sessions 
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits 
  WHERE window_start < NOW() - INTERVAL '24 hours';
  
  -- Clean up old security audit logs (keep 90 days)
  DELETE FROM public.security_audit_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log cleanup completion
  INSERT INTO public.security_monitoring (
    check_type,
    status,
    details
  ) VALUES (
    'automated_cleanup',
    'completed',
    jsonb_build_object(
      'timestamp', NOW(),
      'action', 'security_cleanup_completed'
    )
  );
END;
$$;

-- Enhanced subscription validation function
CREATE OR REPLACE FUNCTION public.validate_subscription_upgrade(
  target_user_id uuid,
  new_plan_type text,
  stripe_customer_id text DEFAULT NULL,
  stripe_subscription_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_sub RECORD;
  is_valid boolean := false;
BEGIN
  -- Get current subscription
  SELECT * INTO current_sub
  FROM public.subscriptions
  WHERE user_id = target_user_id;
  
  -- Validate upgrade rules
  IF new_plan_type = 'free' THEN
    -- Free plan always allowed (downgrade)
    is_valid := true;
  ELSIF new_plan_type IN ('starter', 'pro', 'unlimited') THEN
    -- Paid plans require Stripe validation
    IF stripe_customer_id IS NOT NULL AND stripe_subscription_id IS NOT NULL THEN
      is_valid := true;
    ELSE
      -- Log security violation
      PERFORM public.log_security_event(
        target_user_id,
        'unauthorized_plan_upgrade_attempt',
        jsonb_build_object(
          'target_plan', new_plan_type,
          'current_plan', COALESCE(current_sub.plan_type, 'none'),
          'stripe_customer_id', stripe_customer_id,
          'stripe_subscription_id', stripe_subscription_id
        ),
        NULL,
        NULL,
        false
      );
      is_valid := false;
    END IF;
  ELSE
    -- Invalid plan type
    is_valid := false;
  END IF;
  
  RETURN is_valid;
END;
$$;

-- Create indexes for better security query performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_created ON public.security_audit_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_success_created ON public.security_audit_log(success, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_expires ON public.payment_sessions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_stripe ON public.subscriptions(plan_type, stripe_customer_id, stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_user ON public.rate_limits(window_start, user_id);
