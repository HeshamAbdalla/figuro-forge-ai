
import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanSummary } from "@/components/subscription/PlanSummary";
import { PlanOptions } from "@/components/subscription/PlanOptions";
import { BillingHistory } from "@/components/subscription/BillingHistory";
import { EnhancedUsageTracker } from "@/components/subscription/EnhancedUsageTracker";
import { CreditCard, BarChart3, Settings } from "lucide-react";

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
  const tabs = [
    {
      value: "info",
      label: "Subscription",
      icon: CreditCard,
      description: "Manage your plan and billing"
    },
    {
      value: "usage",
      label: "Usage",
      icon: BarChart3,
      description: "Track your usage and limits"
    },
    {
      value: "billing",
      label: "Billing",
      icon: Settings,
      description: "View billing history and invoices"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          {/* Enhanced Tab Navigation */}
          <div className="flex justify-center mb-8">
            <TabsList className="glass-panel p-2 bg-white/5 border border-white/10 rounded-2xl">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative px-6 py-3 rounded-xl text-white/70 data-[state=active]:text-white data-[state=active]:bg-figuro-accent transition-all duration-300"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
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
          <div className="space-y-6">
            <TabsContent value="info" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-figuro-accent/20 transition-all duration-300">
                  <PlanSummary />
                </div>
                <div className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-figuro-accent/20 transition-all duration-300">
                  <PlanOptions />
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="usage" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-figuro-accent/20 transition-all duration-300"
              >
                <EnhancedUsageTracker onUpgrade={onUpgrade} />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="billing" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-figuro-accent/20 transition-all duration-300">
                  <PlanSummary />
                </div>
                <div className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-figuro-accent/20 transition-all duration-300">
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
