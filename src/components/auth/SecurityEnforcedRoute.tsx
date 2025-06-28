
import { useEffect, useState } from 'react';
import { useEnhancedAuth } from './EnhancedAuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface SecurityEnforcedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

/**
 * Simplified route wrapper that provides basic authentication check
 * with OAuth-friendly verification logic
 */
export const SecurityEnforcedRoute = ({ 
  children, 
  requireVerification = false 
}: SecurityEnforcedRouteProps) => {
  const { user, session, isLoading } = useEnhancedAuth();
  const [isChecking, setIsChecking] = useState(true);

  console.log('🔒 [SECURITY-ROUTE] Component rendered:', {
    hasUser: !!user,
    hasSession: !!session,
    isLoading,
    requireVerification,
    userProvider: user?.app_metadata?.provider,
    currentPath: window.location.pathname
  });

  useEffect(() => {
    const checkAccess = () => {
      console.log('🔍 [SECURITY-ROUTE] Checking access...');
      
      if (isLoading) {
        console.log('⏳ [SECURITY-ROUTE] Still loading auth state');
        return;
      }

      // If no user/session, redirect to auth
      if (!user || !session) {
        console.log('🚪 [SECURITY-ROUTE] No user/session, redirecting to auth');
        window.location.href = '/auth';
        return;
      }

      // OAuth users are always allowed (Google, etc.)
      const provider = user.app_metadata?.provider;
      const isOAuth = provider && provider !== 'email';
      
      if (isOAuth) {
        console.log('✅ [SECURITY-ROUTE] OAuth user detected, allowing access', { provider });
        setIsChecking(false);
        return;
      }

      // For email users, only check verification if explicitly required
      if (requireVerification && !user.email_confirmed_at) {
        console.log('❌ [SECURITY-ROUTE] Email verification required for email user');
        window.location.href = '/auth';
        return;
      }

      console.log('✅ [SECURITY-ROUTE] Access granted');
      setIsChecking(false);
    };

    checkAccess();
  }, [user, session, isLoading, requireVerification]);

  // Show loading while checking auth
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-figuro-accent animate-spin mx-auto" />
          <p className="text-white/80">
            {isLoading ? 'Loading authentication...' : 'Verifying access...'}
          </p>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};
