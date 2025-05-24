
import { useState, useEffect } from 'react';
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

  // Load user and subscription data
  useEffect(() => {
    const loadUserAndSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
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
        setError('Failed to load user data');
        setIsLoading(false);
      }
    };

    loadUserAndSubscription();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await checkSubscription();
        } else if (event === 'SIGNED_OUT') {
          setSubscription(null);
        }
      }
    );

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  // Check subscription status
  const checkSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke<SubscriptionData>('check-subscription');

      if (error) {
        throw new Error(error.message);
      }

      setSubscription(data);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to check subscription');
      toast({
        title: "Subscription Error",
        description: "Couldn't load your subscription details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // For free plan, no Stripe checkout is needed
      if (plan === 'free') {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { plan }
        });

        if (error) {
          console.error('Error with free plan subscription:', error);
          throw new Error(error.message);
        }

        // Refresh subscription data
        await checkSubscription();
        
        toast({
          title: "Subscribed to Free Plan",
          description: "You are now on the Free plan",
        });
        
        return { success: true };
      }
      
      // For paid plans, create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          plan,
          successUrl: `${window.location.origin}/pricing?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      console.log('Opening checkout URL:', data.url);
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
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
    subscribeToPlan,
    openCustomerPortal
  };
};
