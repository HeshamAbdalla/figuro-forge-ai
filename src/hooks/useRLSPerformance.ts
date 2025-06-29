
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

      const { data, error: rpcError } = await supabase.rpc('rls_performance_check');
      
      if (rpcError) {
        throw rpcError;
      }

      // Type cast the response data properly
      const typedData = data as RLSPerformanceData;
      setPerformanceData(typedData);
      console.log('🚀 [RLS-PERFORMANCE] Performance check completed:', typedData);
      
    } catch (err: any) {
      console.error('❌ [RLS-PERFORMANCE] Error checking performance:', err);
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
