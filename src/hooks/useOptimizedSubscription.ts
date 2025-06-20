
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/components/auth/OptimizedAuthProvider';
import { logger } from '@/utils/logLevelManager';

interface OptimizedSubscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  credits_remaining?: number;
  monthly_limit?: number;
}

export const useOptimizedSubscription = () => {
  const { user, profile } = useOptimizedAuth();
  const [subscription, setSubscription] = useState<OptimizedSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      logger.debug('OptimizedSubscription: Fetching subscription data', 'subscription-perf');
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('OptimizedSubscription: Error fetching subscription', 'subscription-perf', error);
      } else {
        setSubscription(data);
        logger.debug('OptimizedSubscription: Subscription data loaded', 'subscription-perf', { plan: data?.plan });
      }
    } catch (error) {
      logger.error('OptimizedSubscription: Exception fetching subscription', 'subscription-perf', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Listen for subscription refresh events
  useEffect(() => {
    const handleRefresh = () => {
      logger.debug('OptimizedSubscription: Refresh event received', 'subscription-perf');
      fetchSubscription();
    };

    window.addEventListener('auth-subscription-refresh', handleRefresh);
    return () => window.removeEventListener('auth-subscription-refresh', handleRefresh);
  }, [fetchSubscription]);

  const canPerformAction = useCallback((action: string) => {
    if (!user) return false;
    
    // Use profile data if available for quick checks
    if (profile?.plan === 'pro' || profile?.plan === 'premium') {
      return true;
    }
    
    // Fallback to subscription data
    if (!subscription) return false;
    
    return subscription.status === 'active';
  }, [user, profile, subscription]);

  return {
    subscription,
    isLoading,
    canPerformAction,
    refreshSubscription: fetchSubscription,
  };
};
