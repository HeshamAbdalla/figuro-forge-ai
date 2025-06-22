
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useEnhancedUpgradeModal } from '@/hooks/useEnhancedUpgradeModal';
import EnhancedUpgradeModal from '@/components/upgrade/EnhancedUpgradeModal';
import UpgradeCelebration from '@/components/upgrade/UpgradeCelebration';
import { StudioErrorBoundary } from './StudioErrorBoundary';

interface StudioUpgradeHandlerProps {
  children?: React.ReactNode;
}

const StudioUpgradeHandler: React.FC<StudioUpgradeHandlerProps> = ({ children }) => {
  const {
    isUpgradeModalOpen,
    upgradeModalAction,
    hideUpgradeModal,
    showCelebration,
    hideCelebration,
    celebrationPlan
  } = useEnhancedUpgradeModal();

  console.log('🎯 [STUDIO-UPGRADE-HANDLER] Rendering with state:', {
    isUpgradeModalOpen,
    upgradeModalAction,
    shouldRenderModal: !!(isUpgradeModalOpen && upgradeModalAction),
    timestamp: new Date().toISOString()
  });

  return (
    <>
      {children}
      
      {/* Enhanced Upgrade Modal with proper error boundaries */}
      <AnimatePresence mode="wait">
        {isUpgradeModalOpen && upgradeModalAction && (
          <StudioErrorBoundary key={`upgrade-modal-${upgradeModalAction}`}>
            <EnhancedUpgradeModal
              key={upgradeModalAction} // Force re-mount on action change
              isOpen={isUpgradeModalOpen}
              onOpenChange={(open) => {
                console.log('💥 [STUDIO-UPGRADE-HANDLER] Modal open state changed:', open);
                if (!open) hideUpgradeModal();
              }}
              actionType={upgradeModalAction}
              title="Upgrade Required"
              description={
                upgradeModalAction === "image_generation"
                  ? "You've reached your daily image generation limit."
                  : upgradeModalAction === "model_conversion" 
                    ? "You've reached your monthly 3D conversion limit. Upgrade to continue creating 3D models."
                    : "You've reached your monthly model remesh limit. Upgrade to access advanced features."
              }
            />
          </StudioErrorBoundary>
        )}
      </AnimatePresence>

      {/* Debug info in development - will be removed in production builds */}
      {process.env.NODE_ENV === 'development' && upgradeModalAction && !isUpgradeModalOpen && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white p-2 text-xs rounded z-50 max-w-xs">
          Debug: Action set ({upgradeModalAction}) but modal not open
        </div>
      )}

      {/* Upgrade Celebration */}
      <UpgradeCelebration
        isVisible={showCelebration}
        onComplete={hideCelebration}
        planName={celebrationPlan}
      />
    </>
  );
};

export default StudioUpgradeHandler;
