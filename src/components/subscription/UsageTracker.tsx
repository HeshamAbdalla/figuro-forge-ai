
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Image, Box } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { PLANS } from "@/config/plans";

export const UsageTracker = () => {
  const { subscription, isLoading } = useSubscription();
  
  if (isLoading || !subscription) {
    return (
      <Card className="bg-figuro-darker/50 border-white/10 mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse flex flex-col gap-4 w-full">
            <div className="h-5 bg-figuro-darker rounded w-2/3"></div>
            <div className="h-4 bg-figuro-darker rounded w-full"></div>
            <div className="h-5 bg-figuro-darker rounded w-2/3 mt-4"></div>
            <div className="h-4 bg-figuro-darker rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = PLANS[subscription.plan];
  
  // Calculate usage percentages using subscription data
  const monthlyImageUsagePercentage = currentPlan.limits.isUnlimited 
    ? 0 
    : Math.min(100, (subscription.generation_count_this_month / currentPlan.limits.imageGenerationsPerMonth) * 100);
  
  const modelUsagePercentage = currentPlan.limits.isUnlimited 
    ? 0 
    : Math.min(100, (subscription.converted_3d_this_month / currentPlan.limits.modelConversionsPerMonth) * 100);

  const isMonthlyImageNearLimit = monthlyImageUsagePercentage >= 80;
  const isModelNearLimit = modelUsagePercentage >= 80;

  return (
    <Card className="bg-figuro-darker/50 border-white/10 mb-6">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Your Usage</h3>
        
        <div className="space-y-6">
          {/* Monthly Image Generations */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-blue-400" />
                <p className="text-white">
                  Image Generations (This Month)
                  {isMonthlyImageNearLimit && !isNaN(monthlyImageUsagePercentage) && monthlyImageUsagePercentage < 100 && (
                    <span className="ml-2 text-amber-400 font-medium flex items-center text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Almost at limit
                    </span>
                  )}
                </p>
              </div>
              <span className="text-white/70">
                {subscription.generation_count_this_month} / {currentPlan.limits.isUnlimited ? '∞' : currentPlan.limits.imageGenerationsPerMonth}
              </span>
            </div>
            <Progress 
              value={isNaN(monthlyImageUsagePercentage) ? 0 : monthlyImageUsagePercentage} 
              className="h-2 bg-white/10" 
              indicatorClassName={monthlyImageUsagePercentage >= 100 
                ? "bg-red-500" 
                : isMonthlyImageNearLimit 
                  ? "bg-amber-500" 
                  : "bg-blue-400"
              }
            />
            {monthlyImageUsagePercentage >= 100 && (
              <p className="text-red-400 text-sm mt-1">
                You've reached your monthly image generation limit. Please upgrade to continue.
              </p>
            )}
          </div>
          
          {/* 3D Model Conversions */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-purple-400" />
                <p className="text-white">
                  3D Model Conversions (This Month)
                  {isModelNearLimit && !isNaN(modelUsagePercentage) && modelUsagePercentage < 100 && (
                    <span className="ml-2 text-amber-400 font-medium flex items-center text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Almost at limit
                    </span>
                  )}
                </p>
              </div>
              <span className="text-white/70">
                {subscription.converted_3d_this_month} / {currentPlan.limits.isUnlimited ? '∞' : currentPlan.limits.modelConversionsPerMonth}
              </span>
            </div>
            <Progress 
              value={isNaN(modelUsagePercentage) ? 0 : modelUsagePercentage} 
              className="h-2 bg-white/10" 
              indicatorClassName={modelUsagePercentage >= 100 
                ? "bg-red-500" 
                : isModelNearLimit 
                  ? "bg-amber-500" 
                  : "bg-purple-400"
              }
            />
            {modelUsagePercentage >= 100 && (
              <p className="text-red-400 text-sm mt-1">
                You've reached your monthly limit. Please upgrade to continue converting models.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
