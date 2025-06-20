
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
  // Database fields
  user_id: string;
  plan_type: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  commercial_license?: boolean;
  additional_conversions?: number;
  bonus_credits?: number;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;
  renewed_at?: string;
  expires_at?: string;
  generation_count_today?: number;
  last_generated_at?: string;
  converted_3d_this_month?: number;
  generation_count_this_month?: number;
  daily_reset_date?: string;
  monthly_reset_date?: string;
  is_active?: boolean;
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
      } else if (data) {
        // Map database fields to expected interface
        const mappedSubscription: OptimizedSubscription = {
          ...data,
          plan: data.plan_type || 'free',
          current_period_end: data.valid_until || data.expires_at || '',
        };
        setSubscription(mappedSubscription);
        logger.debug('OptimizedSubscription: Subscription data loaded', 'subscription-perf', { plan: mappedSubscription.plan });
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
