
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { PlanSummary } from "@/components/subscription/PlanSummary";
import { PlanOptions } from "@/components/subscription/PlanOptions";
import { BillingHistory } from "@/components/subscription/BillingHistory";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";
import { EnhancedUsageTracker } from "@/components/subscription/EnhancedUsageTracker";
import { useEnhancedUpgradeModal } from "@/hooks/useEnhancedUpgradeModal";
import EnhancedUpgradeModal from "@/components/upgrade/EnhancedUpgradeModal";
import UpgradeCelebration from "@/components/upgrade/UpgradeCelebration";

const Profile = () => {
  const { user, profile, isLoading: authLoading, refreshAuth } = useEnhancedAuth();
  const { subscription, isLoading: subscriptionLoading, checkSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState("info");
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasProcessedPaymentSuccess, setHasProcessedPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  // Enhanced upgrade modal functionality
  const {
    isUpgradeModalOpen,
    upgradeModalAction,
    showUpgradeModal,
    hideUpgradeModal,
    showCelebration,
    triggerCelebration,
    hideCelebration,
    celebrationPlan
  } = useEnhancedUpgradeModal();
  
  // Handle payment success redirect from CheckoutReturn
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const paymentSuccess = searchParams.get("payment_success");
      const paymentVerified = sessionStorage.getItem('payment_verified');
      const verifiedPlan = sessionStorage.getItem('verified_plan');
      
      if (paymentSuccess === "true" && paymentVerified === "true" && verifiedPlan && !hasProcessedPaymentSuccess) {
        console.log("🎉 [PROFILE] Processing payment success from CheckoutReturn");
        setHasProcessedPaymentSuccess(true);
        
        // Clear URL parameters and session flags
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("payment_success");
        setSearchParams(newSearchParams, { replace: true });
        
        sessionStorage.removeItem('payment_verified');
        sessionStorage.removeItem('verified_plan');
        
        // Trigger celebration
        triggerCelebration(verifiedPlan.charAt(0).toUpperCase() + verifiedPlan.slice(1));
        
        // Refresh subscription data to ensure UI is up to date
        try {
          await checkSubscription();
        } catch (error) {
          console.error("❌ [PROFILE] Error refreshing subscription after payment success:", error);
        }
      }
    };

    handlePaymentSuccess();
  }, [searchParams, setSearchParams, triggerCelebration, checkSubscription, hasProcessedPaymentSuccess]);
  
  // Handle return from customer portal
  useEffect(() => {
    const handlePortalReturn = async () => {
      const portalReturn = searchParams.get("portal_return");
      
      if (portalReturn === "true") {
        console.log("🔄 [PROFILE] User returned from customer portal");
        
        // Clear the parameter
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("portal_return");
        setSearchParams(newSearchParams, { replace: true });
        
        // Show success message
        toast({
          title: "Welcome Back!",
          description: "Checking for any subscription changes...",
        });
        
        // Refresh subscription data
        try {
          await checkSubscription();
          toast({
            title: "Subscription Updated",
            description: "Your subscription details have been refreshed.",
          });
        } catch (error) {
          console.error("❌ [PROFILE] Error refreshing after portal return:", error);
        }
      }
    };

    handlePortalReturn();
  }, [searchParams, checkSubscription, setSearchParams]);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);
  
  // Generate initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map(name => name[0]).join("").toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "FG";
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle data refresh
  const handleDataRefresh = async () => {
    try {
      await Promise.all([
        checkSubscription(),
        refreshAuth()
      ]);
      toast({
        title: "Data Refreshed",
        description: "Your profile and subscription data have been updated.",
      });
    } catch (error) {
      console.error("❌ [PROFILE] Error refreshing data:", error);
      toast({
        title: "Refresh Error", 
        description: "Could not refresh all data. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Show loading state
  const isLoading = authLoading || subscriptionLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex flex-col justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-figuro-accent mb-4" />
          <p className="text-white/70">Loading your profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-figuro-accent shadow-glow">
                  <AvatarImage 
                    src={profile?.avatar_url || `https://www.gravatar.com/avatar/${user?.email ? user.email.trim().toLowerCase() : ''}?d=mp&s=256`} 
                    alt={profile?.full_name || user?.email || "User"} 
                  />
                  <AvatarFallback className="bg-figuro-accent text-white text-4xl">{getInitials()}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">{profile?.full_name || user?.email}</h1>
                <p className="text-white/70">{user?.email}</p>
                <p className="text-white/50 mt-1">Member since {formatDate(user?.created_at || "")}</p>
                
                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button 
                    variant="outline" 
                    className="text-white border-white/20 hover:bg-figuro-accent hover:text-white"
                    onClick={() => navigate("/profile/pictures")}
                  >
                    Manage Avatar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-white border-white/20 hover:bg-figuro-accent hover:text-white"
                    onClick={() => navigate("/profile/figurines")}
                  >
                    My Figurines
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-white border-white/20 hover:bg-figuro-accent hover:text-white"
                    onClick={handleDataRefresh}
                  >
                    Refresh Data
                  </Button>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 max-w-[500px] mx-auto">
                <TabsTrigger value="info">Subscription</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-8">
                <PlanSummary />
                <PlanOptions />
              </TabsContent>
              
              <TabsContent value="usage" className="mt-8">
                <EnhancedUsageTracker onUpgrade={showUpgradeModal} />
              </TabsContent>
              
              <TabsContent value="billing" className="mt-8">
                <PlanSummary />
                <BillingHistory />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
      
      {/* Enhanced Upgrade Modal */}
      {isUpgradeModalOpen && upgradeModalAction && (
        <EnhancedUpgradeModal
          isOpen={isUpgradeModalOpen}
          onOpenChange={hideUpgradeModal}
          actionType={upgradeModalAction}
        />
      )}

      {/* Upgrade Celebration */}
      <UpgradeCelebration
        isVisible={showCelebration}
        onComplete={hideCelebration}
        planName={celebrationPlan}
      />
      
      <Footer />
    </div>
  );
};

export default Profile;
