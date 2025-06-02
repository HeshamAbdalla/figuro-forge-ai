
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
    // Only show upgrade modal if user is authenticated
    if (user) {
      setUpgradeModalAction(action);
      setIsUpgradeModalOpen(true);
    }
  };

  const hideUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalAction(null);
  };

  const triggerCelebration = (planName: string = "Premium") => {
    setCelebrationPlan(planName);
    setShowCelebration(true);
  };

  const hideCelebration = () => {
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
