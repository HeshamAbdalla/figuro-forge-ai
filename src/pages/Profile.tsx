
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";
import { useEnhancedUpgradeModal } from "@/hooks/useEnhancedUpgradeModal";
import EnhancedUpgradeModal from "@/components/upgrade/EnhancedUpgradeModal";
import UpgradeCelebration from "@/components/upgrade/UpgradeCelebration";
import ProfileHero from "@/components/profile/ProfileHero";
import EnhancedProfileTabs from "@/components/profile/EnhancedProfileTabs";

const Profile = () => {
  const { user, profile, isLoading: authLoading, refreshAuth } = useEnhancedAuth();
  const { subscription, isLoading: subscriptionLoading, checkSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState("info");
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasProcessedPaymentSuccess, setHasProcessedPaymentSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Handle navigation-based profile refresh
  useEffect(() => {
    const handleNavigationRefresh = () => {
      const avatarUpdated = searchParams.get("avatar_updated");
      const fromPictures = location.state?.from === "/profile/pictures";
      
      if (avatarUpdated === "true" || fromPictures) {
        console.log("🔄 [PROFILE] Detected return from pictures page, refreshing auth data");
        
        // Clear the parameter if it exists
        if (avatarUpdated) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete("avatar_updated");
          setSearchParams(newSearchParams, { replace: true });
        }
        
        // Refresh auth data to get updated avatar
        refreshAuth().then(() => {
          console.log("✅ [PROFILE] Auth data refreshed after avatar update");
        }).catch((error) => {
          console.error("❌ [PROFILE] Error refreshing auth data:", error);
        });
      }
    };

    handleNavigationRefresh();
  }, [searchParams, setSearchParams, refreshAuth, location.state]);

  // Listen for custom avatar update events
  useEffect(() => {
    const handleAvatarUpdate = () => {
      console.log("🔄 [PROFILE] Received avatar update event, refreshing auth data");
      refreshAuth().then(() => {
        toast({
          title: "Profile Updated",
          description: "Your avatar has been updated successfully.",
        });
      }).catch((error) => {
        console.error("❌ [PROFILE] Error refreshing auth after avatar update:", error);
      });
    };

    // Listen for custom avatar update events
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, [refreshAuth]);
  
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

  // Create a wrapper function for upgrade modal that provides default action
  const handleUpgrade = () => {
    showUpgradeModal("image_generation");
  };
  
  // Show loading state
  const isLoading = authLoading || subscriptionLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex flex-col justify-center items-center">
          <div className="glass-panel rounded-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-figuro-accent" />
            <p className="text-white/70">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-8 text-center max-w-md mx-auto"
          >
            <p className="text-white/70 mb-4">Please sign in to view your profile</p>
            <button 
              onClick={() => navigate("/auth")}
              className="bg-figuro-accent hover:bg-figuro-accent-hover text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Sign In
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      {/* Enhanced Profile Hero */}
      <ProfileHero 
        user={user}
        profile={profile}
        onDataRefresh={handleDataRefresh}
      />
      
      {/* Enhanced Profile Tabs */}
      <EnhancedProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUpgrade={handleUpgrade}
      />
      
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
