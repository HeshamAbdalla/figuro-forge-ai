
import { useState, useEffect, useRef, useCallback } from "react";
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
  const [retryCount, setRetryCount] = useState(0);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);

  // Debounced fetch function to prevent rapid successive calls
  const debouncedFetch = useCallback(async (force = false) => {
    const now = Date.now();
    const minInterval = 2000; // 2 seconds minimum between fetches
    
    if (!force && (now - lastFetchRef.current) < minInterval) {
      console.log('🔄 [useSubscription] Skipping fetch due to debounce');
      return;
    }
    
    if (fetchingRef.current) {
      console.log('🔄 [useSubscription] Fetch already in progress');
      return;
    }
    
    fetchingRef.current = true;
    lastFetchRef.current = now;
    
    try {
      await fetchSubscriptionData();
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('❌ [useSubscription] Fetch failed:', error);
      
      // Exponential backoff retry logic
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 [useSubscription] Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchingRef.current = false;
          debouncedFetch(true);
        }, delay);
      } else {
        console.error('❌ [useSubscription] Max retries reached');
        setRetryCount(0);
      }
    } finally {
      if (retryCount === 0) {
        fetchingRef.current = false;
      }
    }
  }, [retryCount]);

  useEffect(() => {
    if (user) {
      debouncedFetch();
    } else {
      setSubscription(null);
      setPlanLimits(null);
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [user, debouncedFetch]);

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('🔄 [useSubscription] Fetching subscription data for user:', user.id);
      
      // Fetch subscription data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .abortSignal(controller.signal)
        .single();

      clearTimeout(timeoutId);

      if (subError && subError.code !== 'PGRST116') {
        console.error('❌ [useSubscription] Error fetching subscription:', subError);
        throw new Error(`Subscription fetch failed: ${subError.message}`);
      }

      // Create default subscription if none exists
      let subscriptionData = subData;
      if (!subData) {
        console.log('🔧 [useSubscription] Creating default subscription');
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            generation_count_today: 0,
            converted_3d_this_month: 0,
            generation_count_this_month: 0,
            credits_remaining: 10, // Free plan default
            bonus_credits: 0,
            status: 'active'
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ [useSubscription] Error creating subscription:', createError);
          throw new Error(`Subscription creation failed: ${createError.message}`);
        }
        subscriptionData = newSub;
      }

      // Calculate total credits including bonus credits - ensure bonus_credits is not null
      const bonusCredits = subscriptionData.bonus_credits || 0;
      const regularCredits = subscriptionData.credits_remaining || 0;
      const totalCredits = regularCredits + bonusCredits;

      // Add plan alias and other missing properties
      const enhancedSubscriptionData: SubscriptionData = {
        ...subscriptionData,
        plan: subscriptionData.plan_type,
        bonus_credits: bonusCredits,
        total_credits: totalCredits,
        is_active: subscriptionData.status === 'active',
      };

      console.log('✅ [useSubscription] Subscription data loaded:', {
        plan: enhancedSubscriptionData.plan_type,
        credits: totalCredits,
        status: enhancedSubscriptionData.status
      });

      setSubscription(enhancedSubscriptionData);

      // Fetch plan limits with timeout
      const limitsController = new AbortController();
      const limitsTimeoutId = setTimeout(() => limitsController.abort(), 5000);
      
      const { data: limitsData, error: limitsError } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan_type', subscriptionData.plan_type)
        .abortSignal(limitsController.signal)
        .single();

      clearTimeout(limitsTimeoutId);

      if (limitsError && limitsError.code !== 'PGRST116') {
        console.error('❌ [useSubscription] Error fetching plan limits:', limitsError);
        // Set default free plan limits instead of throwing
        setPlanLimits({
          image_generations_limit: 10,
          model_conversions_limit: 3,
          is_unlimited: false
        });
      } else {
        setPlanLimits(limitsData || {
          image_generations_limit: 10,
          model_conversions_limit: 3,
          is_unlimited: false
        });
      }
      
      console.log('✅ [useSubscription] Plan limits loaded for plan:', subscriptionData.plan_type);

    } catch (error: any) {
      console.error('❌ [useSubscription] Error in fetchSubscriptionData:', error);
      
      // Don't show error toast for aborted requests (user navigated away)
      if (error.name !== 'AbortError') {
        // Only show toast on first failure to avoid spam
        if (retryCount === 0) {
          toast({
            title: "Subscription Error",
            description: "Failed to load subscription data. Retrying...",
            variant: "destructive"
          });
        }
      }
      
      throw error; // Re-throw to trigger retry logic
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
      // Get fresh session for API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('❌ [useSubscription] No valid session for consuming action');
        return false;
      }

      // Use the enhanced consume usage function with proper authentication
      const { data, error } = await supabase.functions.invoke('enhanced-consume-usage', {
        body: {
          feature_type: actionType === 'model_remesh' ? 'model_conversion' : actionType,
          amount: 1
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('❌ [useSubscription] Error consuming action:', error);
        return false;
      }

      if (!data?.success) {
        console.error('❌ [useSubscription] Action consumption failed:', data?.error);
        return false;
      }

      // Refresh subscription data
      await debouncedFetch(true);
      return true;
    } catch (error) {
      console.error('❌ [useSubscription] Error in consumeAction:', error);
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

  const checkSubscription = useCallback(async () => {
    await debouncedFetch(true);
  }, [debouncedFetch]);

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
      // Get fresh session for API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: "Session Expired",
          description: "Please refresh the page and try again.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error('❌ [useSubscription] Error opening customer portal:', error);
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
      console.error('❌ [useSubscription] Error in openCustomerPortal:', error);
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
    refreshSubscription: () => debouncedFetch(true),
    checkSubscription,
    openCustomerPortal,
    user
  };
};
