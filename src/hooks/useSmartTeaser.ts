
import { useState, useEffect, useCallback } from 'react';
import { useOptimizedSubscription } from '@/hooks/useOptimizedSubscription';

interface TeaserState {
  showTeaser: boolean;
  teaserType: 'image_generation' | 'model_conversion' | null;
  dismissedTeasers: string[];
  lastShownAt: number | null;
}

const TEASER_COOLDOWN = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'figuro_teaser_state';

export const useSmartTeaser = () => {
  const { subscription, canPerformAction } = useOptimizedSubscription();
  const [teaserState, setTeaserState] = useState<TeaserState>({
    showTeaser: false,
    teaserType: null,
    dismissedTeasers: [],
    lastShownAt: null
  });

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTeaserState(prev => ({
          ...prev,
          dismissedTeasers: parsed.dismissedTeasers || [],
          lastShownAt: parsed.lastShownAt || null
        }));
      }
    } catch (error) {
      console.error('Failed to load teaser state:', error);
    }
  }, []);

  // Persist state to localStorage
  const persistState = useCallback((state: Partial<TeaserState>) => {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const updated = { ...current, ...state };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to persist teaser state:', error);
    }
  }, []);

  // Mock getRemainingUsage function for compatibility
  const getRemainingUsage = useCallback((actionType: 'image_generation' | 'model_conversion') => {
    if (!subscription) return null;

    if (actionType === 'image_generation') {
      return {
        remaining: Math.max(0, (subscription.monthly_limit || 0) - (subscription.generation_count_this_month || 0)),
        used: subscription.generation_count_this_month || 0,
        limit: subscription.monthly_limit || 0
      };
    } else if (actionType === 'model_conversion') {
      return {
        remaining: Math.max(0, (subscription.monthly_limit || 0) - (subscription.converted_3d_this_month || 0)),
        used: subscription.converted_3d_this_month || 0,
        limit: subscription.monthly_limit || 0
      };
    }

    return null;
  }, [subscription]);

  // Check if we should show a teaser based on usage
  const checkTeaserTrigger = useCallback((actionType: 'image_generation' | 'model_conversion') => {
    if (!subscription) return false;

    const now = Date.now();
    const teaserId = `${actionType}_${new Date().toDateString()}`;
    
    // Don't show if dismissed today or recently shown
    if (
      teaserState.dismissedTeasers.includes(teaserId) ||
      (teaserState.lastShownAt && now - teaserState.lastShownAt < TEASER_COOLDOWN)
    ) {
      return false;
    }

    // Don't show if user can still perform the action
    if (canPerformAction(actionType)) {
      return false;
    }

    const usage = getRemainingUsage(actionType);
    if (!usage) return false;

    // Show teaser when user hits the limit
    return usage.remaining === 0;
  }, [subscription, teaserState, canPerformAction, getRemainingUsage]);

  // Trigger teaser display
  const triggerTeaser = useCallback((actionType: 'image_generation' | 'model_conversion') => {
    if (checkTeaserTrigger(actionType)) {
      setTeaserState(prev => ({
        ...prev,
        showTeaser: true,
        teaserType: actionType,
        lastShownAt: Date.now()
      }));
      persistState({ lastShownAt: Date.now() });
      return true;
    }
    return false;
  }, [checkTeaserTrigger, persistState]);

  // Dismiss teaser
  const dismissTeaser = useCallback((actionType?: 'image_generation' | 'model_conversion') => {
    const type = actionType || teaserState.teaserType;
    if (type) {
      const teaserId = `${type}_${new Date().toDateString()}`;
      const newDismissed = [...teaserState.dismissedTeasers, teaserId];
      
      setTeaserState(prev => ({
        ...prev,
        showTeaser: false,
        teaserType: null,
        dismissedTeasers: newDismissed
      }));
      persistState({ dismissedTeasers: newDismissed });
    }
  }, [teaserState, persistState]);

  // Hide teaser without dismissing
  const hideTeaser = useCallback(() => {
    setTeaserState(prev => ({
      ...prev,
      showTeaser: false,
      teaserType: null
    }));
  }, []);

  // Get usage progress for animations
  const getUsageProgress = useCallback((actionType: 'image_generation' | 'model_conversion') => {
    const usage = getRemainingUsage(actionType);
    if (!usage || usage.limit === -1) return 0; // Unlimited
    
    const progressPercentage = (usage.used / usage.limit) * 100;
    return Math.min(100, progressPercentage);
  }, [getRemainingUsage]);

  // Determine urgency level for visual cues
  const getUrgencyLevel = useCallback((actionType: 'image_generation' | 'model_conversion') => {
    const progress = getUsageProgress(actionType);
    if (progress >= 100) return 'critical';
    if (progress >= 80) return 'high';
    if (progress >= 60) return 'medium';
    return 'low';
  }, [getUsageProgress]);

  return {
    teaserState,
    triggerTeaser,
    dismissTeaser,
    hideTeaser,
    checkTeaserTrigger,
    getUsageProgress,
    getUrgencyLevel,
    getRemainingUsage
  };
};
