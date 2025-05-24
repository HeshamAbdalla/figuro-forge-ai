import { useState, useEffect, useCallback } from 'react';
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
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke<SubscriptionData>('check-subscription');

      if (error) {
        throw new Error(error.message);
      }

      setSubscription(data);
      setError(null);
      console.log('Subscription data updated:', data);
    } catch (err) {
      console.error('Error checking subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to check subscription';
      setError(errorMessage);
      
      // Only show toast for non-auth errors
      if (!errorMessage.includes('Authentication') && !errorMessage.includes('not authenticated')) {
        toast({
          title: "Subscription Error",
          description: "Couldn't load your subscription details. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, []);

  // Verify subscription matches expected plan
  const verifySubscription = useCallback(async (expectedPlan: 'free' | 'starter' | 'pro' | 'unlimited'): Promise<boolean> => {
    try {
      console.log('Verifying subscription for expected plan:', expectedPlan);
      
      // Refresh subscription data first
      await checkSubscription();
      
      // Check if the current subscription matches the expected plan
      if (subscription?.plan === expectedPlan) {
        console.log('Subscription verification successful:', subscription.plan);
        return true;
      }
      
      console.log('Subscription verification failed. Expected:', expectedPlan, 'Actual:', subscription?.plan);
      return false;
    } catch (err) {
      console.error('Error verifying subscription:', err);
      return false;
    }
  }, [subscription, checkSubscription]);

  // Load user and subscription data
  useEffect(() => {
    let mounted = true;

    const loadUserAndSubscription = async () => {
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
        await checkSubscription();
      } catch (err) {
        console.error('Error loading user data:', err);
        if (mounted) {
          setError('Failed to load user data');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadUserAndSubscription();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Small delay to ensure auth state is settled
          setTimeout(async () => {
            if (mounted) {
              await checkSubscription();
              setIsLoading(false);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setSubscription(null);
          setError(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authSub.unsubscribe();
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
      console.log('Subscribing to plan:', plan);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan,
          successUrl: `${window.location.origin}/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error.message);
      }

      if (plan === 'free') {
        // Refresh subscription data for free plan
        await checkSubscription();
        
        toast({
          title: "Switched to Free Plan",
          description: "You are now on the Free plan.",
        });
        
        return { success: true };
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      console.log('Redirecting to checkout URL:', data.url);
      // Redirect to Stripe checkout
      window.location.href = data.url;
      return data;
    } catch (err) {
      console.error('Error creating subscription:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      toast({
        title: "Subscription Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  // Open customer portal to manage subscription
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

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error opening customer portal:', err);
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
    openCustomerPortal
  };
};
