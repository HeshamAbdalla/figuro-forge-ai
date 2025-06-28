
import { supabase } from '@/integrations/supabase/client';
import { securityManager } from '@/utils/securityUtils';
import { logError, logInfo } from '@/utils/productionLogger';

/**
 * Validates that RLS policies are working correctly for user data access
 */
export class RLSValidation {
  
  /**
   * Test if user can only access their own data in a given table
   */
  static async validateUserDataAccess(tableName: string, userId: string): Promise<boolean> {
    try {
      console.log(`🔒 [RLS-VALIDATION] Testing data access for ${tableName}`);

      let query;
      
      switch (tableName) {
        case 'figurines':
          query = supabase
            .from('figurines')
            .select('user_id')
            .limit(10);
          break;
        case 'subscriptions':
          query = supabase
            .from('subscriptions')
            .select('user_id')
            .limit(10);
          break;
        case 'conversion_tasks':
          query = supabase
            .from('conversion_tasks')
            .select('user_id')
            .limit(10);
          break;
        default:
          console.warn(`RLS validation not implemented for table: ${tableName}`);
          return true;
      }

      const { data, error } = await query;

      if (error) {
        logError(`RLS validation query failed for ${tableName}`, error);
        return false;
      }

      // Check that all returned records belong to the current user
      const allRecordsOwnedByUser = data?.every(record => record.user_id === userId) ?? true;
      
      if (!allRecordsOwnedByUser) {
        // This is a critical security issue - user can see other users' data
        securityManager.logSecurityEvent({
          event_type: 'rls_policy_breach',
          event_details: {
            table: tableName,
            userId,
            totalRecords: data?.length,
            foreignRecords: data?.filter(r => r.user_id !== userId).length
          },
          success: false
        });

        logError(`CRITICAL: RLS policy breach detected in ${tableName}`, {
          userId,
          recordsReturned: data?.length,
          ownedByUser: data?.filter(r => r.user_id === userId).length
        });

        return false;
      }

      logInfo(`RLS validation passed for ${tableName}`, { 
        recordsChecked: data?.length 
      });

      return true;

    } catch (error: any) {
      logError(`RLS validation error for ${tableName}`, error);
      
      securityManager.logSecurityEvent({
        event_type: 'rls_validation_error',
        event_details: {
          table: tableName,
          userId,
          error: error.message
        },
        success: false
      });

      return false;
    }
  }

  /**
   * Comprehensive RLS health check across all critical tables
   */
  static async performHealthCheck(userId: string): Promise<{
    overall: boolean;
    results: Record<string, boolean>;
  }> {
    const criticalTables = ['figurines', 'subscriptions', 'conversion_tasks'];
    const results: Record<string, boolean> = {};

    console.log('🔒 [RLS-VALIDATION] Starting comprehensive RLS health check');

    for (const table of criticalTables) {
      results[table] = await this.validateUserDataAccess(table, userId);
    }

    const overall = Object.values(results).every(result => result === true);

    securityManager.logSecurityEvent({
      event_type: 'rls_health_check_completed',
      event_details: {
        userId,
        overall,
        results,
        timestamp: new Date().toISOString()
      },
      success: overall
    });

    console.log('🔒 [RLS-VALIDATION] Health check completed', { overall, results });

    return { overall, results };
  }
}
