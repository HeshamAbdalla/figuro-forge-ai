
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
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface EnhancedUsageTrackerProps {
  onUpgrade?: (actionType: "image_generation" | "model_conversion") => void;
}

export const EnhancedUsageTracker: React.FC<EnhancedUsageTrackerProps> = ({ onUpgrade }) => {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const { subscription, isLoading } = useSubscription();
  const { teaserState, triggerTeaser, dismissTeaser, getUsageProgress, getUrgencyLevel } = useSmartTeaser();
  const [animateValues, setAnimateValues] = useState({ images: 0, models: 0 });
  const { isMobile, isTablet } = useResponsiveLayout();

  // Calculate values that depend on subscription data
  const currentPlan = subscription ? PLANS[subscription.plan] : null;
  
  const monthlyImageUsagePercentage = currentPlan?.limits.isUnlimited 
    ? 0 
    : subscription 
      ? Math.min(100, (subscription.generation_count_this_month / (currentPlan?.limits.imageGenerationsPerMonth || 1)) * 100)
      : 0;
  
  const modelUsagePercentage = currentPlan?.limits.isUnlimited 
    ? 0 
    : subscription
      ? Math.min(100, (subscription.converted_3d_this_month / (currentPlan?.limits.modelConversionsPerMonth || 1)) * 100)
      : 0;

  const imageUrgency = subscription ? getUrgencyLevel('image_generation') : 'low';
  const modelUrgency = subscription ? getUrgencyLevel('model_conversion') : 'low';

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

  // NOW we can have conditional returns since all hooks have been called
  if (isLoading || !subscription) {
    return (
      <Card className={`bg-figuro-darker/50 border-white/10 ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <CardContent className={isMobile ? 'p-4' : 'p-6'}>
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
    <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
      <Card className={`bg-figuro-darker/50 border-white/10 overflow-hidden ${
        isMobile ? 'mb-4' : 'mb-6'
      }`}>
        <CardContent className={isMobile ? 'p-4' : 'p-6'}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`flex items-center justify-between mb-6 ${
              isMobile ? 'flex-col gap-4' : ''
            }`}>
              <h3 className={`font-semibold text-white ${
                isMobile ? 'text-lg text-center' : 'text-xl'
              }`}>Your Usage</h3>
              {subscription.plan !== 'unlimited' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className={isMobile ? 'w-full' : ''}
                >
                  <Button
                    onClick={() => handleUpgradeClick('image_generation')}
                    size={isMobile ? "default" : "sm"}
                    className={`bg-figuro-accent/20 hover:bg-figuro-accent/30 text-figuro-accent border border-figuro-accent/30 transition-all duration-200 hover:scale-105 ${
                      isMobile ? 'w-full py-3' : ''
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                </motion.div>
              )}
            </div>
            
            <div className={isMobile ? 'space-y-6' : 'space-y-6'}>
              {/* Monthly Image Generations */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`flex items-center gap-2 min-w-0 flex-1 ${
                    isMobile ? 'mr-2' : ''
                  }`}>
                    <Image className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <p className={`text-white font-medium ${
                      isMobile ? 'text-sm leading-tight' : ''
                    }`}>
                      Image Generations {isMobile ? '' : '(This Month)'}
                      {isMobile && <span className="block text-xs text-white/60">This Month</span>}
                    </p>
                    {imageUrgency === 'high' && !isNaN(monthlyImageUsagePercentage) && monthlyImageUsagePercentage < 100 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-amber-400 font-medium flex items-center ${
                          isMobile ? 'text-xs ml-1' : 'ml-2 text-sm'
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                        {isMobile ? 'Limit' : 'Almost at limit'}
                      </motion.span>
                    )}
                    {imageUrgency === 'critical' && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={isMobile ? 'ml-1' : 'ml-2'}
                      >
                        <Sparkles className="h-4 w-4 text-red-400" />
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-white/70 font-mono flex-shrink-0 ${
                    isMobile ? 'text-xs' : ''
                  }`}>
                    {subscription.generation_count_this_month} / {currentPlan?.limits.isUnlimited ? '∞' : currentPlan?.limits.imageGenerationsPerMonth}
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
                    className={`text-red-400 flex items-center gap-2 mt-2 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>You've reached your monthly image generation limit.</span>
                  </motion.p>
                )}
              </motion.div>
              
              {/* 3D Model Conversions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`flex items-center gap-2 min-w-0 flex-1 ${
                    isMobile ? 'mr-2' : ''
                  }`}>
                    <Box className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <p className={`text-white font-medium ${
                      isMobile ? 'text-sm leading-tight' : ''
                    }`}>
                      3D Model Conversions {isMobile ? '' : '(This Month)'}
                      {isMobile && <span className="block text-xs text-white/60">This Month</span>}
                    </p>
                    {modelUrgency === 'high' && !isNaN(modelUsagePercentage) && modelUsagePercentage < 100 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-amber-400 font-medium flex items-center ${
                          isMobile ? 'text-xs ml-1' : 'ml-2 text-sm'
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                        {isMobile ? 'Limit' : 'Almost at limit'}
                      </motion.span>
                    )}
                    {modelUrgency === 'critical' && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={isMobile ? 'ml-1' : 'ml-2'}
                      >
                        <Sparkles className="h-4 w-4 text-red-400" />
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-white/70 font-mono flex-shrink-0 ${
                    isMobile ? 'text-xs' : ''
                  }`}>
                    {subscription.converted_3d_this_month} / {currentPlan?.limits.isUnlimited ? '∞' : currentPlan?.limits.modelConversionsPerMonth}
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
                    className={`text-red-400 flex items-center gap-2 mt-2 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>You've reached your monthly limit.</span>
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
            className={isMobile ? 'mb-4' : 'mb-6'}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
