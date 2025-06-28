
import { useEffect } from 'react';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { securityManager } from '@/utils/securityUtils';

/**
 * SecurityAuditLogger automatically logs important security events
 */
export const SecurityAuditLogger: React.FC = () => {
  const { user, session } = useEnhancedAuth();

  useEffect(() => {
    if (user && session) {
      // Log successful authentication
      securityManager.logSecurityEvent({
        event_type: 'user_session_active',
        event_details: {
          userId: user.id,
          sessionValid: !!session,
          lastSignIn: user.last_sign_in_at,
          signInCount: user.app_metadata?.sign_in_count || 0
        },
        success: true
      });
    }
  }, [user, session]);

  // Log page navigation events for security monitoring
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        securityManager.logSecurityEvent({
          event_type: 'user_session_end',
          event_details: {
            userId: user.id,
            currentPath: window.location.pathname,
            sessionDuration: session ? Date.now() - new Date(session.created_at || Date.now()).getTime() : 0
          },
          success: true
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, session]);

  // This component doesn't render anything, it just handles logging
  return null;
};
