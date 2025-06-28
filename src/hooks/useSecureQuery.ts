
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { securityManager } from '@/utils/securityUtils';
import { logError, logWarn } from '@/utils/productionLogger';

interface SecureQueryOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  requireAuth?: boolean;
  tableName?: string;
  enabled?: boolean;
}

/**
 * useSecureQuery provides enhanced security for data fetching operations
 * including RLS validation, rate limiting, and suspicious activity detection
 */
export const useSecureQuery = ({
  queryKey,
  queryFn,
  requireAuth = true,
  tableName,
  enabled = true
}: SecureQueryOptions) => {
  const { user, session, securityScore } = useEnhancedAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Security check: ensure user is authenticated if required
        if (requireAuth && (!user || !session)) {
          securityManager.logSecurityEvent({
            event_type: 'unauthorized_query_attempt',
            event_details: {
              queryKey,
              tableName,
              hasUser: !!user,
              hasSession: !!session
            },
            success: false
          });
          throw new Error('Authentication required for this operation');
        }

        // Security check: verify session is still valid
        if (session && session.expires_at && session.expires_at <= Date.now() / 1000) {
          logWarn('Expired session detected in secure query', { userId: user?.id });
          
          securityManager.logSecurityEvent({
            event_type: 'expired_session_query_attempt',
            event_details: {
              queryKey,
              tableName,
              userId: user?.id,
              sessionExpiry: session.expires_at
            },
            success: false
          });
          
          // Clear query cache and redirect to auth
          queryClient.clear();
          window.location.href = '/auth';
          throw new Error('Session expired');
        }

        // Rate limiting check (non-blocking)
        if (tableName) {
          const rateLimitPassed = await securityManager.checkRateLimit(`query_${tableName}`, 50, 5);
          if (!rateLimitPassed) {
            logWarn('Rate limit exceeded for secure query', { tableName, userId: user?.id });
            
            securityManager.logSecurityEvent({
              event_type: 'query_rate_limit_exceeded',
              event_details: {
                queryKey,
                tableName,
                userId: user?.id
              },
              success: false
            });
            
            throw new Error('Too many requests. Please wait a moment and try again.');
          }
        }

        // Execute the actual query
        const result = await queryFn();

        // Log successful secure query
        securityManager.logSecurityEvent({
          event_type: 'secure_query_success',
          event_details: {
            queryKey,
            tableName,
            userId: user?.id,
            securityScore
          },
          success: true
        });

        return result;

      } catch (error: any) {
        logError('Secure query failed', error);
        
        securityManager.logSecurityEvent({
          event_type: 'secure_query_failed',
          event_details: {
            queryKey,
            tableName,
            error: error.message,
            userId: user?.id
          },
          success: false
        });

        throw error;
      }
    },
    enabled: enabled && (requireAuth ? !!user && !!session : true),
    retry: (failureCount, error: any) => {
      // Don't retry on security-related errors
      if (error.message.includes('Authentication') || 
          error.message.includes('Session') || 
          error.message.includes('rate limit')) {
        return false;
      }
      
      // Standard retry logic for other errors
      return failureCount < 3;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
