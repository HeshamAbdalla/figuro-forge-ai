
import { useState } from "react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";

export type UpgradeModalAction = "image_generation" | "model_conversion";

interface UseUpgradeModalReturn {
  isUpgradeModalOpen: boolean;
  upgradeModalAction: UpgradeModalAction | null;
  showUpgradeModal: (action: UpgradeModalAction) => void;
  hideUpgradeModal: () => void;
}

export const useUpgradeModal = (): UseUpgradeModalReturn => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalAction, setUpgradeModalAction] = useState<UpgradeModalAction | null>(null);
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

  return {
    isUpgradeModalOpen,
    upgradeModalAction,
    showUpgradeModal,
    hideUpgradeModal,
  };
};
