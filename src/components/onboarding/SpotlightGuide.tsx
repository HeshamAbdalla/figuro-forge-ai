
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import { onboardingSteps } from "./onboardingSteps";
import { useEffect, useState } from "react";

interface SpotlightGuideProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
  isVisible: boolean;
}

const SpotlightGuide = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  isVisible
}: SpotlightGuideProps) => {
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  // Add highlighting styles to document head
  useEffect(() => {
    if (!isVisible) return;

    // Create and inject the CSS for highlighting
    const styleId = 'onboarding-highlight-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      .onboarding-highlight {
        position: relative !important;
        z-index: 51 !important;
        box-shadow: 0 0 0 2px rgba(139, 69, 255, 0.5) !important;
        border-radius: 4px !important;
      }
    `;

    return () => {
      // Clean up styles when component unmounts or becomes invisible
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [isVisible]);

  // Find and track the target element
  useEffect(() => {
    if (!isVisible || !step) return;

    const findTargetElement = () => {
      let element: Element | null = null;
      
      // Try different selectors based on the target
      const selectors = [
        step.target,
        `[data-tab="${step.target.replace('[data-tab="', '').replace('"]', '')}"]`,
        `.${step.target.replace('.', '')}`,
        `#${step.target.replace('#', '')}`
      ];

      for (const selector of selectors) {
        try {
          element = document.querySelector(selector);
          if (element) break;
        } catch (e) {
          // Invalid selector, continue
        }
      }

      // Fallback: try to find elements by content or common patterns
      if (!element) {
        if (step.target.includes('image-to-3d')) {
          element = document.querySelector('[role="tab"]');
        } else if (step.target.includes('camera')) {
          const tabs = document.querySelectorAll('[role="tab"]');
          element = tabs[1]; // Usually second tab
        } else if (step.target.includes('text-to-3d')) {
          const tabs = document.querySelectorAll('[role="tab"]');
          element = tabs[2]; // Usually third tab
        } else if (step.target.includes('gallery')) {
          const tabs = document.querySelectorAll('[role="tab"]');
          element = tabs[tabs.length - 1]; // Usually last tab
        } else if (step.target.includes('header')) {
          element = document.querySelector('header') || document.querySelector('nav');
        } else if (step.target.includes('form')) {
          element = document.querySelector('form') || document.querySelector('textarea');
        } else if (step.target.includes('generate')) {
          element = document.querySelector('button[type="submit"]') || 
                   Array.from(document.querySelectorAll('button')).find(btn => 
                     btn.textContent?.toLowerCase().includes('generate')
                   );
        } else if (step.target.includes('convert') || step.target.includes('3d')) {
          element = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent?.toLowerCase().includes('convert') || 
            btn.textContent?.toLowerCase().includes('3d')
          );
        }
      }

      return element;
    };

    // Try to find element with retries
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryFindElement = () => {
      const element = findTargetElement();
      
      if (element) {
        setTargetElement(element);
        setTargetRect(element.getBoundingClientRect());
        
        // Add highlighting class
        element.classList.add('onboarding-highlight');
        
        return true;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryFindElement, 500);
      } else {
        console.warn(`Could not find target element for step: ${step.target}`);
        // Set a fallback position in the center of the screen
        setTargetRect(new DOMRect(
          window.innerWidth / 2 - 100, 
          window.innerHeight / 2 - 50, 
          200, 
          100
        ));
      }
      
      return false;
    };

    tryFindElement();

    // Cleanup function
    return () => {
      if (targetElement) {
        targetElement.classList.remove('onboarding-highlight');
      }
    };
  }, [isVisible, step, currentStep]);

  // Update position when window resizes
  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      setTargetRect(targetElement.getBoundingClientRect());
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetElement]);

  if (!isVisible || !step) return null;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const tooltipWidth = 400;
    const tooltipHeight = 200;
    const padding = 20;

    let top = targetRect.bottom + padding;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);

    // Adjust if tooltip goes off screen
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    // If tooltip goes off bottom, put it above the target
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = targetRect.top - tooltipHeight - padding;
    }

    // If still off screen, position relative to viewport
    if (top < padding) top = padding;

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform: 'none'
    };
  };

  const tooltipPosition = getTooltipPosition();

  // Calculate spotlight position
  const getSpotlightStyle = () => {
    if (!targetRect) return {};

    const spotlightRadius = Math.max(targetRect.width, targetRect.height) / 2 + 20;
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;

    return {
      background: `radial-gradient(circle ${spotlightRadius}px at ${centerX}px ${centerY}px, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 70%)`,
    };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Spotlight Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-auto"
          style={getSpotlightStyle()}
          onClick={onClose}
        />

        {/* Target highlight ring */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute border-2 border-figuro-accent rounded-lg pointer-events-none"
            style={{
              left: targetRect.left - 4,
              top: targetRect.top - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: '0 0 20px rgba(139, 69, 255, 0.5)'
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute pointer-events-auto z-10"
          style={tooltipPosition}
        >
          <div className="bg-figuro-dark border border-figuro-accent/30 rounded-lg shadow-2xl max-w-sm p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/60 hover:text-white hover:bg-white/10 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>Step {currentStep + 1} of {totalSteps}</span>
                <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="bg-figuro-accent rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevious}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                
                {step.showSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Skip Tour
                  </Button>
                )}
              </div>

              <Button
                onClick={isLastStep ? onClose : onNext}
                size="sm"
                className="bg-figuro-accent hover:bg-figuro-accent/90 text-white"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SpotlightGuide;
