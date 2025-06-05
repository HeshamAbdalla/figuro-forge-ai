
import { useEffect, useState } from 'react';
import { useEnhancedAuth } from './EnhancedAuthProvider';
import { EmailVerificationEnforcer } from '@/utils/emailVerificationEnforcer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface SecurityEnforcedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

/**
 * Route wrapper that enforces email verification and security policies
 */
export const SecurityEnforcedRoute = ({ 
  children, 
  requireVerification = true 
}: SecurityEnforcedRouteProps) => {
  const { user, session, isLoading } = useEnhancedAuth();
  const [verificationStatus, setVerificationStatus] = useState<{
    isChecking: boolean;
    isAllowed: boolean;
    error?: string;
  }>({
    isChecking: true,
    isAllowed: false
  });

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (isLoading) return;
      
      console.log('🔒 [SECURITY-ROUTE] Checking verification status');
      
      // If no user/session, redirect to auth
      if (!user || !session) {
        console.log('🚪 [SECURITY-ROUTE] No user/session, redirecting to auth');
        window.location.href = '/auth';
        return;
      }

      // If verification is not required, allow access
      if (!requireVerification) {
        setVerificationStatus({
          isChecking: false,
          isAllowed: true
        });
        return;
      }

      try {
        // Enforce verification requirements
        const enforcementResult = await EmailVerificationEnforcer.enforceVerification(user, session);
        
        console.log('🔍 [SECURITY-ROUTE] Enforcement result:', enforcementResult);
        
        if (!enforcementResult.allowAccess) {
          // Force sign out and redirect
          await EmailVerificationEnforcer.forceSignOutUnverified(
            enforcementResult.error || 'Verification required'
          );
          
          window.location.href = '/auth';
          return;
        }

        setVerificationStatus({
          isChecking: false,
          isAllowed: true
        });
        
      } catch (error) {
        console.error('❌ [SECURITY-ROUTE] Verification check failed:', error);
        
        setVerificationStatus({
          isChecking: false,
          isAllowed: false,
          error: 'Security verification failed'
        });
      }
    };

    checkVerificationStatus();
  }, [user, session, isLoading, requireVerification]);

  // Show loading while checking
  if (isLoading || verificationStatus.isChecking) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-figuro-accent animate-spin mx-auto" />
          <p className="text-white/80">Verifying security status...</p>
        </div>
      </div>
    );
  }

  // Show error if verification failed
  if (!verificationStatus.isAllowed) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center p-4">
        <Alert className="bg-red-500/10 border-red-500/30 max-w-md">
          <ShieldAlert className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-white/90">
            {verificationStatus.error || 'Access denied due to security requirements'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render children if verification passed
  return <>{children}</>;
};
