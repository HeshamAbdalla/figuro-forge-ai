
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmbeddedCheckout } from "./EmbeddedCheckout";
import { supabase } from "@/integrations/supabase/client";
import { PLANS } from "@/config/plans";

export const PlanOptions = () => {
  const { subscription, isLoading, openCustomerPortal, user } = useSubscription();
  const [processingPlan, setProcessingPlan] = React.useState<string | null>(null);
  const [showCheckout, setShowCheckout] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<string>('');
  
  // Convert PLANS config to array format sorted by order
  const plans = Object.values(PLANS).sort((a, b) => a.order - b.order);

  const handlePlanAction = async (planId: string) => {
    try {
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please sign in or create an account to subscribe.",
          variant: "destructive"
        });
        return;
      }

      setProcessingPlan(planId);
      console.log('Handling plan action for:', planId);
      
      if (subscription?.plan === planId) {
        // If it's the current plan, open the customer portal
        await openCustomerPortal();
      } else if (planId === 'free') {
        // Handle free plan directly
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: { plan: planId }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        toast({
          title: "Switched to Free Plan",
          description: "You are now on the Free plan.",
        });
      } else {
        // For paid plans, show embedded checkout
        setSelectedPlan(planId);
        setShowCheckout(true);
      }
    } catch (error) {
      console.error("Error handling plan action:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  // Function to determine button text
  const getButtonText = (planId: string) => {
    if (subscription?.plan === planId) {
      return "Current Plan";
    }
    if (isPlanUpgrade(planId)) {
      return "Upgrade";
    }
    return "Switch Plan";
  };

  // Function to check if switching to this plan would be an upgrade
  const isPlanUpgrade = (planId: string) => {
    const currentOrder = PLANS[subscription?.plan || 'free']?.order || 0;
    const targetOrder = PLANS[planId]?.order || 0;
    return targetOrder > currentOrder;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-figuro-darker/30 border-white/10 h-96">
            <CardHeader>
              <div className="h-7 bg-figuro-darker rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-figuro-darker rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-figuro-darker rounded w-full"></div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-figuro-darker rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Plan Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan === plan.id;
          const isProcessing = processingPlan === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`bg-figuro-darker/50 border-white/10 ${isCurrentPlan ? 'ring-2 ring-figuro-accent' : ''}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isCurrentPlan && (
                    <span className="bg-figuro-accent text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-white/70">
                  {plan.price === 0 ? 'Free' : `$${plan.price}/month`}
                </CardDescription>
                <p className="text-white/60 text-sm">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-figuro-accent mr-2 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${isCurrentPlan 
                    ? 'bg-figuro-darker text-white hover:bg-figuro-darker/80' 
                    : isPlanUpgrade(plan.id)
                      ? 'bg-figuro-accent hover:bg-figuro-accent-hover' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  onClick={() => handlePlanAction(plan.id)}
                  disabled={isCurrentPlan || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    getButtonText(plan.id)
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Responsive Embedded Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="w-[95vw] max-w-none sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-figuro-darker border-white/10 p-3 sm:p-4 md:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-white text-lg sm:text-xl">
              Complete Your Subscription to {plans.find(p => p.id === selectedPlan)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-[400px] sm:min-h-[500px]">
            <EmbeddedCheckout 
              planId={selectedPlan} 
              onClose={() => setShowCheckout(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
