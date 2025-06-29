
import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanSummary } from "@/components/subscription/PlanSummary";
import { PlanOptions } from "@/components/subscription/PlanOptions";
import { BillingHistory } from "@/components/subscription/BillingHistory";
import { EnhancedUsageTracker } from "@/components/subscription/EnhancedUsageTracker";
import { CreditCard, BarChart3, Settings } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface EnhancedProfileTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onUpgrade: () => void;
}

const EnhancedProfileTabs: React.FC<EnhancedProfileTabsProps> = ({
  activeTab,
  onTabChange,
  onUpgrade
}) => {
  const { isMobile, isTablet } = useResponsiveLayout();

  const tabs = [
    {
      value: "info",
      label: "Subscription",
      icon: CreditCard,
      description: "Manage your plan and billing",
      mobileLabel: "Plan"
    },
    {
      value: "usage",
      label: "Usage",
      icon: BarChart3,
      description: "Track your usage and limits",
      mobileLabel: "Usage"
    },
    {
      value: "billing",
      label: "Billing",
      icon: Settings,
      description: "View billing history and invoices",
      mobileLabel: "Billing"
    }
  ];

  return (
    <div className={`container mx-auto ${isMobile ? 'px-4 py-8' : 'px-4 py-16'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={isMobile ? 'w-full' : 'max-w-5xl mx-auto'}
      >
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          {/* Enhanced Tab Navigation */}
          <div className={`flex justify-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
            <TabsList className={`glass-panel p-1 bg-white/5 border border-white/10 rounded-2xl ${
              isMobile 
                ? 'w-full max-w-none grid grid-cols-3' 
                : 'p-2'
            }`}>
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`relative text-white/70 data-[state=active]:text-white data-[state=active]:bg-figuro-accent transition-all duration-300 ${
                      isMobile 
                        ? 'px-2 py-3 rounded-xl text-xs flex-col gap-1' 
                        : 'px-6 py-3 rounded-xl'
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center ${
                        isMobile ? 'flex-col gap-1' : 'gap-2'
                      }`}
                    >
                      <Icon className={isMobile ? 'w-4 h-4' : 'w-4 h-4'} />
                      <span className="font-medium whitespace-nowrap">
                        {isMobile ? tab.mobileLabel : tab.label}
                      </span>
                    </motion.div>
                    
                    {activeTab === tab.value && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-figuro-accent rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content with Enhanced Cards */}
          <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
            <TabsContent value="info" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={isMobile ? 'space-y-4' : 'space-y-8'}
              >
                <div className={`glass-panel border border-white/10 hover:border-figuro-accent/20 transition-all duration-300 ${
                  isMobile ? 'rounded-xl p-4' : 'rounded-2xl p-8'
                }`}>
                  <PlanSummary />
                </div>
                <div className={`glass-panel border border-white/10 hover:border-figuro-accent/20 transition-all duration-300 ${
                  isMobile ? 'rounded-xl p-4' : 'rounded-2xl p-8'
                }`}>
                  <PlanOptions />
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="usage" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`glass-panel border border-white/10 hover:border-figuro-accent/20 transition-all duration-300 ${
                  isMobile ? 'rounded-xl p-4' : 'rounded-2xl p-8'
                }`}
              >
                <EnhancedUsageTracker onUpgrade={onUpgrade} />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="billing" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={isMobile ? 'space-y-4' : 'space-y-8'}
              >
                <div className={`glass-panel border border-white/10 hover:border-figuro-accent/20 transition-all duration-300 ${
                  isMobile ? 'rounded-xl p-4' : 'rounded-2xl p-8'
                }`}>
                  <PlanSummary />
                </div>
                <div className={`glass-panel border border-white/10 hover:border-figuro-accent/20 transition-all duration-300 ${
                  isMobile ? 'rounded-xl p-4' : 'rounded-2xl p-8'
                }`}>
                  <BillingHistory />
                </div>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default EnhancedProfileTabs;
