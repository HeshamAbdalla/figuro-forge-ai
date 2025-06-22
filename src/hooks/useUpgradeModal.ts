
import { useState } from "react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";

// Import standardized types and validation from the enhanced hook
export type UpgradeModalAction = "image_generation" | "model_conversion" | "model_remesh";

// Type-safe validation function
const isValidUpgradeAction = (action: string): action is UpgradeModalAction => {
  const validActions: UpgradeModalAction[] = ["image_generation", "model_conversion", "model_remesh"];
  return validActions.includes(action as UpgradeModalAction);
};

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
    // Type-safe validation of the action parameter
    if (!isValidUpgradeAction(action)) {
      console.error('❌ [UPGRADE-MODAL] Invalid upgrade action provided:', action);
      console.error('✅ [UPGRADE-MODAL] Valid actions are:', ["image_generation", "model_conversion", "model_remesh"]);
      return; // Early exit on invalid action
    }
    
    console.log('🔄 [UPGRADE-MODAL] Showing upgrade modal:', { action, hasUser: !!user });
    
    // Only show upgrade modal if user is authenticated
    if (user) {
      setUpgradeModalAction(action);
      setIsUpgradeModalOpen(true);
    } else {
      console.warn('⚠️ [UPGRADE-MODAL] No user found, cannot show upgrade modal');
    }
  };

  const hideUpgradeModal = () => {
    console.log('❌ [UPGRADE-MODAL] Hiding upgrade modal');
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

// Export the validation function for use in other components
export { isValidUpgradeAction };
