
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Crown, Calendar, CreditCard, Settings, ArrowRight } from "lucide-react";

const Subscription = () => {
  const { user, isLoading: authLoading } = useEnhancedAuth();
  const { subscription, isLoading, openCustomerPortal, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const handleRefreshSubscription = async () => {
    setIsRefreshing(true);
    try {
      await refreshSubscription();
      toast({
        title: "Subscription refreshed",
        description: "Your subscription status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to refresh",
        description: "Unable to refresh subscription status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Unable to open portal",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-figuro-accent" />
        </div>
        <Footer />
      </div>
    );
  }

  const planColors = {
    free: "bg-gray-500",
    pro: "bg-figuro-accent",
    premium: "bg-purple-500",
    enterprise: "bg-gold-500"
  };

  const currentPlan = subscription?.plan || "free";
  const isActive = subscription?.is_active || false;

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
              <p className="text-white/70">Manage your subscription and billing settings</p>
            </div>

            <div className="grid gap-6">
              {/* Current Plan Card */}
              <Card className="bg-figuro-darker/50 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Crown className="w-5 h-5 text-figuro-accent" />
                      Current Plan
                    </CardTitle>
                    <Button
                      onClick={handleRefreshSubscription}
                      variant="ghost"
                      size="sm"
                      disabled={isRefreshing}
                      className="text-white/60 hover:text-white"
                    >
                      {isRefreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge 
                      className={`${planColors[currentPlan.toLowerCase()]} text-white capitalize px-4 py-2`}
                    >
                      {currentPlan}
                    </Badge>
                    {isActive && (
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  {subscription?.valid_until && (
                    <div className="flex items-center gap-2 text-white/70 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Valid until: {new Date(subscription.valid_until).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {currentPlan === "free" ? (
                      <Button
                        onClick={() => navigate("/pricing")}
                        className="bg-figuro-accent hover:bg-figuro-accent/90 text-white"
                      >
                        Upgrade Plan
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleManageSubscription}
                        className="bg-figuro-accent hover:bg-figuro-accent/90 text-white"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              {subscription && (
                <Card className="bg-figuro-darker/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-white/70 mb-1">Images Generated Today</p>
                        <p className="text-2xl font-bold text-white">{subscription.generation_count_today}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-white/70 mb-1">3D Models This Month</p>
                        <p className="text-2xl font-bold text-white">{subscription.converted_3d_this_month}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Account Actions */}
              <Card className="bg-figuro-darker/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => navigate("/settings")}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Account Settings
                    </Button>
                    
                    <Button
                      onClick={() => navigate("/pricing")}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      View All Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Subscription;
