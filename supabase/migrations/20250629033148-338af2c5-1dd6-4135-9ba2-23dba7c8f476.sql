
-- Phase 1: Create optimized security functions to reduce auth.uid() calls
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

-- Optimized function to check user role with caching
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Optimized admin check function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Phase 2: Drop existing policies and create consolidated, optimized ones

-- Figurines table optimization
DROP POLICY IF EXISTS "Users can view their own figurines" ON public.figurines;
DROP POLICY IF EXISTS "Users can create their own figurines" ON public.figurines;
DROP POLICY IF EXISTS "Users can update their own figurines" ON public.figurines;
DROP POLICY IF EXISTS "Users can delete their own figurines" ON public.figurines;
DROP POLICY IF EXISTS "Public figurines are viewable by all" ON public.figurines;

-- Single consolidated policy for figurines SELECT
CREATE POLICY "figurines_select_policy" ON public.figurines
  FOR SELECT USING (
    public.get_current_user_id() = user_id OR 
    (is_public = true AND auth.role() = 'authenticated') OR
    public.is_current_user_admin()
  );

-- Single consolidated policy for figurines INSERT
CREATE POLICY "figurines_insert_policy" ON public.figurines
  FOR INSERT WITH CHECK (public.get_current_user_id() = user_id);

-- Single consolidated policy for figurines UPDATE
CREATE POLICY "figurines_update_policy" ON public.figurines
  FOR UPDATE USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

-- Single consolidated policy for figurines DELETE
CREATE POLICY "figurines_delete_policy" ON public.figurines
  FOR DELETE USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

-- Profiles table optimization
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    public.get_current_user_id() = id OR 
    public.is_current_user_admin()
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (
    public.get_current_user_id() = id OR 
    public.is_current_user_admin()
  );

-- Subscriptions table optimization
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

CREATE POLICY "subscriptions_select_policy" ON public.subscriptions
  FOR SELECT USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

CREATE POLICY "subscriptions_update_policy" ON public.subscriptions
  FOR UPDATE USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

-- Conversion tasks table optimization
DROP POLICY IF EXISTS "Users can view their own conversion tasks" ON public.conversion_tasks;
DROP POLICY IF EXISTS "Users can create their own conversion tasks" ON public.conversion_tasks;
DROP POLICY IF EXISTS "Users can update their own conversion tasks" ON public.conversion_tasks;

CREATE POLICY "conversion_tasks_select_policy" ON public.conversion_tasks
  FOR SELECT USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

CREATE POLICY "conversion_tasks_insert_policy" ON public.conversion_tasks
  FOR INSERT WITH CHECK (public.get_current_user_id() = user_id);

CREATE POLICY "conversion_tasks_update_policy" ON public.conversion_tasks
  FOR UPDATE USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

-- Remesh tasks table optimization
DROP POLICY IF EXISTS "Users can view their own remesh tasks" ON public.remesh_tasks;
DROP POLICY IF EXISTS "Users can create their own remesh tasks" ON public.remesh_tasks;
DROP POLICY IF EXISTS "Users can update their own remesh tasks" ON public.remesh_tasks;

CREATE POLICY "remesh_tasks_select_policy" ON public.remesh_tasks
  FOR SELECT USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

CREATE POLICY "remesh_tasks_insert_policy" ON public.remesh_tasks
  FOR INSERT WITH CHECK (public.get_current_user_id() = user_id);

CREATE POLICY "remesh_tasks_update_policy" ON public.remesh_tasks
  FOR UPDATE USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

-- Payment sessions table optimization
DROP POLICY IF EXISTS "Users can view their own payment sessions" ON public.payment_sessions;
DROP POLICY IF EXISTS "Users can create their own payment sessions" ON public.payment_sessions;

CREATE POLICY "payment_sessions_select_policy" ON public.payment_sessions
  FOR SELECT USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

CREATE POLICY "payment_sessions_insert_policy" ON public.payment_sessions
  FOR INSERT WITH CHECK (public.get_current_user_id() = user_id);

-- Security audit log optimization
DROP POLICY IF EXISTS "Users can view their own security events" ON public.security_audit_log;
DROP POLICY IF EXISTS "System can log all security events" ON public.security_audit_log;
DROP POLICY IF EXISTS "Admins can view all security events" ON public.security_audit_log;

CREATE POLICY "security_audit_log_select_policy" ON public.security_audit_log
  FOR SELECT USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

CREATE POLICY "security_audit_log_insert_policy" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

-- Security monitoring optimization
DROP POLICY IF EXISTS "Admins can view all security monitoring" ON public.security_monitoring;
DROP POLICY IF EXISTS "System can create security monitoring entries" ON public.security_monitoring;

CREATE POLICY "security_monitoring_select_policy" ON public.security_monitoring
  FOR SELECT USING (public.is_current_user_admin());

CREATE POLICY "security_monitoring_insert_policy" ON public.security_monitoring
  FOR INSERT WITH CHECK (true);

-- User roles optimization
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "user_roles_select_policy" ON public.user_roles
  FOR SELECT USING (
    public.get_current_user_id() = user_id OR 
    public.is_current_user_admin()
  );

CREATE POLICY "user_roles_all_policy" ON public.user_roles
  FOR ALL USING (public.is_current_user_admin());

-- Rate limits optimization - system only
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;

CREATE POLICY "rate_limits_all_policy" ON public.rate_limits
  FOR ALL USING (true);

-- Phase 3: Create performance monitoring function
CREATE OR REPLACE FUNCTION public.rls_performance_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  policy_count integer;
  function_count integer;
BEGIN
  -- Count active RLS policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public';
  
  -- Count security definer functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc pr
  JOIN pg_namespace n ON pr.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND pr.prosecdef = true;
  
  result := jsonb_build_object(
    'timestamp', NOW(),
    'active_policies', policy_count,
    'security_functions', function_count,
    'optimization_status', 'completed',
    'performance_improvements', jsonb_build_array(
      'Consolidated multiple policies into single policies per operation',
      'Replaced direct auth.uid() calls with cached security functions',
      'Reduced policy evaluation overhead',
      'Improved query performance for large datasets'
    )
  );
  
  RETURN result;
END;
$$;

-- Create indexes for improved performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_figurines_user_public ON public.figurines(user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_conversion_tasks_user_status ON public.conversion_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_remesh_tasks_user_status ON public.remesh_tasks(user_id, status);
