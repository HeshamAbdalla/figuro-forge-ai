
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout as StripeEmbeddedCheckout
} from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RPWcEFz9RxnLs0LvacWh5EtcQX5FG2JX89LCK58eZtOX1P6moZV5KTBmflmaHK00vGmYvaLfvztHMs7dnSU1RH900OlXNErBo');

interface EmbeddedCheckoutProps {
  planId: string;
  onClose: () => void;
}

export const EmbeddedCheckout: React.FC<EmbeddedCheckoutProps> = ({ planId, onClose }) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Creating embedded checkout session for plan:', planId);

        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            plan: planId,
            mode: 'embedded'
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data?.clientSecret) {
          throw new Error('No client secret returned from checkout session');
        }

        console.log('Embedded checkout session created successfully');
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating checkout session:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout session';
        setError(errorMessage);
        toast({
          title: "Checkout Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (planId) {
      createCheckoutSession();
    }
  }, [planId]);

  const options = {
    clientSecret,
    onComplete: () => {
      console.log('Embedded checkout completed successfully');
      toast({
        title: "Payment Processing",
        description: "Your payment is being processed. Redirecting you to verify...",
      });
      
      // Close the modal and redirect will be handled by the return URL
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 min-h-[300px] sm:min-h-[400px]">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-figuro-accent mb-4" />
        <p className="text-white/70 text-sm sm:text-base text-center">Setting up secure checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 min-h-[300px] sm:min-h-[400px]">
        <p className="text-red-400 mb-4 text-sm sm:text-base text-center">Error: {error}</p>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-figuro-accent text-white rounded hover:bg-figuro-accent-hover text-sm sm:text-base"
        >
          Close
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 min-h-[300px] sm:min-h-[400px]">
        <p className="text-white/70 text-sm sm:text-base text-center">Initializing secure payment...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full mx-auto">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
          <div className="w-full">
            <StripeEmbeddedCheckout />
          </div>
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
};
