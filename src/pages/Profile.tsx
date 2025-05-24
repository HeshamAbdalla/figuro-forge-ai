
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
  const { user, profile, isLoading, refreshAuth } = useAuth();
  const { verifySubscription, checkSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState("info");
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Handle success redirect from Stripe - more robust approach
  useEffect(() => {
    const handleStripeSuccess = async () => {
      const success = searchParams.get("success");
      const plan = searchParams.get("plan");
      
      if (success === "true" && plan && !hasProcessedSuccess && !isProcessingPayment) {
        console.log("Handling Stripe success redirect for plan:", plan);
        setIsProcessingPayment(true);
        setHasProcessedSuccess(true);
        
        // Clear URL parameters immediately to prevent infinite loop
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("success");
        newSearchParams.delete("plan");
        setSearchParams(newSearchParams, { replace: true });
        
        // Show processing toast
        toast({
          title: "Processing Payment",
          description: "Verifying your subscription upgrade...",
        });
        
        try {
          // Wait longer for webhook processing (Stripe webhooks can take time)
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Force refresh auth state first
          console.log("Refreshing auth state...");
          await refreshAuth();
          
          // Wait a bit more for auth to propagate
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Multiple verification attempts with exponential backoff
          let verified = false;
          const maxAttempts = 6;
          
          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`Verification attempt ${attempt}/${maxAttempts}`);
            
            try {
              // Check subscription status
              await checkSubscription();
              
              // Wait with exponential backoff
              const waitTime = Math.min(3000 * Math.pow(1.5, attempt - 1), 10000);
              if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, waitTime));
              }
              
              // Refresh auth again to get latest profile
              await refreshAuth();
              
              // Additional wait for state propagation
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // Verify the subscription was updated
              const verificationResult = await verifySubscription(plan);
              if (verificationResult) {
                verified = true;
                console.log(`Verification successful on attempt ${attempt}`);
                break;
              }
            } catch (error) {
              console.error(`Verification attempt ${attempt} failed:`, error);
              // Continue to next attempt
            }
          }
          
          if (verified) {
            toast({
              title: "Subscription Activated!",
              description: `Your ${plan} plan has been activated successfully. Your usage limits have been reset.`,
            });
            
            // Force a final refresh to ensure UI updates
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            toast({
              title: "Payment Successful",
              description: "Your payment was processed successfully. Please refresh the page to see your updated subscription status.",
            });
            
            // Auto-refresh after showing message
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        } catch (error) {
          console.error("Error verifying subscription:", error);
          toast({
            title: "Payment Successful",
            description: "Your payment was processed successfully. Please refresh the page to see your updated subscription status.",
            variant: "destructive"
          });
          
          // Auto-refresh on error too
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } finally {
          setIsProcessingPayment(false);
        }
      }
    };

    handleStripeSuccess();
  }, [searchParams, hasProcessedSuccess, isProcessingPayment]); // More specific dependencies
  
  useEffect(() => {
    // If authentication is complete (not loading) and user is not authenticated, redirect to auth page
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);
  
  // Generate initials for avatar fallback
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
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  // If still loading or no user, show loading state
  if (isLoading || isProcessingPayment) {
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
                <p className="text-white/50 mt-1">Member since {formatDate(user?.created_at)}</p>
                
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
                    onClick={() => window.location.reload()}
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
