
import React, { useEffect, useState } from 'react';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { securityManager } from '@/utils/securityUtils';
import { logError, logInfo } from '@/utils/productionLogger';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute ensures only users with admin role can access certain components
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, session } = useEnhancedAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('🔐 [ADMIN-ROUTE] Checking admin status for user:', user.id);

        // Use the new database function to check admin status
        const { data, error } = await supabase.rpc('is_admin_user', {
          check_user_id: user.id
        });

        if (error) {
          throw error;
        }

        const adminStatus = data === true;
        setIsAdmin(adminStatus);

        logInfo(`Admin check completed`, { 
          userId: user.id, 
          isAdmin: adminStatus 
        });

        // Log admin access attempt
        securityManager.logSecurityEvent({
          event_type: adminStatus ? 'admin_access_granted' : 'admin_access_denied',
          event_details: {
            userId: user.id,
            currentPath: window.location.pathname,
            isAdmin: adminStatus
          },
          success: adminStatus
        });

      } catch (error: any) {
        logError('Admin status check failed', error);
        
        securityManager.logSecurityEvent({
          event_type: 'admin_check_failed',
          event_details: {
            userId: user.id,
            error: error.message,
            currentPath: window.location.pathname
          },
          success: false
        });

        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, session]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-figuro-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/80">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Access Denied</h2>
          <p className="text-white/70">
            You don't have permission to access this area. Admin privileges required.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-figuro-accent hover:bg-figuro-accent-hover text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
