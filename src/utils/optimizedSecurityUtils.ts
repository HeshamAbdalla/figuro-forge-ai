
import { supabase } from '@/integrations/supabase/client';
import { logError, logInfo } from '@/utils/productionLogger';

interface RLSPerformanceData {
  active_policies: number;
  security_functions: number;
  optimization_status: string;
}

interface SecurityHealthData {
  status: string;
  security_score: number;
}

/**
 * Optimized security utilities that take advantage of the new RLS performance improvements
 */
export class OptimizedSecurityManager {
  
  /**
   * Enhanced security event logging with performance monitoring
   */
  static async logOptimizedSecurityEvent(params: {
    event_type: string;
    event_details?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    success?: boolean;
    performance_context?: {
      query_time?: number;
      policy_evaluations?: number;
    };
  }) {
    try {
      const startTime = performance.now();
      
      const { error } = await supabase.rpc('log_security_event', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_event_type: params.event_type,
        p_event_details: {
          ...params.event_details,
          optimization_active: true,
          performance_context: params.performance_context
        },
        p_ip_address: params.ip_address || null,
        p_user_agent: params.user_agent || null,
        p_success: params.success ?? true
      });

      const executionTime = performance.now() - startTime;

      if (error) {
        logError('Optimized security event logging failed', error);
        return false;
      }

      logInfo('Optimized security event logged', {
        event_type: params.event_type,
        execution_time: executionTime,
        performance_context: params.performance_context
      });

      return true;
    } catch (error) {
      logError('Error in optimized security event logging', error);
      return false;
    }
  }

  /**
   * Performance-aware RLS health check
   */
  static async performOptimizedRLSCheck(): Promise<{
    success: boolean;
    performance_metrics: {
      query_time: number;
      policy_evaluations: number;
      functions_called: number;
    };
    security_status: string;
  }> {
    const startTime = performance.now();
    
    try {
      console.log('🚀 [OPTIMIZED-SECURITY] Starting performance-aware RLS check');
      
      // Use the optimized security health check
      const { data: healthData, error } = await supabase.rpc('enhanced_security_health_check');
      
      if (error) {
        throw error;
      }

      // Get performance data
      const { data: performanceData, error: perfError } = await supabase.rpc('rls_performance_check');
      
      if (perfError) {
        console.warn('Performance data unavailable:', perfError);
      }

      const queryTime = performance.now() - startTime;

      // Safely cast to expected types
      const typedHealthData = healthData as unknown as SecurityHealthData;
      const typedPerformanceData = performanceData as unknown as RLSPerformanceData;

      const result = {
        success: true,
        performance_metrics: {
          query_time: queryTime,
          policy_evaluations: typedPerformanceData?.active_policies || 0,
          functions_called: typedPerformanceData?.security_functions || 0
        },
        security_status: typedHealthData?.status || 'UNKNOWN'
      };

      logInfo('Optimized RLS check completed', result);
      
      // Log the performance metrics
      await this.logOptimizedSecurityEvent({
        event_type: 'optimized_rls_health_check',
        event_details: {
          security_score: (typedHealthData as any)?.security_score,
          status: typedHealthData?.status
        },
        success: true,
        performance_context: result.performance_metrics
      });

      return result;
      
    } catch (error) {
      const queryTime = performance.now() - startTime;
      
      logError('Optimized RLS check failed', error);
      
      await this.logOptimizedSecurityEvent({
        event_type: 'optimized_rls_health_check_failed',
        event_details: {
          error: (error as Error).message
        },
        success: false,
        performance_context: {
          query_time: queryTime,
          policy_evaluations: 0,
          functions_called: 0
        }
      });

      return {
        success: false,
        performance_metrics: {
          query_time: queryTime,
          policy_evaluations: 0,
          functions_called: 0
        },
        security_status: 'ERROR'
      };
    }
  }

  /**
   * Optimized user permission check using cached security functions
   */
  static async checkOptimizedUserPermissions(action: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Use the optimized security functions for faster permission checks
      const { data: isAdmin, error } = await supabase.rpc('is_current_user_admin');
      
      if (error) {
        logError('Error checking admin status', error);
        return false;
      }

      // Log the permission check with performance context
      await this.logOptimizedSecurityEvent({
        event_type: 'optimized_permission_check',
        event_details: {
          action,
          user_id: user.id,
          is_admin: isAdmin,
          result: isAdmin || action === 'read'
        },
        success: true
      });

      // For now, admins can do everything, others can only read
      return isAdmin || action === 'read';
      
    } catch (error) {
      logError('Optimized permission check failed', error);
      return false;
    }
  }
}

export const optimizedSecurityManager = OptimizedSecurityManager;
