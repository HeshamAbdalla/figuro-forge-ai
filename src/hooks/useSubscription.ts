import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PLANS } from '@/config/plans';

export interface SubscriptionLimits {
  image_generations_limit: number;
  model_conversions_limit: number;
}

export interface UsageStats {
  image_generations_used: number;
  model_conversions_used: number;
  generation_count_today: number;
  converted_3d_this_month: number;
}

export interface SubscriptionData {
  plan: 'free' | 'starter' | 'pro' | 'unlimited';
  commercial_license: boolean;
  additional_conversions: number;
  is_active: boolean;
  valid_until: string | null;
  usage: UsageStats;
  limits: SubscriptionLimits;
  credits_remaining: number;
  status: 'active' | 'past_due' | 'canceled' | 'inactive' | 'expired';
  generation_count_today: number;
  converted_3d_this_month: number;
  last_generated_at: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Use refs to prevent duplicate calls
  const isCheckingRef = useRef(false);
  const lastCheckTimeRef = useRef(0);
  const mountedRef = useRef(true);

  // Debounced check subscription with rate limiting protection
  const checkSubscription = useCallback(async () => {
    const now = Date.now();
    
    // Prevent duplicate calls and rate limiting
    if (isCheckingRef.current || (now - lastCheckTimeRef.current) < 10000) {
      console.log('🚫 [SUBSCRIPTION] Skipping check - too recent or already checking');
      return;
    }

    if (!mountedRef.current) {
      return;
    }

    isCheckingRef.current = true;
    lastCheckTimeRef.current = now;

    try {
      console.log('🔄 [SUBSCRIPTION] Checking subscription status');
      
      const { data, error } = await supabase.functions.invoke<SubscriptionData>('check-subscription');

      if (!mountedRef.current) {
        return;
      }

      if (error) {
        // Handle rate limit errors gracefully
        if (error.message?.includes('rate limit')) {
          console.warn('⚠️ [SUBSCRIPTION] Rate limited, using cached data');
          return;
        }
        throw new Error(error.message);
      }

      setSubscription(data);
      setError(null);
      console.log('✅ [SUBSCRIPTION] Subscription data updated:', data);
    } catch (err) {
      console.error('❌ [SUBSCRIPTION] Error checking subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to check subscription';
      
      // Only show toast for critical errors, not rate limits
      if (!errorMessage.includes('rate limit') && !errorMessage.includes('Authentication')) {
        setError(errorMessage);
        toast({
          title: "Subscription Error",
          description: "Couldn't load your subscription details. Using cached data.",
          variant: "default"
        });
      }
    } finally {
      isCheckingRef.current = false;
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Check if user can perform action with enhanced limit checking
  const canPerformAction = useCallback((actionType: 'image_generation' | 'model_conversion'): boolean => {
    if (!subscription || !user) return false;
    
    const planConfig = PLANS[subscription.plan];
    if (!planConfig) return false;
    
    // Check credits first
    if (subscription.credits_remaining <= 0 && !planConfig.limits.isUnlimited) {
      return false;
    }
    
    // Check specific limits
    if (actionType === 'image_generation') {
      return planConfig.limits.isUnlimited || 
             subscription.generation_count_today < planConfig.limits.imageGenerationsPerDay;
    } else if (actionType === 'model_conversion') {
      return planConfig.limits.isUnlimited || 
             subscription.converted_3d_this_month < planConfig.limits.modelConversionsPerMonth;
    }
    
    return false;
  }, [subscription, user]);

  // Enhanced consume action with database function integration
  const consumeAction = useCallback(async (actionType: 'image_generation' | 'model_conversion'): Promise<boolean> => {
    if (!subscription || !user) return false;
    
    try {
      // Use the database function to consume usage
      const { data, error } = await supabase.rpc('consume_feature_usage', {
        feature_type: actionType,
        user_id_param: user.id,
        amount: 1
      });
      
      if (error) {
        console.error('Error consuming action:', error);
        return false;
      }
      
      if (!data) {
        toast({
          title: "Usage Limit Reached",
          description: `You've reached your ${actionType.replace('_', ' ')} limit. Please upgrade your plan.`,
          variant: "destructive"
        });
        return false;
      }
      
      // Refresh subscription data after consumption
      setTimeout(checkSubscription, 500);
      
      return true;
    } catch (err) {
      console.error('Error consuming action:', err);
      return false;
    }
  }, [subscription, user, checkSubscription]);

  // Get upgrade recommendations
  const getUpgradeRecommendation = useCallback((actionType: 'image_generation' | 'model_conversion') => {
    if (!subscription) return null;
    
    const currentPlan = PLANS[subscription.plan];
    const nextPlanOrder = currentPlan.order + 1;
    const recommendedPlan = Object.values(PLANS).find(plan => plan.order === nextPlanOrder);
    
    if (!recommendedPlan) return null;
    
    return {
      currentPlan: currentPlan.name,
      recommendedPlan: recommendedPlan.name,
      benefits: actionType === 'image_generation' 
        ? `Increase daily limit from ${currentPlan.limits.imageGenerationsPerDay} to ${recommendedPlan.limits.imageGenerationsPerDay}`
        : `Increase monthly limit from ${currentPlan.limits.modelConversionsPerMonth} to ${recommendedPlan.limits.modelConversionsPerMonth}`,
      price: recommendedPlan.price
    };
  }, [subscription]);

  // Initialize subscription data
  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const initializeSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (!session?.user) {
          setUser(null);
          setSubscription(null);
          setIsLoading(false);
          return;
        }
        
        setUser(session.user);
        
        // Initial subscription check
        await checkSubscription();
      } catch (err) {
        console.error('❌ [SUBSCRIPTION] Error initializing:', err);
        if (mounted) {
          setError('Failed to initialize subscription data');
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 [SUBSCRIPTION] Auth state changed:', event, session?.user?.email);
        
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Delay to prevent conflicts with auth initialization
          setTimeout(() => {
            if (mounted) {
              checkSubscription();
            }
          }, 2000);
        } else if (event === 'SIGNED_OUT') {
          setSubscription(null);
          setError(null);
          setIsLoading(false);
        }
      }
    );

    initializeSubscription();

    return () => {
      mounted = false;
      mountedRef.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [checkSubscription]);

  // Subscribe to a plan
  const subscribeToPlan = async (
    plan: 'free' | 'starter' | 'pro' | 'unlimited'
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('💳 [SUBSCRIPTION] Subscribing to plan:', plan);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan,
          successUrl: `${window.location.origin}/profile?success=true&plan=${plan}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        }
      });

      if (error) {
        console.error('❌ [SUBSCRIPTION] Error creating checkout session:', error);
        throw new Error(error.message);
      }

      if (plan === 'free') {
        // Refresh subscription data for free plan
        setTimeout(checkSubscription, 1000);
        
        toast({
          title: "Switched to Free Plan",
          description: "You are now on the Free plan.",
        });
        
        return { success: true };
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      console.log('💳 [SUBSCRIPTION] Redirecting to checkout:', data.url);
      window.location.href = data.url;
      return data;
    } catch (err) {
      console.error('❌ [SUBSCRIPTION] Error creating subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      toast({
        title: "Subscription Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  // Open customer portal
  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('No portal URL returned');
      }

      window.open(data.url, '_blank');
    } catch (err) {
      console.error('❌ [SUBSCRIPTION] Error opening customer portal:', err);
      toast({
        title: "Portal Error",
        description: err instanceof Error ? err.message : 'Failed to open customer portal',
        variant: "destructive"
      });
    }
  };

  return {
    subscription,
    isLoading,
    error,
    user,
    checkSubscription,
    subscribeToPlan,
    openCustomerPortal,
    canPerformAction,
    consumeAction,
    getUpgradeRecommendation,
    // Legacy compatibility
    hasCredits: (creditsNeeded: number = 1) => canPerformAction('image_generation'),
    consumeCredits: (creditsToConsume: number = 1) => consumeAction('image_generation'),
  };
};
