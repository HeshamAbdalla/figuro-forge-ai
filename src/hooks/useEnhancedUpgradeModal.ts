
import { useState, useEffect, useRef, useCallback } from "react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";

// Type-safe upgrade modal action enum - standardized across the application
export type UpgradeModalAction = "image_generation" | "model_conversion" | "model_remesh";

// Validation function to ensure only valid enum values are used
const isValidUpgradeAction = (action: string): action is UpgradeModalAction => {
  const validActions: UpgradeModalAction[] = ["image_generation", "model_conversion", "model_remesh"];
  return validActions.includes(action as UpgradeModalAction);
};

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

  // Add refs to track previous values and prevent infinite loops
  const prevModalOpenRef = useRef(isUpgradeModalOpen);
  const prevActionRef = useRef(upgradeModalAction);
  const prevUserRef = useRef(user);
  const renderCountRef = useRef(0);

  // Increment render count for debugging
  renderCountRef.current += 1;

  // Enhanced debugging with loop detection
  useEffect(() => {
    // Only log when values actually change to prevent spam
    const modalOpenChanged = prevModalOpenRef.current !== isUpgradeModalOpen;
    const actionChanged = prevActionRef.current !== upgradeModalAction;
    const userChanged = prevUserRef.current !== user;

    if (modalOpenChanged || actionChanged || userChanged) {
      console.log('🪄 [UPGRADE-MODAL-HOOK] STATE CHANGED', {
        renderCount: renderCountRef.current,
        changes: {
          modalOpen: modalOpenChanged ? `${prevModalOpenRef.current} → ${isUpgradeModalOpen}` : 'no change',
          action: actionChanged ? `${prevActionRef.current} → ${upgradeModalAction}` : 'no change',
          user: userChanged ? `${!!prevUserRef.current} → ${!!user}` : 'no change'
        },
        timestamp: new Date().toISOString()
      });

      // Update refs
      prevModalOpenRef.current = isUpgradeModalOpen;
      prevActionRef.current = upgradeModalAction;
      prevUserRef.current = user;
    }

    // Detect rapid re-renders (potential infinite loop)
    if (renderCountRef.current > 10) {
      console.warn('⚠️ [UPGRADE-MODAL-HOOK] POTENTIAL INFINITE LOOP DETECTED', {
        renderCount: renderCountRef.current,
        currentState: { isUpgradeModalOpen, upgradeModalAction, hasUser: !!user }
      });
    }
  }, [isUpgradeModalOpen, upgradeModalAction, user]);

  const showUpgradeModal = useCallback((action: UpgradeModalAction) => {
    console.log('🔥 [UPGRADE-MODAL-HOOK] ===== SHOWING UPGRADE MODAL =====');
    
    // Type-safe validation of the action parameter
    if (!isValidUpgradeAction(action)) {
      console.error('❌ [UPGRADE-MODAL-HOOK] Invalid upgrade action provided:', action);
      console.error('✅ [UPGRADE-MODAL-HOOK] Valid actions are:', ["image_generation", "model_conversion", "model_remesh"]);
      return; // Early exit on invalid action
    }
    
    // Add additional check - if user has unlimited plan, don't show upgrade modal
    if (user) {
      // This is temporary debugging - we should NOT show upgrade modal for unlimited users
      console.log('⚠️ [UPGRADE-MODAL-HOOK] WARNING: Upgrade modal triggered for authenticated user');
      console.log('⚠️ [UPGRADE-MODAL-HOOK] This might be a bug if user has unlimited plan');
    }
    
    // Prevent duplicate calls - guard against re-triggering
    if (isUpgradeModalOpen && upgradeModalAction === action) {
      console.log('⏭️ [UPGRADE-MODAL-HOOK] Modal already open with same action, skipping');
      return;
    }
    
    console.log('🔄 [UPGRADE-MODAL-HOOK] Showing upgrade modal:', {
      action,
      user: !!user,
      currentModalOpen: isUpgradeModalOpen,
      currentAction: upgradeModalAction,
      timestamp: new Date().toISOString()
    });

    // Only show upgrade modal if user is authenticated
    if (user) {
      console.log('✅ [UPGRADE-MODAL-HOOK] User authenticated, updating modal state...');
      
      // Log state changes for debugging
      console.log('📥 [UPGRADE-MODAL-HOOK] setUpgradeModalAction:', action);
      setUpgradeModalAction(action);
      
      console.log('📥 [UPGRADE-MODAL-HOOK] setIsUpgradeModalOpen: true');
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
  }, [user, isUpgradeModalOpen, upgradeModalAction]); // Stable dependencies

  const hideUpgradeModal = useCallback(() => {
    console.log('❌ [UPGRADE-MODAL-HOOK] Hiding upgrade modal');
    console.log('📥 [UPGRADE-MODAL-HOOK] setIsUpgradeModalOpen: false');
    setIsUpgradeModalOpen(false);
    
    // Small delay to prevent race conditions and ensure smooth animation
    setTimeout(() => {
      console.log('📥 [UPGRADE-MODAL-HOOK] setUpgradeModalAction: null');
      setUpgradeModalAction(null);
    }, 150);
  }, []); // No dependencies needed

  const triggerCelebration = useCallback((planName: string = "Premium") => {
    console.log('🎉 [UPGRADE-MODAL-HOOK] Triggering celebration:', planName);
    setCelebrationPlan(planName);
    setShowCelebration(true);
    
    // Auto-hide celebration after 5 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  }, []); // No dependencies needed

  const hideCelebration = useCallback(() => {
    console.log('🎊 [UPGRADE-MODAL-HOOK] Hiding celebration');
    setShowCelebration(false);
  }, []); // No dependencies needed

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

// Export the validation function for use in other components
export { isValidUpgradeAction };
