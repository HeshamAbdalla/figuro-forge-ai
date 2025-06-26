
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to control reCAPTCHA badge visibility based on current route
 * Shows the badge only on the /auth page, hides it everywhere else
 */
export const useRecaptchaBadgeVisibility = () => {
  const location = useLocation();

  useEffect(() => {
    const showBadge = location.pathname === '/auth';
    
    // Find the reCAPTCHA badge element
    const badge = document.querySelector('.grecaptcha-badge') as HTMLElement;
    
    if (badge) {
      // Show or hide the badge based on current route
      badge.style.visibility = showBadge ? 'visible' : 'hidden';
      badge.style.opacity = showBadge ? '1' : '0';
      
      console.log(`🔒 [RECAPTCHA-BADGE] ${showBadge ? 'Showing' : 'Hiding'} badge on route: ${location.pathname}`);
    } else {
      // If badge doesn't exist yet, set up a delayed check
      const checkForBadge = () => {
        const delayedBadge = document.querySelector('.grecaptcha-badge') as HTMLElement;
        if (delayedBadge) {
          delayedBadge.style.visibility = showBadge ? 'visible' : 'hidden';
          delayedBadge.style.opacity = showBadge ? '1' : '0';
          console.log(`🔒 [RECAPTCHA-BADGE] Delayed ${showBadge ? 'showing' : 'hiding'} badge on route: ${location.pathname}`);
        }
      };
      
      // Check after a short delay to allow reCAPTCHA to load
      setTimeout(checkForBadge, 500);
    }
  }, [location.pathname]);

  // Cleanup function to hide badge when component unmounts
  useEffect(() => {
    return () => {
      const badge = document.querySelector('.grecaptcha-badge') as HTMLElement;
      if (badge) {
        badge.style.visibility = 'hidden';
        badge.style.opacity = '0';
      }
    };
  }, []);
};
