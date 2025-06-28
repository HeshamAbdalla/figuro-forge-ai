
-- Fix critical RLS policy gaps and security definer function vulnerabilities

-- First, ensure all tables have proper RLS enabled
ALTER TABLE public.figurines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remesh_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for figurines table
DROP POLICY IF EXISTS "Users can view their own figurines" ON public.figurines;
DROP POLICY IF EXISTS "Users can create their own figurines" ON public.figurines;
DROP POLICY IF EXISTS "Users can update their own figurines" ON public.figurines;
DROP POLICY IF EXISTS "Users can delete their own figurines" ON public.figurines;
DROP POLICY IF EXISTS "Public figurines are viewable by all" ON public.figurines;

CREATE POLICY "Users can view their own figurines" ON public.figurines
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_public = true AND auth.role() = 'authenticated')
  );

CREATE POLICY "Users can create their own figurines" ON public.figurines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own figurines" ON public.figurines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own figurines" ON public.figurines
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for conversion_tasks table
DROP POLICY IF EXISTS "Users can view their own conversion tasks" ON public.conversion_tasks;
DROP POLICY IF EXISTS "Users can create their own conversion tasks" ON public.conversion_tasks;
DROP POLICY IF EXISTS "Users can update their own conversion tasks" ON public.conversion_tasks;

CREATE POLICY "Users can view their own conversion tasks" ON public.conversion_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversion tasks" ON public.conversion_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversion tasks" ON public.conversion_tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for remesh_tasks table
DROP POLICY IF EXISTS "Users can view their own remesh tasks" ON public.remesh_tasks;
DROP POLICY IF EXISTS "Users can create their own remesh tasks" ON public.remesh_tasks;
DROP POLICY IF EXISTS "Users can update their own remesh tasks" ON public.remesh_tasks;

CREATE POLICY "Users can view their own remesh tasks" ON public.remesh_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own remesh tasks" ON public.remesh_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own remesh tasks" ON public.remesh_tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for payment_sessions table
DROP POLICY IF EXISTS "Users can view their own payment sessions" ON public.payment_sessions;
DROP POLICY IF EXISTS "Users can create their own payment sessions" ON public.payment_sessions;

CREATE POLICY "Users can view their own payment sessions" ON public.payment_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment sessions" ON public.payment_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add missing NOT NULL constraints for security-critical columns
ALTER TABLE public.figurines ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.conversion_tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.remesh_tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN user_id SET NOT NULL;

-- Create admin role management system
CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'moderator');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = check_user_id 
  LIMIT 1;
$$;

-- Security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

-- Admin policies for user_roles table
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Enhanced security monitoring table with better structure
ALTER TABLE public.security_monitoring ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.security_monitoring ADD COLUMN IF NOT EXISTS severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE public.security_monitoring ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance on security-critical queries
CREATE INDEX IF NOT EXISTS idx_figurines_user_id ON public.figurines(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_tasks_user_id ON public.conversion_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_ip ON public.rate_limits(user_id, ip_address);

-- Update existing functions to be more secure
CREATE OR REPLACE FUNCTION public.consume_feature_usage(feature_type text, user_id_param uuid, amount integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_subscription RECORD;
  plan_limits RECORD;
  can_consume BOOLEAN := FALSE;
BEGIN
  -- Security check: ensure user can only consume their own usage
  IF user_id_param != auth.uid() THEN
    RETURN FALSE;
  END IF;

  -- Get user subscription from subscriptions table
  SELECT * INTO user_subscription 
  FROM public.subscriptions 
  WHERE user_id = user_id_param;

  -- If no subscription exists, create a default free subscription
  IF user_subscription IS NULL THEN
    INSERT INTO public.subscriptions (
      user_id, 
      plan_type, 
      generation_count_today, 
      converted_3d_this_month,
      generation_count_this_month,
      status
    ) VALUES (
      user_id_param, 
      'free', 
      0, 
      0,
      0,
      'active'
    ) RETURNING * INTO user_subscription;
  END IF;

  -- Reset daily/monthly counters if needed
  PERFORM public.reset_daily_usage();
  PERFORM public.reset_monthly_usage();

  -- Refresh subscription data after potential resets
  SELECT * INTO user_subscription 
  FROM public.subscriptions 
  WHERE user_id = user_id_param;

  -- Get plan limits based on subscription plan
  SELECT * INTO plan_limits 
  FROM public.plan_limits 
  WHERE plan_type = user_subscription.plan_type;

  -- If no plan limits found, use free plan defaults
  IF plan_limits IS NULL THEN
    plan_limits.image_generations_limit := 3;
    plan_limits.model_conversions_limit := 1;
    plan_limits.is_unlimited := false;
  END IF;

  -- For unlimited plans, always allow consumption
  IF plan_limits.is_unlimited THEN
    can_consume := TRUE;
  ELSE
    -- For non-unlimited plans, check feature limits only
    IF feature_type = 'image_generation' THEN
      can_consume := (user_subscription.generation_count_today < plan_limits.image_generations_limit);
    ELSIF feature_type = 'model_conversion' THEN
      can_consume := (user_subscription.converted_3d_this_month < plan_limits.model_conversions_limit);
    END IF;
  END IF;

  -- If cannot consume, return false
  IF NOT can_consume THEN
    RETURN FALSE;
  END IF;

  -- Consume the usage by updating subscription counters
  IF feature_type = 'image_generation' THEN
    UPDATE public.subscriptions 
    SET generation_count_today = generation_count_today + amount,
        generation_count_this_month = generation_count_this_month + amount,
        last_generated_at = NOW(),
        updated_at = NOW()
    WHERE user_id = user_id_param;
  ELSIF feature_type = 'model_conversion' THEN
    UPDATE public.subscriptions 
    SET converted_3d_this_month = converted_3d_this_month + amount,
        updated_at = NOW()
    WHERE user_id = user_id_param;
  END IF;

  RETURN TRUE;
END;
$$;

-- Create security monitoring functions
CREATE OR REPLACE FUNCTION public.log_security_violation(
  violation_type TEXT,
  violation_details JSONB DEFAULT '{}',
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_monitoring (
    check_type,
    status,
    severity,
    user_id,
    details
  ) VALUES (
    violation_type,
    'violation_detected',
    'high',
    user_id_param,
    violation_details
  );
END;
$$;
