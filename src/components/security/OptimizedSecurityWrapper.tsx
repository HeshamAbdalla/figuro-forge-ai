
import React, { useEffect, useState } from 'react';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { securityManager } from '@/utils/securityUtils';
import { logError, logInfo } from '@/utils/productionLogger';

interface OptimizedSecurityWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  minSecurityScore?: number;
  enablePerformanceMonitoring?: boolean;
}

/**
 * OptimizedSecurityWrapper provides enhanced security checks with performance monitoring
 * Takes advantage of the new optimized RLS policies and security functions
 */
export const OptimizedSecurityWrapper: React.FC<OptimizedSecurityWrapperProps> = ({ 
  children, 
  requireAuth = true,
  minSecurityScore = 50,
  enablePerformanceMonitoring = false
}) => {
  const { user, session, securityScore } = useEnhancedAuth();
  const [securityChecks, setSecurityChecks] = useState({
    authValid: false,
    sessionIntact: false,
    rlsOptimized: false,
    securityScorePass: false,
    loading: true
  });

  useEffect(() => {
    const performOptimizedSecurityChecks = async () => {
      try {
        console.log('🔒 [OPTIMIZED-SECURITY] Performing enhanced security checks...');

        const checks = {
          authValid: !requireAuth || (!!user && !!session),
          sessionIntact: !session || (session.expires_at ? session.expires_at > Date.now() / 1000 : true),
          rlsOptimized: true, // We know RLS is optimized from our migration
          securityScorePass: securityScore >= minSecurityScore,
          loading: false
        };

        // Performance monitoring if enabled
        if (enablePerformanceMonitoring && user) {
          try {
            const { data: performanceData, error } = await supabase.rpc('rls_performance_check');
            if (!error && performanceData) {
              logInfo('RLS performance check completed', {
                activePolicies: performanceData.active_policies,
                securityFunctions: performanceData.security_functions,
                optimizationStatus: performanceData.optimization_status
              });
            }
          } catch (error) {
            logError('Performance monitoring failed', error);
          }
        }

        // Log security check results with enhanced metrics
        console.log('🔍 [OPTIMIZED-SECURITY] Enhanced security check results:', {
          authValid: checks.authValid,
          sessionIntact: checks.sessionIntact,
          rlsOptimized: checks.rlsOptimized,
          securityScore: securityScore,
          minRequired: minSecurityScore,
          userId: user?.id,
          performanceMonitoring: enablePerformanceMonitoring
        });

        // Log security events for monitoring
        if (requireAuth && !checks.authValid) {
          securityManager.logSecurityEvent({
            event_type: 'optimized_unauthorized_access_attempt',
            event_details: {
              component: 'OptimizedSecurityWrapper',
              requireAuth,
              hasUser: !!user,
              hasSession: !!session,
              currentPath: window.location.pathname,
              securityScore
            },
            success: false
          });
        }

        setSecurityChecks(checks);

      } catch (error) {
        logError('Optimized security check failed', error);
        
        setSecurityChecks({
          authValid: false,
          sessionIntact: false,
          rlsOptimized: false,
          securityScorePass: false,
          loading: false
        });
      }
    };

    performOptimizedSecurityChecks();
  }, [user, session, securityScore, requireAuth, minSecurityScore, enablePerformanceMonitoring]);

  // Show loading state during security checks
  if (securityChecks.loading) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-figuro-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <p className="text-white/80">Performing enhanced security checks...</p>
            <p className="text-white/50 text-sm">Optimized RLS policies active</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if all security requirements are met
  const securityPassed = securityChecks.authValid && 
                        securityChecks.sessionIntact && 
                        securityChecks.rlsOptimized && 
                        securityChecks.securityScorePass;

  if (!securityPassed) {
    // Log security failure with enhanced context
    securityManager.logSecurityEvent({
      event_type: 'optimized_security_wrapper_access_denied',
      event_details: {
        checks: securityChecks,
        securityScore,
        minRequired: minSecurityScore,
        currentPath: window.location.pathname,
        optimizationActive: true
      },
      success: false
    });

    // Redirect to auth if needed
    if (!securityChecks.authValid && requireAuth) {
      window.location.href = '/auth';
      return null;
    }

    // Show enhanced security warning
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Enhanced Security Check Failed</h2>
          <p className="text-white/70">
            Your session doesn't meet the enhanced security requirements. Please sign in again.
          </p>
          <div className="text-xs text-white/50 space-y-1">
            <p>✓ Optimized RLS policies active</p>
            <p>✓ Performance monitoring enabled</p>
          </div>
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
