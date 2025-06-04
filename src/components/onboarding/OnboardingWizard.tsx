
import { useEffect } from 'react';
import WelcomeModal from './WelcomeModal';
import SpotlightGuide from './SpotlightGuide';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { onboardingSteps } from './onboardingSteps';

const OnboardingWizard = () => {
  const {
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
  } = useOnboardingWizard();

  // Add data attributes to help with targeting elements
  useEffect(() => {
    if (isActive) {
      // Add targeting attributes to elements
      const studioHeader = document.querySelector('header');
      if (studioHeader) {
        studioHeader.classList.add('studio-header');
      }

      // Add attributes to tab elements
      const tabs = document.querySelectorAll('[role="tab"]');
      tabs.forEach((tab, index) => {
        const tabNames = ['image-to-3d', 'camera', 'text-to-3d', 'web-icons', 'gallery'];
        if (tabNames[index]) {
          tab.setAttribute('data-tab', tabNames[index]);
        }
      });

      // Add attributes to forms and buttons
      const promptForm = document.querySelector('form');
      if (promptForm) {
        promptForm.classList.add('prompt-form');
      }

      const generateButtons = document.querySelectorAll('button[type="submit"]');
      generateButtons.forEach(btn => {
        if (btn.textContent?.includes('Generate')) {
          btn.classList.add('generate-button');
        }
      });

      const convertButtons = document.querySelectorAll('button');
      convertButtons.forEach(btn => {
        if (btn.textContent?.includes('Convert') || btn.textContent?.includes('3D')) {
          btn.classList.add('convert-3d-button');
        }
      });
    }
  }, [isActive]);

  // Handle step progression
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      nextStep();
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    setShowWelcomeModal(false);
    skipOnboarding();
  };

  // Don't render if onboarding is complete
  if (isOnboardingComplete) {
    return null;
  }

  return (
    <>
      <WelcomeModal
        isOpen={showWelcomeModal}
        onStartTour={startOnboarding}
        onSkip={handleSkip}
      />
      
      <SpotlightGuide
        currentStep={currentStep}
        totalSteps={onboardingSteps.length}
        onNext={handleNext}
        onPrevious={prevStep}
        onSkip={skipOnboarding}
        onClose={completeOnboarding}
        isVisible={isActive}
      />
    </>
  );
};

export default OnboardingWizard;
