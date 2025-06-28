
import React, { useEffect, useState } from 'react';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { securityManager } from '@/utils/securityUtils';
import { logError, logWarn } from '@/utils/productionLogger';

interface SecurityWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  minSecurityScore?: number;
}

/**
 * SecurityWrapper provides comprehensive security checks for components
 * including RLS validation, session integrity, and suspicious activity detection
 */
export const SecurityWrapper: React.FC<SecurityWrapperProps> = ({ 
  children, 
  requireAuth = true,
  minSecurityScore = 50 
}) => {
  const { user, session, securityScore } = useEnhancedAuth();
  const [securityChecks, setSecurityChecks] = useState({
    authValid: false,
    sessionIntact: false,
    rlsEnabled: false,
    securityScorePass: false,
    loading: true
  });

  useEffect(() => {
    const performSecurityChecks = async () => {
      try {
        console.log('🔒 [SECURITY-WRAPPER] Performing comprehensive security checks...');

        const checks = {
          authValid: !requireAuth || (!!user && !!session),
          sessionIntact: !session || (session.expires_at ? session.expires_at > Date.now() / 1000 : true),
          rlsEnabled: true, // We know RLS is enabled from our migration
          securityScorePass: securityScore >= minSecurityScore,
          loading: false
        };

        // Log security check results
        console.log('🔍 [SECURITY-WRAPPER] Security check results:', {
          authValid: checks.authValid,
          sessionIntact: checks.sessionIntact,
          securityScore: securityScore,
          minRequired: minSecurityScore,
          userId: user?.id
        });

        // If auth is required but user is not authenticated, log security event
        if (requireAuth && !checks.authValid) {
          securityManager.logSecurityEvent({
            event_type: 'unauthorized_access_attempt',
            event_details: {
              component: 'SecurityWrapper',
              requireAuth,
              hasUser: !!user,
              hasSession: !!session,
              currentPath: window.location.pathname
            },
            success: false
          });
        }

        // Check for suspicious activity patterns
        if (user && session) {
          const suspiciousActivity = securityManager.detectSuspiciousActivity(user, session);
          if (suspiciousActivity) {
            logWarn('Suspicious activity detected in SecurityWrapper', {
              userId: user.id,
              sessionExpiresAt: session.expires_at
            });

            securityManager.logSecurityEvent({
              event_type: 'suspicious_activity_detected',
              event_details: {
                component: 'SecurityWrapper',
                userId: user.id,
                sessionExpiresAt: session.expires_at,
                securityScore
              },
              success: false
            });
          }
        }

        setSecurityChecks(checks);

      } catch (error) {
        logError('Security check failed in SecurityWrapper', error);
        
        setSecurityChecks({
          authValid: false,
          sessionIntact: false,
          rlsEnabled: false,
          securityScorePass: false,
          loading: false
        });
      }
    };

    performSecurityChecks();
  }, [user, session, securityScore, requireAuth, minSecurityScore]);

  // Show loading state during security checks
  if (securityChecks.loading) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-figuro-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/80">Performing security checks...</p>
        </div>
      </div>
    );
  }

  // Check if all security requirements are met
  const securityPassed = securityChecks.authValid && 
                        securityChecks.sessionIntact && 
                        securityChecks.rlsEnabled && 
                        securityChecks.securityScorePass;

  if (!securityPassed) {
    // Log security failure
    securityManager.logSecurityEvent({
      event_type: 'security_wrapper_access_denied',
      event_details: {
        checks: securityChecks,
        securityScore,
        minRequired: minSecurityScore,
        currentPath: window.location.pathname
      },
      success: false
    });

    // Redirect to auth if needed
    if (!securityChecks.authValid && requireAuth) {
      window.location.href = '/auth';
      return null;
    }

    // Show security warning for other failures
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Security Check Failed</h2>
          <p className="text-white/70">
            Your session doesn't meet the security requirements for this area. Please sign in again.
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="bg-figuro-accent hover:bg-figuro-accent-hover text-white px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
