
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SubscriptionLimits {
  image_generations_limit: number;
  model_conversions_limit: number;
}

export interface UsageStats {
  image_generations_used: number;
  model_conversions_used: number;
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

  // Verify subscription matches expected plan
  const verifySubscription = useCallback(async (expectedPlan: 'free' | 'starter' | 'pro' | 'unlimited'): Promise<boolean> => {
    try {
      console.log('🔍 [SUBSCRIPTION] Verifying subscription for expected plan:', expectedPlan);
      
      // Use current subscription data if available and recent
      if (subscription && (Date.now() - lastCheckTimeRef.current) < 30000) {
        const matches = subscription.plan === expectedPlan && subscription.is_active;
        console.log('🔍 [SUBSCRIPTION] Using cached data for verification:', matches);
        return matches;
      }
      
      // Only refresh if really needed
      await checkSubscription();
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const matches = subscription?.plan === expectedPlan && subscription?.is_active;
      console.log('🔍 [SUBSCRIPTION] Verification result:', matches);
      return matches;
    } catch (err) {
      console.error('❌ [SUBSCRIPTION] Error verifying subscription:', err);
      return false;
    }
  }, [subscription, checkSubscription]);

  // Check if user has enough credits for an action
  const hasCredits = useCallback((creditsNeeded: number = 1): boolean => {
    if (!subscription) return false;
    
    // Unlimited plans have infinite credits
    if (subscription.plan === 'unlimited') return true;
    
    // Check if user has enough credits remaining
    return subscription.credits_remaining >= creditsNeeded;
  }, [subscription]);

  // Consume credits for an action
  const consumeCredits = useCallback(async (creditsToConsume: number = 1): Promise<boolean> => {
    if (!subscription || !user) return false;
    
    // Unlimited plans don't consume credits
    if (subscription.plan === 'unlimited') return true;
    
    // Check if user has enough credits
    if (subscription.credits_remaining < creditsToConsume) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits for this action. Please upgrade your plan.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Update credits in database
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          credits_remaining: subscription.credits_remaining - creditsToConsume,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error consuming credits:', error);
        return false;
      }
      
      // Update local state
      setSubscription(prev => prev ? {
        ...prev,
        credits_remaining: prev.credits_remaining - creditsToConsume
      } : null);
      
      return true;
    } catch (err) {
      console.error('Error consuming credits:', err);
      return false;
    }
  }, [subscription, user]);

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
    verifySubscription,
    subscribeToPlan,
    openCustomerPortal,
    hasCredits,
    consumeCredits
  };
};
