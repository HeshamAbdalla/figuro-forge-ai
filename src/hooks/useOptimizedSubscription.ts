
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useOptimizedAuth } from "@/components/auth/OptimizedAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/logLevelManager";

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

export const useOptimizedSubscription = () => {
  const { user } = useOptimizedAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Performance optimization refs
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const retryCountRef = useRef(0);
  const subscriptionRefreshTimeoutRef = useRef<NodeJS.Timeout>();
  
  logger.debug('useOptimizedSubscription: Hook rendered', 'subscription-perf');

  // Debounced fetch function with exponential backoff
  const debouncedFetch = useCallback(async (force = false) => {
    const now = Date.now();
    const minInterval = 2000; // 2 seconds minimum between fetches
    
    if (!force && (now - lastFetchRef.current) < minInterval) {
      logger.debug('useOptimizedSubscription: Skipping fetch due to debounce', 'subscription-perf');
      return;
    }
    
    if (fetchingRef.current) {
      logger.debug('useOptimizedSubscription: Fetch already in progress', 'subscription-perf');
      return;
    }
    
    if (!user || !mountedRef.current) {
      logger.debug('useOptimizedSubscription: No user or component unmounted', 'subscription-perf');
      return;
    }
    
    fetchingRef.current = true;
    lastFetchRef.current = now;
    
    try {
      logger.debug('useOptimizedSubscription: Fetching subscription data', 'subscription-perf', { userId: user.id });
      
      setIsLoading(true);
      
      // Fetch subscription data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .abortSignal(controller.signal)
        .single();

      clearTimeout(timeoutId);

      if (subError && subError.code !== 'PGRST116') {
        throw new Error(`Subscription fetch failed: ${subError.message}`);
      }

      // Create default subscription if none exists
      let subscriptionData = subData;
      if (!subData && mountedRef.current) {
        logger.debug('useOptimizedSubscription: Creating default subscription', 'subscription-perf');
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            generation_count_today: 0,
            converted_3d_this_month: 0,
            generation_count_this_month: 0,
            credits_remaining: 10,
            bonus_credits: 0,
            status: 'active'
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Subscription creation failed: ${createError.message}`);
        }
        subscriptionData = newSub;
      }

      if (!mountedRef.current) return;

      // Calculate total credits
      const bonusCredits = subscriptionData.bonus_credits || 0;
      const regularCredits = subscriptionData.credits_remaining || 0;
      const totalCredits = regularCredits + bonusCredits;

      const enhancedSubscriptionData: SubscriptionData = {
        ...subscriptionData,
        plan: subscriptionData.plan_type,
        bonus_credits: bonusCredits,
        total_credits: totalCredits,
        is_active: subscriptionData.status === 'active',
      };

      setSubscription(enhancedSubscriptionData);

      // Fetch plan limits
      const limitsController = new AbortController();
      const limitsTimeoutId = setTimeout(() => limitsController.abort(), 5000);
      
      const { data: limitsData, error: limitsError } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan_type', subscriptionData.plan_type)
        .abortSignal(limitsController.signal)
        .single();

      clearTimeout(limitsTimeoutId);

      if (mountedRef.current) {
        if (limitsError && limitsError.code !== 'PGRST116') {
          // Set default free plan limits
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
      }
      
      retryCountRef.current = 0; // Reset retry count on success
      logger.debug('useOptimizedSubscription: Subscription data loaded successfully', 'subscription-perf');

    } catch (error: any) {
      logger.error('useOptimizedSubscription: Fetch failed', 'subscription-perf', error);
      
      if (!mountedRef.current) return;
      
      // Exponential backoff retry logic
      if (retryCountRef.current < 3 && error.name !== 'AbortError') {
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        logger.debug('useOptimizedSubscription: Retrying fetch', 'subscription-perf', { 
          attempt: retryCountRef.current + 1,
          delay 
        });
        
        subscriptionRefreshTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            retryCountRef.current++;
            fetchingRef.current = false;
            debouncedFetch(true);
          }
        }, delay);
      } else {
        retryCountRef.current = 0;
        
        // Only show error toast on first failure to avoid spam  
        if (retryCountRef.current === 0 && error.name !== 'AbortError') {
          toast({
            title: "Subscription Error",
            description: "Failed to load subscription data. Some features may be limited.",
            variant: "destructive"
          });
        }
      }
    } finally {
      if (mountedRef.current && retryCountRef.current === 0) {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [user]);

  // Listen for auth subscription refresh events
  useEffect(() => {
    const handleAuthSubscriptionRefresh = () => {
      logger.debug('useOptimizedSubscription: Auth triggered subscription refresh', 'subscription-perf');
      if (user && mountedRef.current) {
        // Clear any pending retries
        if (subscriptionRefreshTimeoutRef.current) {
          clearTimeout(subscriptionRefreshTimeoutRef.current);
        }
        retryCountRef.current = 0;
        fetchingRef.current = false;
        debouncedFetch(true);
      }
    };

    window.addEventListener('auth-subscription-refresh', handleAuthSubscriptionRefresh);

    return () => {
      window.removeEventListener('auth-subscription-refresh', handleAuthSubscriptionRefresh);
    };
  }, [user, debouncedFetch]);

  // Initialize subscription data when user changes
  useEffect(() => {
    if (user) {
      debouncedFetch();
    } else {
      // Clear state when no user
      setSubscription(null);
      setPlanLimits(null);
      setIsLoading(false);
      fetchingRef.current = false;
      retryCountRef.current = 0;
    }
  }, [user, debouncedFetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (subscriptionRefreshTimeoutRef.current) {
        clearTimeout(subscriptionRefreshTimeoutRef.current);
      }
    };
  }, []);

  // Memoized helper functions
  const canPerformAction = useCallback((actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): boolean => {
    if (!subscription || !planLimits) return false;
    
    if (planLimits.is_unlimited) return true;

    const totalCredits = (subscription.credits_remaining || 0) + (subscription.bonus_credits || 0);
    return totalCredits > 0;
  }, [subscription, planLimits]);

  const consumeAction = useCallback(async (actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): Promise<boolean> => {
    if (!user) return false;

    try {
      logger.debug('useOptimizedSubscription: Consuming action', 'subscription-perf', { actionType });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        logger.error('useOptimizedSubscription: No valid session for consuming action', 'subscription-perf');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('enhanced-consume-usage', {
        body: {
          feature_type: actionType === 'model_remesh' ? 'model_conversion' : actionType,
          amount: 1
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (error || !data?.success) {
        logger.error('useOptimizedSubscription: Action consumption failed', 'subscription-perf', { error, data });
        return false;
      }

      // Refresh subscription data after consumption
      setTimeout(() => {
        if (mountedRef.current) {
          debouncedFetch(true);
        }
      }, 500);

      return true;
    } catch (error) {
      logger.error('useOptimizedSubscription: Error in consumeAction', 'subscription-perf', error);
      return false;
    }
  }, [user, debouncedFetch]);

  const getUpgradeRecommendation = useCallback((actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): UpgradeRecommendation | null => {
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
  }, [subscription]);

  const getRemainingUsage = useCallback((actionType: 'image_generation' | 'model_conversion' | 'model_remesh'): { 
    used: number; 
    limit: number; 
    remaining: number; 
    bonus: number 
  } | null => {
    if (!subscription || !planLimits) return null;

    if (planLimits.is_unlimited) {
      return { used: 0, limit: -1, remaining: -1, bonus: subscription.bonus_credits || 0 };
    }

    const totalCredits = (subscription.credits_remaining || 0) + (subscription.bonus_credits || 0);
    
    return {
      used: 0,
      limit: subscription.credits_remaining || 0,
      remaining: totalCredits,
      bonus: subscription.bonus_credits || 0
    };
  }, [subscription, planLimits]);

  const checkSubscription = useCallback(async () => {
    await debouncedFetch(true);
  }, [debouncedFetch]);

  const openCustomerPortal = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription.",
        variant: "destructive"
      });
      return;
    }

    try {
      logger.debug('useOptimizedSubscription: Opening customer portal', 'subscription-perf');
      
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
        logger.error('useOptimizedSubscription: Error opening customer portal', 'subscription-perf', error);
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
      logger.error('useOptimizedSubscription: Error in openCustomerPortal', 'subscription-perf', error);
      toast({
        title: "Portal Error",
        description: "Unable to open subscription management. Please try again.",
        variant: "destructive"
      });
    }
  }, [user]);

  // Memoized return value to prevent unnecessary re-renders of consuming components
  const returnValue = useMemo(() => ({
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
  }), [
    subscription,
    planLimits,
    isLoading,
    canPerformAction,
    consumeAction,
    getUpgradeRecommendation,
    getRemainingUsage,
    debouncedFetch,
    checkSubscription,
    openCustomerPortal,
    user
  ]);

  return returnValue;
};
