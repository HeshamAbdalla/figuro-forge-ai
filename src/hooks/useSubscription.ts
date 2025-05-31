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
  plan: string; // Add plan alias for plan_type
  generation_count_today: number;
  converted_3d_this_month: number;
  generation_count_this_month: number;
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

      // Add plan alias and other missing properties
      const enhancedSubscriptionData: SubscriptionData = {
        ...subscriptionData,
        plan: subscriptionData.plan_type, // Add plan alias
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

    if (actionType === 'image_generation') {
      return subscription.generation_count_today < planLimits.image_generations_limit;
    } else if (actionType === 'model_conversion') {
      return subscription.converted_3d_this_month < planLimits.model_conversions_limit;
    } else if (actionType === 'model_remesh') {
      // Remeshing uses the same limit as model conversions for now
      return subscription.converted_3d_this_month < planLimits.model_conversions_limit;
    }

    return false;
  };

  const consumeAction = async (actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): Promise<boolean> => {
    if (!user) return false;

    try {
      // Map remesh action to model_conversion for the database function
      const dbActionType = actionType === 'model_remesh' ? 'model_conversion' : actionType;
      
      const { data, error } = await supabase.rpc('consume_feature_usage', {
        feature_type: dbActionType,
        user_id_param: user.id,
        amount: 1
      });

      if (error) {
        console.error('Error consuming action:', error);
        return false;
      }

      // Refresh subscription data
      await fetchSubscriptionData();
      return data;
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
          'Unlimited image generations',
          'More 3D conversions',
          'Model remeshing capabilities',
          'Priority support'
        ]
      };
    }

    return null;
  };

  const getRemainingUsage = (actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): { used: number; limit: number; remaining: number } | null => {
    if (!subscription || !planLimits) return null;

    if (planLimits.is_unlimited) {
      return { used: 0, limit: -1, remaining: -1 }; // -1 indicates unlimited
    }

    if (actionType === 'image_generation') {
      const used = subscription.generation_count_today;
      const limit = planLimits.image_generations_limit;
      return { used, limit, remaining: Math.max(0, limit - used) };
    } else if (actionType === 'model_conversion' || actionType === 'model_remesh') {
      const used = subscription.converted_3d_this_month;
      const limit = planLimits.model_conversions_limit;
      return { used, limit, remaining: Math.max(0, limit - used) };
    }

    return null;
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
