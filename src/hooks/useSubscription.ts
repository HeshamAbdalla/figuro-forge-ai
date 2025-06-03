
import { useState, useEffect } from "react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PlanLimits {
  image_generations_limit: number;
  model_conversions_limit: number;
  is_unlimited: boolean;
}

interface SubscriptionData {
  plan_type: string;
  plan: string;
  generation_count_today: number;
  converted_3d_this_month: number;
  generation_count_this_month: number;
  credits_remaining: number;
  bonus_credits: number;
  total_credits: number;
  status: string;
  valid_until?: string;
  is_active?: boolean;
  commercial_license?: boolean;
}

interface UpgradeRecommendation {
  recommendedPlan: string;
  features: string[];
}

export const useSubscription = () => {
  const { user } = useEnhancedAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    } else {
      setSubscription(null);
      setPlanLimits(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Fetch subscription data
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
        return;
      }

      // Create default subscription if none exists
      let subscriptionData = subData;
      if (!subData) {
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            generation_count_today: 0,
            converted_3d_this_month: 0,
            generation_count_this_month: 0,
            credits_remaining: 3,
            bonus_credits: 0,
            status: 'active'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating subscription:', createError);
          return;
        }
        subscriptionData = newSub;
      }

      // Calculate total credits including bonus credits
      const totalCredits = (subscriptionData.credits_remaining || 0) + (subscriptionData.bonus_credits || 0);

      // Add plan alias and other missing properties
      const enhancedSubscriptionData: SubscriptionData = {
        ...subscriptionData,
        plan: subscriptionData.plan_type,
        total_credits: totalCredits,
        is_active: subscriptionData.status === 'active',
      };

      setSubscription(enhancedSubscriptionData);

      // Fetch plan limits
      const { data: limitsData, error: limitsError } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan_type', subscriptionData.plan_type)
        .single();

      if (limitsError && limitsError.code !== 'PGRST116') {
        console.error('Error fetching plan limits:', limitsError);
        // Set default free plan limits
        setPlanLimits({
          image_generations_limit: 3,
          model_conversions_limit: 1,
          is_unlimited: false
        });
      } else {
        setPlanLimits(limitsData || {
          image_generations_limit: 3,
          model_conversions_limit: 1,
          is_unlimited: false
        });
      }
    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canPerformAction = (actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): boolean => {
    if (!subscription || !planLimits) return false;
    
    if (planLimits.is_unlimited) return true;

    // Check if user has any credits available (regular + bonus)
    const totalCredits = (subscription.credits_remaining || 0) + (subscription.bonus_credits || 0);
    return totalCredits > 0;
  };

  const consumeAction = async (actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): Promise<boolean> => {
    if (!user) return false;

    try {
      // Use the enhanced consume usage function
      const { data, error } = await supabase.functions.invoke('enhanced-consume-usage', {
        body: {
          feature_type: actionType === 'model_remesh' ? 'model_conversion' : actionType,
          amount: 1
        }
      });

      if (error) {
        console.error('Error consuming action:', error);
        return false;
      }

      if (!data.success) {
        console.error('Action consumption failed:', data.error);
        return false;
      }

      // Refresh subscription data
      await fetchSubscriptionData();
      return true;
    } catch (error) {
      console.error('Error in consumeAction:', error);
      return false;
    }
  };

  const getUpgradeRecommendation = (actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): UpgradeRecommendation | null => {
    if (!subscription) return null;

    if (subscription.plan_type === 'free') {
      return {
        recommendedPlan: 'Pro',
        features: [
          'More monthly credits',
          'Higher quality outputs',
          'Model remeshing capabilities',
          'Priority support'
        ]
      };
    }

    return null;
  };

  const getRemainingUsage = (actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): { used: number; limit: number; remaining: number; bonus: number } | null => {
    if (!subscription || !planLimits) return null;

    if (planLimits.is_unlimited) {
      return { used: 0, limit: -1, remaining: -1, bonus: subscription.bonus_credits || 0 }; // -1 indicates unlimited
    }

    const totalCredits = (subscription.credits_remaining || 0) + (subscription.bonus_credits || 0);
    
    // For credit-based system, we track total available credits
    return {
      used: 0, // Not applicable in credit system
      limit: subscription.credits_remaining || 0,
      remaining: totalCredits,
      bonus: subscription.bonus_credits || 0
    };
  };

  const checkSubscription = async () => {
    await fetchSubscriptionData();
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Error opening customer portal:', error);
        toast({
          title: "Portal Error",
          description: "Unable to open subscription management. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error in openCustomerPortal:', error);
      toast({
        title: "Portal Error",
        description: "Unable to open subscription management. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    subscription,
    planLimits,
    isLoading,
    canPerformAction,
    consumeAction,
    getUpgradeRecommendation,
    getRemainingUsage,
    refreshSubscription: fetchSubscriptionData,
    checkSubscription,
    openCustomerPortal,
    user
  };
};
