import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/components/auth/OptimizedAuthProvider';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
}

export const useSubscription = () => {
  const { user } = useOptimizedAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const canPerformAction = (action: string) => {
    if (!subscription) return false;
    
    // Add your subscription logic here
    return subscription.status === 'active';
  };

  return {
    subscription,
    isLoading,
    canPerformAction,
  };
};
