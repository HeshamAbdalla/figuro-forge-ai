
import { useState } from "react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";

export type UpgradeModalAction = "image_generation" | "model_conversion" | "model_remesh";

interface UseEnhancedUpgradeModalReturn {
  isUpgradeModalOpen: boolean;
  upgradeModalAction: UpgradeModalAction | null;
  showUpgradeModal: (action: UpgradeModalAction) => void;
  hideUpgradeModal: () => void;
  showCelebration: boolean;
  triggerCelebration: (planName?: string) => void;
  hideCelebration: () => void;
  celebrationPlan: string;
}

export const useEnhancedUpgradeModal = (): UseEnhancedUpgradeModalReturn => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalAction, setUpgradeModalAction] = useState<UpgradeModalAction | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPlan, setCelebrationPlan] = useState("Premium");
  const { user } = useEnhancedAuth();

  const showUpgradeModal = (action: UpgradeModalAction) => {
    console.log('🔄 [UPGRADE-MODAL-HOOK] Showing upgrade modal:', {
      action,
      user: !!user,
      timestamp: new Date().toISOString()
    });

    // Only show upgrade modal if user is authenticated
    if (user) {
      setUpgradeModalAction(action);
      setIsUpgradeModalOpen(true);
      
      // Log upgrade modal trigger for analytics
      console.log('📊 [UPGRADE-MODAL-HOOK] User hit limit:', {
        userId: user.id,
        action,
        userEmail: user.email,
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('⚠️ [UPGRADE-MODAL-HOOK] No user found, cannot show upgrade modal');
    }
  };

  const hideUpgradeModal = () => {
    console.log('❌ [UPGRADE-MODAL-HOOK] Hiding upgrade modal');
    setIsUpgradeModalOpen(false);
    setUpgradeModalAction(null);
  };

  const triggerCelebration = (planName: string = "Premium") => {
    console.log('🎉 [UPGRADE-MODAL-HOOK] Triggering celebration:', planName);
    setCelebrationPlan(planName);
    setShowCelebration(true);
    
    // Auto-hide celebration after 5 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  const hideCelebration = () => {
    console.log('🎊 [UPGRADE-MODAL-HOOK] Hiding celebration');
    setShowCelebration(false);
  };

  return {
    isUpgradeModalOpen,
    upgradeModalAction,
    showUpgradeModal,
    hideUpgradeModal,
    showCelebration,
    triggerCelebration,
    hideCelebration,
    celebrationPlan,
  };
};
