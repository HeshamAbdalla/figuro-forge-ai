
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CheckoutReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const { checkSubscription } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cancelled'>('loading');
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log('Verifying payment for session:', sessionId);

        // Get session status from Stripe
        const { data, error } = await supabase.functions.invoke('get-checkout-session', {
          body: {},
          method: 'GET'
        });

        // Since we can't pass query params in the body, we'll use a different approach
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/get-checkout-session?session_id=${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': supabase.supabaseKey
          }
        });

        const sessionInfo = await response.json();

        if (!response.ok) {
          throw new Error(sessionInfo.error || 'Failed to retrieve session');
        }

        console.log('Session info:', sessionInfo);
        setSessionData(sessionInfo);

        if (sessionInfo.status === 'complete' && sessionInfo.payment_status === 'paid') {
          setStatus('success');
          
          // Refresh auth and subscription data
          await refreshAuth();
          await checkSubscription();
          
          toast({
            title: "Payment Successful!",
            description: `Your ${sessionInfo.metadata?.plan || 'subscription'} plan has been activated.`,
          });

          // Redirect to profile after a delay
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        } else if (sessionInfo.status === 'open') {
          setStatus('cancelled');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        toast({
          title: "Verification Error",
          description: "We couldn't verify your payment. Please check your subscription status in your profile.",
          variant: "destructive"
        });
      }
    };

    verifyPayment();
  }, [searchParams, refreshAuth, checkSubscription, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-figuro-accent mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Verifying Payment</h2>
            <p className="text-white/70">Please wait while we confirm your payment...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Payment Successful!</h2>
            <p className="text-white/70 mb-6">
              Your {sessionData?.metadata?.plan || 'subscription'} plan has been activated successfully.
            </p>
            <p className="text-white/50 mb-8">Redirecting you to your profile...</p>
            <Button 
              onClick={() => navigate('/profile')}
              className="bg-figuro-accent hover:bg-figuro-accent-hover"
            >
              Go to Profile Now
            </Button>
          </div>
        );

      case 'cancelled':
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Payment Cancelled</h2>
            <p className="text-white/70 mb-8">
              Your payment was not completed. You can try again anytime.
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/profile')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Back to Profile
              </Button>
            </div>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Verification Error</h2>
            <p className="text-white/70 mb-8">
              We couldn't verify your payment. Please check your subscription status or contact support.
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => navigate('/profile')}
                className="bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                Check Profile
              </Button>
              <Button 
                onClick={() => navigate('/pricing')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Back to Pricing
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CheckoutReturn;
