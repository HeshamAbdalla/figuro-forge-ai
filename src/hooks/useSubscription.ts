
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/components/auth/OptimizedAuthProvider';
import { toast } from '@/hooks/use-toast';

interface Subscription {
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

export const useSubscription = () => {
  const { user } = useOptimizedAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      } else if (data) {
        // Map database fields to expected interface
        const mappedSubscription: Subscription = {
          ...data,
          plan: data.plan_type || 'free',
          current_period_end: data.valid_until || data.expires_at || '',
        };
        setSubscription(mappedSubscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const canPerformAction = (action: string) => {
    if (!subscription) return false;
    
    // Add your subscription logic here
    return subscription.status === 'active';
  };

  const consumeAction = async (actionType: 'image_generation' | 'model_conversion') => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('consume_feature_usage', {
        feature_type: actionType,
        user_id_param: user.id,
        amount: 1
      });

      if (error) {
        console.error('Error consuming action:', error);
        return false;
      }

      // Refresh subscription data after consumption
      await fetchSubscription();
      return data;
    } catch (error) {
      console.error('Error consuming action:', error);
      return false;
    }
  };

  const getUpgradeRecommendation = (actionType: 'image_generation' | 'model_conversion') => {
    // Basic upgrade recommendation logic
    if (!subscription || subscription.plan === 'free') {
      return {
        recommendedPlan: 'Pro',
        reason: 'Unlock more features'
      };
    }
    return null;
  };

  const getRemainingUsage = (actionType: 'image_generation' | 'model_conversion') => {
    if (!subscription) return null;

    if (actionType === 'image_generation') {
      return {
        remaining: Math.max(0, (subscription.monthly_limit || 0) - (subscription.generation_count_this_month || 0)),
        used: subscription.generation_count_this_month || 0,
        limit: subscription.monthly_limit || 0
      };
    } else if (actionType === 'model_conversion') {
      return {
        remaining: Math.max(0, (subscription.monthly_limit || 0) - (subscription.converted_3d_this_month || 0)),
        used: subscription.converted_3d_this_month || 0,
        limit: subscription.monthly_limit || 0
      };
    }

    return null;
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session');
      
      if (error) {
        console.error('Error creating portal session:', error);
        toast({
          title: "Portal Error",
          description: "Unable to open customer portal. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Portal Error",
        description: "Unable to open customer portal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const checkSubscription = async () => {
    await fetchSubscription();
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  return {
    subscription,
    isLoading,
    canPerformAction,
    consumeAction,
    getUpgradeRecommendation,
    getRemainingUsage,
    openCustomerPortal,
    checkSubscription,
    refreshSubscription,
    user
  };
};
