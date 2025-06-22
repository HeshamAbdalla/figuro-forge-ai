
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import UpgradeNotification from "@/components/upgrade/UpgradeNotification";
import type { UpgradeModalAction } from "@/hooks/useEnhancedUpgradeModal";

interface UseUpgradeNotificationsReturn {
  showUpgradeNotification: (action: UpgradeModalAction) => void;
}

export const useUpgradeNotifications = (): UseUpgradeNotificationsReturn => {
  const { user } = useEnhancedAuth();
  const [activeToasts, setActiveToasts] = useState<Set<string>>(new Set());

  const showUpgradeNotification = useCallback((action: UpgradeModalAction) => {
    console.log('🔔 [UPGRADE-NOTIFICATIONS] Showing upgrade notification:', action);
    
    // Prevent duplicate notifications for the same action
    if (activeToasts.has(action)) {
      console.log('⏭️ [UPGRADE-NOTIFICATIONS] Notification already active for:', action);
      return;
    }

    if (!user) {
      console.warn('⚠️ [UPGRADE-NOTIFICATIONS] No user found, cannot show notification');
      return;
    }

    // Add to active toasts
    setActiveToasts(prev => new Set(prev).add(action));

    const { dismiss } = toast({
      duration: 15000, // 15 seconds
      description: (
        <UpgradeNotification
          actionType={action}
          onDismiss={() => {
            dismiss();
            setActiveToasts(prev => {
              const next = new Set(prev);
              next.delete(action);
              return next;
            });
          }}
        />
      ),
    });

    // Auto-remove from active toasts after duration
    setTimeout(() => {
      setActiveToasts(prev => {
        const next = new Set(prev);
        next.delete(action);
        return next;
      });
    }, 15000);

  }, [user, activeToasts]);

  return {
    showUpgradeNotification,
  };
};
