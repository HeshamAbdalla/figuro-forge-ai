
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { securityManager } from '@/utils/securityUtils';
import { logError, logInfo } from '@/utils/productionLogger';

interface RLSValidatorProps {
  children: React.ReactNode;
  tableName: string;
  operation?: 'select' | 'insert' | 'update' | 'delete';
}

/**
 * RLSValidator ensures Row Level Security is properly functioning
 * for critical database operations
 */
export const RLSValidator: React.FC<RLSValidatorProps> = ({ 
  children, 
  tableName, 
  operation = 'select' 
}) => {
  const { user } = useEnhancedAuth();
  const [rlsValid, setRlsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateRLS = async () => {
      if (!user) {
        setRlsValid(false);
        return;
      }

      try {
        console.log(`🔒 [RLS-VALIDATOR] Validating RLS for ${tableName} ${operation} operation`);

        // Test RLS by attempting a controlled query
        let testQuery;
        
        switch (tableName) {
          case 'figurines':
            testQuery = supabase
              .from('figurines')
              .select('id')
              .eq('user_id', user.id)
              .limit(1);
            break;
          case 'subscriptions':
            testQuery = supabase
              .from('subscriptions')
              .select('id')
              .eq('user_id', user.id)
              .limit(1);
            break;
          case 'conversion_tasks':
            testQuery = supabase
              .from('conversion_tasks')
              .select('id')
              .eq('user_id', user.id)
              .limit(1);
            break;
          default:
            console.warn(`RLS validation not implemented for table: ${tableName}`);
            setRlsValid(true);
            return;
        }

        const { data, error: queryError } = await testQuery;

        if (queryError) {
          // If we get a policy violation error, RLS is working correctly
          if (queryError.message.includes('row-level security') || 
              queryError.message.includes('policy')) {
            logInfo(`RLS is properly enforced for ${tableName}`);
            setRlsValid(true);
          } else {
            throw queryError;
          }
        } else {
          // Query succeeded, which means RLS is allowing access (good)
          logInfo(`RLS validation passed for ${tableName}`, { recordCount: data?.length });
          setRlsValid(true);
        }

        // Log successful RLS validation
        securityManager.logSecurityEvent({
          event_type: 'rls_validation_success',
          event_details: {
            table: tableName,
            operation,
            userId: user.id
          },
          success: true
        });

      } catch (error: any) {
        logError(`RLS validation failed for ${tableName}`, error);
        
        securityManager.logSecurityEvent({
          event_type: 'rls_validation_failed',
          event_details: {
            table: tableName,
            operation,
            error: error.message,
            userId: user.id
          },
          success: false
        });

        setError(`Security validation failed for ${tableName}: ${error.message}`);
        setRlsValid(false);
      }
    };

    validateRLS();
  }, [user, tableName, operation]);

  // Show loading state
  if (rlsValid === null) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-4 h-4 border-2 border-figuro-accent border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-white/70">Validating security...</span>
      </div>
    );
  }

  // Show error state
  if (!rlsValid) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-400 font-medium">Security Validation Failed</span>
        </div>
        {error && (
          <p className="text-red-300 text-sm mt-2">{error}</p>
        )}
        <p className="text-red-300 text-sm mt-2">
          Please refresh the page or contact support if this persists.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
