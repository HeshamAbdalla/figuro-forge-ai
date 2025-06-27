
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingHero from "@/components/pricing/PricingHero";
import PricingCards from "@/components/pricing/PricingCards";
import PricingCTA from "@/components/pricing/PricingCTA";
import PricingFAQ from "@/components/pricing/PricingFAQ";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const Pricing = () => {
  const { profile } = useEnhancedAuth();
  const [searchParams] = useSearchParams();
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
  
  return (
    <div className="min-h-screen bg-figuro-dark">
      <SEO 
        title="Pricing Plans - Figuro.AI"
        description="Choose the perfect plan for your 3D creation needs. From free to enterprise, we have options for every creator."
      />
      <Header />
      
      <main className="pt-20">
        <PricingHero />
        <PricingCards currentPlan={currentPlan} />
        <PricingFAQ />
        <PricingCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
