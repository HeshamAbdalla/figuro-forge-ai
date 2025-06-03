
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CheckoutReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuth } = useEnhancedAuth();
  const { checkSubscription } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cancelled'>('loading');
  const [paymentData, setPaymentData] = useState<any>(null);
  const processingRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      console.error('No session_id found in URL');
      setStatus('error');
      return;
    }

    // Prevent duplicate processing
    if (processingRef.current) {
      console.log('Payment verification already in progress');
      return;
    }

    const verifyPayment = async () => {
      processingRef.current = true;
      
      try {
        console.log('🔄 [CHECKOUT_RETURN] Starting payment verification for session:', sessionId);

        // Use the secure verification endpoint with retry logic
        const { data: verificationResult, error } = await supabase.functions.invoke('verify-payment-session', {
          body: { session_id: sessionId }
        });

        if (error) {
          console.error('❌ [CHECKOUT_RETURN] Verification error:', error);
          
          // Retry on certain errors
          if (retryCount < maxRetries && (error.message?.includes('network') || error.status >= 500)) {
            console.log(`🔄 [CHECKOUT_RETURN] Retrying verification (${retryCount + 1}/${maxRetries})`);
            setRetryCount(prev => prev + 1);
            processingRef.current = false;
            setTimeout(() => verifyPayment(), 2000 * (retryCount + 1)); // Exponential backoff
            return;
          }
          
          throw new Error(error.message || 'Failed to verify payment');
        }

        console.log('✅ [CHECKOUT_RETURN] Verification result:', verificationResult);
        setPaymentData(verificationResult);

        if (verificationResult.success) {
          setStatus('success');
          
          // Regenerate session for security (refresh auth tokens)
          console.log('🔄 [CHECKOUT_RETURN] Refreshing auth session');
          await refreshAuth();
          
          // Check subscription to update local state
          console.log('🔄 [CHECKOUT_RETURN] Refreshing subscription state');
          await checkSubscription();
          
          toast({
            title: "Payment Successful!",
            description: verificationResult.wasUpgrade 
              ? `Your ${verificationResult.plan} plan has been activated with ${verificationResult.creditsAllocated} credits!`
              : `Your ${verificationResult.plan} plan has been activated.`,
          });

          // Set a flag in sessionStorage to prevent duplicate processing on profile page
          sessionStorage.setItem('payment_verified', 'true');
          sessionStorage.setItem('verified_plan', verificationResult.plan);

          // Redirect to profile after a delay to allow state updates
          setTimeout(() => {
            console.log('🔄 [CHECKOUT_RETURN] Redirecting to profile page');
            navigate('/profile?payment_success=true');
          }, 2000);
        } else {
          if (verificationResult.message?.includes('not completed')) {
            setStatus('cancelled');
          } else {
            setStatus('error');
          }
        }
      } catch (error) {
        console.error('❌ [CHECKOUT_RETURN] Error verifying payment:', error);
        setStatus('error');
        toast({
          title: "Verification Error",
          description: "We couldn't verify your payment. Please check your subscription status in your profile.",
          variant: "destructive"
        });
      } finally {
        processingRef.current = false;
      }
    };

    verifyPayment();
  }, [searchParams, refreshAuth, checkSubscription, navigate, retryCount]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-figuro-accent mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Verifying Payment</h2>
            <p className="text-white/70">Please wait while we securely verify your payment...</p>
            {retryCount > 0 && (
              <p className="text-white/50 mt-2">Retry attempt {retryCount}/{maxRetries}</p>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Payment Successful!</h2>
            <p className="text-white/70 mb-6">
              Your {paymentData?.plan || 'subscription'} plan has been activated successfully.
            </p>
            {paymentData?.wasUpgrade && (
              <div className="bg-figuro-accent/20 border border-figuro-accent/30 rounded-lg p-4 mb-6">
                <p className="text-figuro-accent font-medium">
                  🎉 Upgrade Complete! Your usage has been reset and you have {paymentData.creditsAllocated} credits available.
                </p>
              </div>
            )}
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
            <h2 className="text-2xl font-bold text-white mb-4">Payment Incomplete</h2>
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
