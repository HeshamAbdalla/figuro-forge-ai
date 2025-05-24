
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
      console.log('Subscription data updated:', data);
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
          successUrl: `${window.location.origin}/profile?success=true&plan=${plan}`,
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

      console.log('Redirecting to checkout URL:', data.url);
      // Redirect to Stripe checkout in the same tab for better session management
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

  // Verify subscription after payment with improved logic
  const verifySubscription = async (expectedPlan?: string) => {
    try {
      console.log('Verifying subscription status with expected plan:', expectedPlan);
      
      // Check subscription status
      await checkSubscription();
      
      // Check if the subscription data indicates the expected plan
      if (subscription && expectedPlan) {
        const planMatches = subscription.plan === expectedPlan;
        const isActive = subscription.is_active;
        
        console.log('Verification result:', { 
          currentPlan: subscription.plan, 
          expectedPlan, 
          planMatches, 
          isActive 
        });
        
        return planMatches && isActive;
      }
      
      // If no expected plan, just check if user has any active paid plan
      return subscription?.plan !== 'free' && subscription?.is_active;
    } catch (error) {
      console.error('Error verifying subscription:', error);
      return false;
    }
  };

  // Reset usage limits (useful after subscription upgrade)
  const resetUsageLimits = async () => {
    if (!user) return;
    
    try {
      // Reset usage tracking in the database
      const { error } = await supabase
        .from('user_usage')
        .upsert({
          user_id: user.id,
          image_generations_used: 0,
          model_conversions_used: 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error resetting usage limits:', error);
      } else {
        console.log('Usage limits reset successfully');
        // Refresh subscription data to show updated usage
        await checkSubscription();
      }
    } catch (error) {
      console.error('Error in resetUsageLimits:', error);
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
    openCustomerPortal,
    verifySubscription,
    resetUsageLimits
  };
};
