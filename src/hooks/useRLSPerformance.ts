
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';

interface RLSPerformanceData {
  timestamp: string;
  active_policies: number;
  security_functions: number;
  duplicate_policies: number;
  optimization_status: string;
  performance_improvements: string[];
}

export const useRLSPerformance = () => {
  const { user } = useEnhancedAuth();
  const [performanceData, setPerformanceData] = useState<RLSPerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkRLSPerformance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🎉 [RLS-PERFORMANCE] Checking FINAL OPTIMIZED RLS performance...');

      const { data, error: rpcError } = await supabase.rpc('rls_performance_check');
      
      if (rpcError) {
        throw rpcError;
      }

      // Safely cast the response data with proper validation
      const typedData = data as unknown as RLSPerformanceData;
      
      // Validate that we have the expected structure
      if (typedData && typeof typedData === 'object' && 'active_policies' in typedData) {
        setPerformanceData(typedData);
        
        const isFullyOptimized = typedData.optimization_status === 'fully_optimized';
        const duplicatesEliminated = typedData.duplicate_policies === 0;
        
        console.log('🚀 [RLS-PERFORMANCE] FINAL OPTIMIZATION STATUS:', {
          ...typedData,
          fully_optimized: isFullyOptimized,
          duplicates_eliminated: duplicatesEliminated,
          performance_score: isFullyOptimized && duplicatesEliminated ? 'MAXIMUM' : 'NEEDS_ATTENTION',
          database_linter_warnings: duplicatesEliminated ? 'RESOLVED' : 'REMAINING'
        });
      } else {
        throw new Error('Invalid response format from RLS performance check');
      }
      
    } catch (err: any) {
      console.error('❌ [RLS-PERFORMANCE] Error checking final optimized performance:', err);
      setError(err.message || 'Failed to check RLS performance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkRLSPerformance();
    }
  }, [user]);

  return {
    performanceData,
    loading,
    error,
    refreshPerformance: checkRLSPerformance
  };
};
