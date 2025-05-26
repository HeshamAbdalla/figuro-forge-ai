import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { PlanSummary } from "@/components/subscription/PlanSummary";
import { UsageTracker } from "@/components/subscription/UsageTracker";
import { PlanOptions } from "@/components/subscription/PlanOptions";
import { BillingHistory } from "@/components/subscription/BillingHistory";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, profile, isLoading: authLoading, refreshAuth } = useAuth();
  const { subscription, isLoading: subscriptionLoading, checkSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState("info");
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Handle success redirect from Stripe
  useEffect(() => {
    const handleStripeSuccess = async () => {
      const success = searchParams.get("success");
      const plan = searchParams.get("plan");
      const sessionId = searchParams.get("session_id");
      
      if (success === "true" && plan && !hasProcessedSuccess && !isProcessingPayment) {
        console.log("🎉 [PROFILE] Handling Stripe success for plan:", plan);
        setIsProcessingPayment(true);
        setHasProcessedSuccess(true);
        
        // Clear URL parameters immediately
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("success");
        newSearchParams.delete("plan");
        newSearchParams.delete("session_id");
        setSearchParams(newSearchParams, { replace: true });
        
        toast({
          title: "Payment Successful!",
          description: "Processing your subscription upgrade...",
        });
        
        try {
          // Wait for webhook processing
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Refresh subscription data
          await checkSubscription();
          
          toast({
            title: "Subscription Activated!",
            description: `Your ${plan} plan is now active. Welcome!`,
          });
        } catch (error) {
          console.error("❌ [PROFILE] Error refreshing subscription:", error);
          toast({
            title: "Payment Processed",
            description: "Your subscription will be activated shortly.",
            variant: "default"
          });
        } finally {
          setIsProcessingPayment(false);
        }
      }
    };

    handleStripeSuccess();
  }, [searchParams, hasProcessedSuccess, isProcessingPayment, checkSubscription, setSearchParams]);
  
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
  const isLoading = authLoading || subscriptionLoading || isProcessingPayment;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex flex-col justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-figuro-accent mb-4" />
          {isProcessingPayment ? (
            <div className="text-center">
              <p className="text-white/70 mb-2">Processing your subscription upgrade...</p>
              <p className="text-white/50 text-sm">This may take a few moments</p>
            </div>
          ) : (
            <p className="text-white/70">Loading your profile...</p>
          )}
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
            
            {/* Debug subscription info */}
            {subscription && (
              <div className="mb-6 p-4 bg-figuro-darker/30 rounded-lg">
                <h3 className="text-white text-sm font-semibold mb-2">Subscription Debug Info:</h3>
                <pre className="text-white/60 text-xs overflow-auto">
                  {JSON.stringify(subscription, null, 2)}
                </pre>
              </div>
            )}
            
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
                <UsageTracker />
              </TabsContent>
              
              <TabsContent value="billing" className="mt-8">
                <PlanSummary />
                <BillingHistory />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Profile;
