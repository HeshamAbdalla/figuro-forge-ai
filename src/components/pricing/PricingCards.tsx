
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, Star, Crown, Rocket, Sparkles } from "lucide-react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PLANS } from "@/config/plans";

interface PricingCardsProps {
  currentPlan?: string;
}

const PricingCards = ({ currentPlan = "free" }: PricingCardsProps) => {
  const { user } = useEnhancedAuth();
  const navigate = useNavigate();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  // Convert PLANS config to pricing format with enhanced features
  const pricingPlans = Object.values(PLANS).map(plan => ({
    id: plan.id,
    name: plan.name,
    price: plan.price === 0 ? "$0" : `$${plan.price}`,
    features: [
      ...plan.features,
      ...(plan.order >= 1 ? ["High Resolution"] : ["Standard Resolution"]),
      ...(plan.order >= 2 ? ["Commercial License"] : [{ name: "Commercial License", included: false }]),
      ...(plan.order >= 2 ? ["Priority Support"] : [{ name: "Priority Support", included: false }]),
    ].map(feature => 
      typeof feature === 'string' 
        ? { name: feature, included: true }
        : feature
    ),
    recommended: plan.id === 'starter',
    icon: plan.id === 'free' ? Sparkles : plan.id === 'starter' ? Star : plan.id === 'professional' ? Crown : Rocket,
    gradient: plan.id === 'free' ? 'from-blue-500/20 to-purple-500/20' : 
             plan.id === 'starter' ? 'from-figuro-accent/20 to-purple-500/20' :
             plan.id === 'professional' ? 'from-yellow-500/20 to-orange-500/20' : 'from-red-500/20 to-pink-500/20'
  }));

  const getButtonText = (planId: string) => {
    if (!user) {
      return planId === "free" ? "Get Started" : "Subscribe";
    }
    
    if (currentPlan === planId) {
      return "Current Plan";
    }
    
    return "Upgrade";
  };

  const isButtonDisabled = (planId: string) => {
    return user && currentPlan === planId;
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (planId === currentPlan) {
      return;
    }
    
    if (planId === "free") {
      return;
    }
    
    setLoadingPlanId(planId);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          plan: planId,
          successUrl: `${window.location.origin}/pricing?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Checkout",
          description: "A new tab will open with Stripe checkout.",
        });
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.25, 0.25, 0.75]
      }
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = user && currentPlan === plan.id;
            
            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-figuro-accent text-white px-4 py-1 rounded-full text-sm font-medium shadow-glow-sm">
                      RECOMMENDED
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && !plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gray-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      CURRENT PLAN
                    </div>
                  </div>
                )}

                <div className={`glass-panel h-full p-8 relative overflow-hidden ${
                  plan.recommended ? 'border-2 border-figuro-accent shadow-glow' : ''
                } ${isCurrentPlan ? 'bg-white/10' : ''}`}>
                  
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                        <IconComponent size={32} className="text-figuro-accent" />
                      </div>
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-white text-center mb-2">
                      {plan.name}
                    </h3>

                    {/* Price */}
                    <div className="text-center mb-8">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      {plan.id !== "free" && (
                        <span className="text-white/60 ml-2">/month</span>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-white' : 'text-white/50'}`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full ${
                        isButtonDisabled(plan.id)
                          ? "bg-gray-500/50 cursor-not-allowed"
                          : plan.recommended 
                            ? "bg-figuro-accent hover:bg-figuro-accent-hover shadow-glow-sm hover:shadow-glow" 
                            : "bg-white/10 hover:bg-white/20 border border-white/20"
                      } transition-all duration-300`}
                      disabled={isButtonDisabled(plan.id) || loadingPlanId === plan.id}
                    >
                      {loadingPlanId === plan.id 
                        ? "Processing..." 
                        : getButtonText(plan.id)}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingCards;
