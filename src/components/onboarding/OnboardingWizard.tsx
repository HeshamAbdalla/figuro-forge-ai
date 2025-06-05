
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

  // Enhanced element targeting setup
  useEffect(() => {
    if (isActive) {
      console.log('🎯 [ONBOARDING] Setting up element targeting for step:', currentStep);
      
      // Wait for DOM to be ready
      const setupTargeting = () => {
        // Add targeting attributes to studio header
        const studioHeader = document.querySelector('header') || 
                            document.querySelector('nav') || 
                            document.querySelector('[class*="header"]');
        if (studioHeader && !studioHeader.classList.contains('studio-header')) {
          studioHeader.classList.add('studio-header');
          console.log('✅ [ONBOARDING] Studio header targeted');
        }

        // Add attributes to tab elements with more robust selection
        const tabs = document.querySelectorAll('[role="tab"], [class*="tab"], button[data-state]');
        const tabNames = ['image-to-3d', 'camera', 'text-to-3d', 'web-icons', 'gallery'];
        
        tabs.forEach((tab, index) => {
          if (tabNames[index] && !tab.getAttribute('data-tab')) {
            tab.setAttribute('data-tab', tabNames[index]);
            console.log(`✅ [ONBOARDING] Tab "${tabNames[index]}" targeted`);
          }
        });

        // Target forms and textareas
        const promptForms = document.querySelectorAll('form, textarea, [class*="prompt"]');
        promptForms.forEach(form => {
          if (!form.classList.contains('prompt-form')) {
            form.classList.add('prompt-form');
            console.log('✅ [ONBOARDING] Prompt form targeted');
          }
        });

        // Target generate buttons
        const generateButtons = document.querySelectorAll('button');
        generateButtons.forEach(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          if (text.includes('generate') && !btn.classList.contains('generate-button')) {
            btn.classList.add('generate-button');
            console.log('✅ [ONBOARDING] Generate button targeted');
          }
          if ((text.includes('convert') || text.includes('3d')) && !btn.classList.contains('convert-3d-button')) {
            btn.classList.add('convert-3d-button');
            console.log('✅ [ONBOARDING] Convert 3D button targeted');
          }
        });

        // Target gallery elements
        const galleryElements = document.querySelectorAll('[class*="gallery"], [class*="grid"]');
        galleryElements.forEach(element => {
          if (!element.classList.contains('gallery-section')) {
            element.classList.add('gallery-section');
          }
        });
      };

      // Run setup with delays to account for dynamic content
      setupTargeting();
      setTimeout(setupTargeting, 500);
      setTimeout(setupTargeting, 1000);
      
      // Setup mutation observer to watch for dynamic content
      const observer = new MutationObserver((mutations) => {
        let shouldSetup = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldSetup = true;
          }
        });
        if (shouldSetup) {
          setTimeout(setupTargeting, 100);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [isActive, currentStep]);

  // Handle step progression
  const handleNext = () => {
    console.log('➡️ [ONBOARDING] Moving to next step from:', currentStep);
    if (currentStep < onboardingSteps.length - 1) {
      nextStep();
    } else {
      console.log('🏁 [ONBOARDING] Completing onboarding');
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    console.log('⏭️ [ONBOARDING] Skipping onboarding');
    setShowWelcomeModal(false);
    skipOnboarding();
  };

  const handleStartTour = () => {
    console.log('🚀 [ONBOARDING] Starting guided tour');
    startOnboarding();
  };

  const handleClose = () => {
    console.log('✅ [ONBOARDING] Closing onboarding wizard');
    completeOnboarding();
  };

  // Don't render if onboarding is complete
  if (isOnboardingComplete) {
    return null;
  }

  return (
    <>
      <WelcomeModal
        isOpen={showWelcomeModal}
        onStartTour={handleStartTour}
        onSkip={handleSkip}
      />
      
      <SpotlightGuide
        currentStep={currentStep}
        totalSteps={onboardingSteps.length}
        onNext={handleNext}
        onPrevious={prevStep}
        onSkip={skipOnboarding}
        onClose={handleClose}
        isVisible={isActive}
      />
    </>
  );
};

export default OnboardingWizard;
