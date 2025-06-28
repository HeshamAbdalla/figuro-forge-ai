
-- Create RLS policies for security_audit_log table (critical missing policy)
CREATE POLICY "Users can view their own security events" ON public.security_audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can log all security events" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for security_monitoring table
CREATE POLICY "Admins can view all security monitoring" ON public.security_monitoring
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "System can create security monitoring entries" ON public.security_monitoring
  FOR INSERT WITH CHECK (true);

-- Create an admin user role (critical - no admin users exist)
-- First, we need to insert a user role for an existing user
-- You'll need to replace 'your-email@example.com' with an actual user email from auth.users
-- For now, let's create a function to make any user an admin

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email in auth.users (this requires service role)
  -- Since we can't directly query auth.users, we'll use the user_id parameter instead
  -- The admin will need to call this function with a known user ID
  RETURN FALSE; -- Placeholder - will be updated in code
END;
$$;

-- Alternative: Create admin role assignment function using user ID
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if called by an existing admin or if no admins exist
  IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin') OR public.is_admin_user() THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.comprehensive_security_check()
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
BEGIN
  -- Check admin count
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
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
  
  result := jsonb_build_object(
    'timestamp', NOW(),
    'admin_count', admin_count,
    'recent_failures', recent_failures,
    'suspicious_unlimited_users', suspicious_unlimited_users,
    'critical_issues', CASE 
      WHEN admin_count = 0 THEN jsonb_build_array('NO_ADMIN_USERS')
      WHEN suspicious_unlimited_users > 0 THEN jsonb_build_array('UNAUTHORIZED_UNLIMITED_USERS')
      ELSE jsonb_build_array()
    END,
    'security_score', CASE
      WHEN admin_count = 0 THEN 20
      WHEN suspicious_unlimited_users > 0 THEN 40
      WHEN recent_failures > 10 THEN 60
      ELSE 85
    END
  );
  
  RETURN result;
END;
$$;

-- Update the security health check function to be more comprehensive
DROP FUNCTION IF EXISTS public.security_health_check();
CREATE OR REPLACE FUNCTION public.security_health_check()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.comprehensive_security_check();
END;
$$;
