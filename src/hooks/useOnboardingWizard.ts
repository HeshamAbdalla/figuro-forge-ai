
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { useNavigate } from 'react-router-dom';

export const useOnboardingWizard = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { user, session } = useEnhancedAuth();
  const navigate = useNavigate();

  // Check onboarding status when user changes
  useEffect(() => {
    if (user && session) {
      checkOnboardingStatus();
    }
  }, [user, session]);

  const checkOnboardingStatus = async () => {
    try {
      console.log('🔍 [ONBOARDING] Checking onboarding status for user:', user?.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_onboarding_complete, created_at')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('❌ [ONBOARDING] Error fetching profile:', error);
        return;
      }

      // If no profile exists, create one for new users
      if (!profile) {
        console.log('🆕 [ONBOARDING] No profile found, creating new profile for user');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user?.id,
            is_onboarding_complete: false,
            plan: 'free'
          })
          .select('is_onboarding_complete, created_at')
          .single();

        if (createError) {
          console.error('❌ [ONBOARDING] Error creating profile:', createError);
          return;
        }

        setIsOnboardingComplete(false);
        
        // If user is not on studio page, redirect them there for onboarding
        if (window.location.pathname !== '/studio') {
          console.log('🔄 [ONBOARDING] Redirecting new user to studio for onboarding');
          navigate('/studio');
          return;
        }
        
        setShowWelcomeModal(true);
        console.log('✨ [ONBOARDING] New user profile created, showing welcome modal');
        return;
      }

      const isComplete = profile.is_onboarding_complete ?? false;
      setIsOnboardingComplete(isComplete);

      // Show welcome modal for users who haven't completed onboarding
      if (!isComplete) {
        console.log('✨ [ONBOARDING] User has incomplete onboarding');
        
        // If user is not on studio page, redirect them there for onboarding
        if (window.location.pathname !== '/studio') {
          console.log('🔄 [ONBOARDING] Redirecting user to studio for onboarding');
          navigate('/studio');
          return;
        }
        
        setShowWelcomeModal(true);
      } else {
        console.log('✅ [ONBOARDING] User has completed onboarding');
      }

    } catch (error) {
      console.error('❌ [ONBOARDING] Error checking onboarding status:', error);
    }
  };

  const startOnboarding = () => {
    console.log('🚀 [ONBOARDING] Starting onboarding wizard');
    setShowWelcomeModal(false);
    setIsActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const skipOnboarding = async () => {
    console.log('⏭️ [ONBOARDING] Skipping onboarding');
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      console.log('✅ [ONBOARDING] Completing onboarding for user:', user?.id);

      if (!user?.id) {
        console.warn('⚠️ [ONBOARDING] No user ID available');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ is_onboarding_complete: true })
        .eq('id', user.id);

      if (error) {
        console.error('❌ [ONBOARDING] Error updating profile:', error);
        return;
      }

      setIsOnboardingComplete(true);
      setIsActive(false);
      setShowWelcomeModal(false);
      setCurrentStep(0);

      console.log('✅ [ONBOARDING] Onboarding completed successfully');

    } catch (error) {
      console.error('❌ [ONBOARDING] Error completing onboarding:', error);
    }
  };

  return {
    isOnboardingComplete,
    currentStep,
    isActive,
    showWelcomeModal,
    startOnboarding,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
    setShowWelcomeModal
  };
};
