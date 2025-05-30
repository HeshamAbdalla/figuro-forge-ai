import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, ExternalLink, Image, Box, TrendingUp, Loader2, Calendar } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { formatDate } from "@/lib/utils";
import { PLANS } from "@/config/plans";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

export const PlanSummary = () => {
  const { subscription, openCustomerPortal, isLoading } = useSubscription();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  
  const getPlanColor = (plan: string | undefined): string => {
    switch (plan) {
      case 'pro':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'unlimited':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'starter':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'past_due':
        return 'bg-amber-500/20 text-amber-400 border-amber-400/30';
      case 'canceled':
      case 'expired':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const handleManagePlan = async () => {
    if (subscription?.plan === 'free') {
      toast({
        title: "No Active Subscription",
        description: "You're currently on the free plan. Upgrade to a paid plan to access subscription management.",
        variant: "default"
      });
      return;
    }

    setIsOpeningPortal(true);
    
    try {
      await openCustomerPortal();
      // Show success message
      toast({
        title: "Opening Customer Portal",
        description: "Redirecting you to manage your subscription...",
      });
    } catch (error) {
      console.error("❌ [PLAN_SUMMARY] Error opening customer portal:", error);
      toast({
        title: "Portal Error",
        description: "Unable to open subscription management. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-figuro-darker/50 border-white/10 mb-6">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="animate-pulse flex flex-col gap-2 w-full">
            <div className="h-6 bg-figuro-darker rounded w-1/3"></div>
            <div className="h-4 bg-figuro-darker rounded w-2/3 mt-2"></div>
            <div className="h-4 bg-figuro-darker rounded w-1/2 mt-1"></div>
          </div>
          <div className="animate-pulse h-10 bg-figuro-darker rounded w-full sm:w-40"></div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = subscription?.plan ? PLANS[subscription.plan] : PLANS.free;

  // Calculate usage percentages for progress bars using subscription data
  const monthlyImageProgress = currentPlan.limits.isUnlimited ? 0 :
    Math.min(100, ((subscription?.generation_count_this_month || 0) / currentPlan.limits.imageGenerationsPerMonth) * 100);
  
  const monthlyModelProgress = currentPlan.limits.isUnlimited ? 0 :
    Math.min(100, ((subscription?.converted_3d_this_month || 0) / currentPlan.limits.modelConversionsPerMonth) * 100);

  return (
    <div className="space-y-6">
      <Card className="bg-figuro-darker/50 border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-semibold text-white">Current Plan</h3>
                <Badge className={`${getPlanColor(subscription?.plan)} text-white capitalize`}>
                  {subscription?.plan || "Free"}
                </Badge>
                {subscription?.status && (
                  <Badge variant="outline" className={getStatusColor(subscription.status)}>
                    {subscription.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              
              {subscription?.valid_until && subscription.is_active && (
                <p className="text-white/70 flex items-center gap-2 mb-2">
                  <CalendarClock className="h-4 w-4" />
                  Renews on {formatDate(subscription.valid_until)}
                </p>
              )}
              
              {subscription?.commercial_license && (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                  Commercial License
                </Badge>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-figuro-accent hover:text-white"
              onClick={handleManagePlan}
              disabled={isOpeningPortal}
            >
              {isOpeningPortal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Portal...
                </>
              ) : subscription?.plan === 'free' ? (
                'Upgrade Plan'
              ) : (
                <>
                  Manage Plan
                  <ExternalLink className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Breakdown */}
      <Card className="bg-figuro-darker/50 border-white/10">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Usage Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Image Generations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span className="text-white font-medium">Images This Month</span>
                </div>
                <span className="text-white/70 text-sm">
                  {subscription?.generation_count_this_month || 0} / {currentPlan.limits.isUnlimited ? '∞' : currentPlan.limits.imageGenerationsPerMonth}
                </span>
              </div>
              {!currentPlan.limits.isUnlimited && (
                <Progress 
                  value={monthlyImageProgress} 
                  className="h-2 bg-white/10"
                  indicatorClassName={monthlyImageProgress >= 90 ? "bg-red-500" : monthlyImageProgress >= 70 ? "bg-amber-500" : "bg-green-400"}
                />
              )}
              {monthlyImageProgress >= 90 && !currentPlan.limits.isUnlimited && (
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  <TrendingUp className="h-3 w-3" />
                  <span>Approaching monthly limit</span>
                </div>
              )}
            </div>

            {/* Monthly 3D Conversions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-purple-400" />
                  <span className="text-white font-medium">3D Models This Month</span>
                </div>
                <span className="text-white/70 text-sm">
                  {subscription?.converted_3d_this_month || 0} / {currentPlan.limits.isUnlimited ? '∞' : currentPlan.limits.modelConversionsPerMonth}
                </span>
              </div>
              {!currentPlan.limits.isUnlimited && (
                <Progress 
                  value={monthlyModelProgress} 
                  className="h-2 bg-white/10"
                  indicatorClassName={monthlyModelProgress >= 90 ? "bg-red-500" : monthlyModelProgress >= 70 ? "bg-amber-500" : "bg-purple-400"}
                />
              )}
              {monthlyModelProgress >= 90 && !currentPlan.limits.isUnlimited && (
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  <TrendingUp className="h-3 w-3" />
                  <span>Approaching monthly limit</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
