
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Image, Box, Sparkles, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useSmartTeaser } from "@/hooks/useSmartTeaser";
import { PLANS } from "@/config/plans";
import InlineTeaserCard from "@/components/upgrade/InlineTeaserCard";
import { Button } from "@/components/ui/button";

interface EnhancedUsageTrackerProps {
  onUpgrade?: (actionType: "image_generation" | "model_conversion") => void;
}

export const EnhancedUsageTracker: React.FC<EnhancedUsageTrackerProps> = ({ onUpgrade }) => {
  const { subscription, isLoading } = useSubscription();
  const { teaserState, triggerTeaser, dismissTeaser, getUsageProgress, getUrgencyLevel } = useSmartTeaser();
  const [animateValues, setAnimateValues] = useState({ images: 0, models: 0 });
  
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
  
  const monthlyImageUsagePercentage = currentPlan.limits.isUnlimited 
    ? 0 
    : Math.min(100, (subscription.generation_count_this_month / currentPlan.limits.imageGenerationsPerMonth) * 100);
  
  const modelUsagePercentage = currentPlan.limits.isUnlimited 
    ? 0 
    : Math.min(100, (subscription.converted_3d_this_month / currentPlan.limits.modelConversionsPerMonth) * 100);

  const imageUrgency = getUrgencyLevel('image_generation');
  const modelUrgency = getUrgencyLevel('model_conversion');

  // Animate progress values on mount and updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateValues({
        images: monthlyImageUsagePercentage,
        models: modelUsagePercentage
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [monthlyImageUsagePercentage, modelUsagePercentage]);

  const getProgressColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-400';
    }
  };

  const getProgressGlow = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'shadow-red-500/50';
      case 'high': return 'shadow-amber-500/50';
      case 'medium': return 'shadow-yellow-500/50';
      default: return 'shadow-blue-400/50';
    }
  };

  const handleUpgradeClick = (actionType: "image_generation" | "model_conversion") => {
    if (onUpgrade) {
      onUpgrade(actionType);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-figuro-darker/50 border-white/10 mb-6 overflow-hidden">
        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Your Usage</h3>
              {subscription.plan !== 'unlimited' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={() => handleUpgradeClick('image_generation')}
                    size="sm"
                    className="bg-figuro-accent/20 hover:bg-figuro-accent/30 text-figuro-accent border border-figuro-accent/30 transition-all duration-200 hover:scale-105"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </motion.div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Monthly Image Generations */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-blue-400" />
                    <p className="text-white font-medium">
                      Image Generations (This Month)
                    </p>
                    {imageUrgency === 'high' && !isNaN(monthlyImageUsagePercentage) && monthlyImageUsagePercentage < 100 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-2 text-amber-400 font-medium flex items-center text-sm"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        Almost at limit
                      </motion.span>
                    )}
                    {imageUrgency === 'critical' && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="ml-2"
                      >
                        <Sparkles className="h-4 w-4 text-red-400" />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-white/70 font-mono">
                    {subscription.generation_count_this_month} / {currentPlan.limits.isUnlimited ? '∞' : currentPlan.limits.imageGenerationsPerMonth}
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={animateValues.images} 
                    className="h-3 bg-white/10 rounded-full overflow-hidden"
                    indicatorClassName={`transition-all duration-1000 ease-out ${getProgressColor(imageUrgency)} ${getProgressGlow(imageUrgency)} shadow-lg`}
                  />
                  {imageUrgency === 'critical' && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent rounded-full"
                    />
                  )}
                </div>
                
                {monthlyImageUsagePercentage >= 100 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-2 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    You've reached your monthly image generation limit.
                  </motion.p>
                )}
              </motion.div>
              
              {/* 3D Model Conversions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-purple-400" />
                    <p className="text-white font-medium">
                      3D Model Conversions (This Month)
                    </p>
                    {modelUrgency === 'high' && !isNaN(modelUsagePercentage) && modelUsagePercentage < 100 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-2 text-amber-400 font-medium flex items-center text-sm"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        Almost at limit
                      </motion.span>
                    )}
                    {modelUrgency === 'critical' && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="ml-2"
                      >
                        <Sparkles className="h-4 w-4 text-red-400" />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-white/70 font-mono">
                    {subscription.converted_3d_this_month} / {currentPlan.limits.isUnlimited ? '∞' : currentPlan.limits.modelConversionsPerMonth}
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={animateValues.models} 
                    className="h-3 bg-white/10 rounded-full overflow-hidden"
                    indicatorClassName={`transition-all duration-1000 ease-out ${getProgressColor(modelUrgency)} ${getProgressGlow(modelUrgency)} shadow-lg`}
                  />
                  {modelUrgency === 'critical' && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent rounded-full"
                    />
                  )}
                </div>
                
                {modelUsagePercentage >= 100 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-2 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    You've reached your monthly limit.
                  </motion.p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Inline Teaser Cards */}
      <AnimatePresence>
        {teaserState.showTeaser && teaserState.teaserType && (
          <InlineTeaserCard
            limitType={teaserState.teaserType}
            onUpgrade={() => handleUpgradeClick(teaserState.teaserType!)}
            onDismiss={() => dismissTeaser()}
            className="mb-6"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
