
import { useState } from "react";

export const useUpgradeModal = () => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalAction, setUpgradeModalAction] = useState<"image_generation" | "model_conversion">("image_generation");

  const showUpgradeModal = (actionType: "image_generation" | "model_conversion") => {
    setUpgradeModalAction(actionType);
    setIsUpgradeModalOpen(true);
  };

  const hideUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
  };

  return {
    isUpgradeModalOpen,
    upgradeModalAction,
    showUpgradeModal,
    hideUpgradeModal
  };
};
