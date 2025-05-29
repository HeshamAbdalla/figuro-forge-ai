import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: [
      { name: "3 Image Generations / Month", included: true },
      { name: "1 Model Conversion / Month", included: true },
      { name: "Basic Art Styles", included: true },
      { name: "Standard Resolution", included: true },
      { name: "Personal Use License", included: true },
      { name: "Commercial License", included: false },
      { name: "Priority Support", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$12.99",
    features: [
      { name: "20 Image Generations / Month", included: true },
      { name: "5 Model Conversions / Month", included: true },
      { name: "All Art Styles", included: true },
      { name: "High Resolution", included: true },
      { name: "Personal Use License", included: true },
      { name: "Commercial License", included: false },
      { name: "Priority Support", included: false },
    ],
    recommended: true,
  },
  {
    id: "pro",
    name: "Professional",
    price: "$29.99",
    features: [
      { name: "100 Image Generations / Month", included: true },
      { name: "20 Model Conversions / Month", included: true },
      { name: "All Art Styles", included: true },
      { name: "Ultra High Resolution", included: true },
      { name: "Personal Use License", included: true },
      { name: "Commercial License", included: true },
      { name: "Priority Support", included: true },
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: "$59.99",
    features: [
      { name: "Unlimited Image Generations", included: true },
      { name: "Unlimited Model Conversions", included: true },
      { name: "All Art Styles + Beta Features", included: true },
      { name: "Ultra High Resolution", included: true },
      { name: "Personal Use License", included: true },
      { name: "Commercial License", included: true },
      { name: "Priority Support", included: true },
    ],
  },
];

const Pricing = () => {
  const { user, profile } = useEnhancedAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const currentPlan = profile?.plan || "free";
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  
  // Show toast messages for Stripe redirects
  useEffect(() => {
    if (success === "true") {
      toast({
        title: "Subscription activated!",
        description: "Your plan has been activated successfully.",
      });
      // Refresh the page to update subscription status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else if (canceled === "true") {
      toast({
        title: "Subscription canceled",
        description: "You can subscribe at any time.",
      });
    }
  }, [success, canceled]);

  // Function to get the correct button text based on authentication and plan status
  const getButtonText = (planId: string) => {
    // If user is not authenticated
    if (!user) {
      return planId === "free" ? "Signup" : "Subscribe";
    }
    
    // If user is authenticated
    if (currentPlan === planId) {
      return "Current Plan";
    }
    
    return "Subscribe";
  };

  // Function to check if button should be disabled
  const isButtonDisabled = (planId: string) => {
    return user && currentPlan === planId;
  };
  
  const handleSubscribe = async (planId: string) => {
    // If user is not logged in, redirect to auth page
    if (!user) {
      navigate("/auth");
      return;
    }

    if (planId === currentPlan) {
      return; // Already on this plan
    }
    
    // If user selects free plan, no need for payment
    if (planId === "free") {
      // Functionality for downgrading to free plan would go here
      return;
    }
    
    setLoadingPlanId(planId);
    
    try {
      console.log('Creating checkout for plan:', planId);
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          plan: planId,
          successUrl: `${window.location.origin}/pricing?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        }
      });
      
      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message);
      }
      
      if (data?.url) {
        console.log('Opening checkout URL:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Checkout",
          description: "A new tab will open with Stripe checkout.",
        });
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoadingPlanId(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-center text-white">
            Choose Your Plan
          </h1>
          
          <p className="text-xl text-center mb-12 text-white/80 max-w-3xl mx-auto">
            Unlock advanced features and higher limits with our premium plans.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`flex flex-col ${
                  plan.recommended 
                    ? "border-2 border-figuro-accent" 
                    : "border border-gray-200"
                } ${
                  user && currentPlan === plan.id
                    ? "bg-gray-100/10"
                    : ""
                }`}
              >
                {plan.recommended && (
                  <div className="bg-figuro-accent text-white text-center py-1 text-sm font-medium">
                    RECOMMENDED
                  </div>
                )}
                {user && currentPlan === plan.id && !plan.recommended && (
                  <div className="bg-gray-600 text-white text-center py-1 text-sm font-medium">
                    CURRENT PLAN
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">{plan.price}</span>
                    {plan.id !== "free" && <span className="text-sm ml-1">/month</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                        )}
                        <span className="text-sm">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full ${
                      isButtonDisabled(plan.id)
                        ? "bg-gray-500"
                        : plan.recommended 
                          ? "bg-figuro-accent hover:bg-figuro-accent-hover" 
                          : ""
                    }`}
                    disabled={isButtonDisabled(plan.id) || loadingPlanId === plan.id}
                  >
                    {loadingPlanId === plan.id 
                      ? "Processing..." 
                      : getButtonText(plan.id)}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Need Something Custom?
            </h2>
            <p className="text-lg mb-6 text-white/80 max-w-2xl mx-auto">
              Contact us for custom enterprise solutions or specific requirements.
            </p>
            <Button size="lg" variant="outline" className="border-white/30 hover:border-white">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Pricing;
