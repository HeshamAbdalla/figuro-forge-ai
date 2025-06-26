
/**
 * Utility to inject global styles for reCAPTCHA badge control
 * This ensures the badge is hidden by default across the entire application
 */
export const injectRecaptchaBadgeStyles = () => {
  // Check if styles are already injected
  if (document.getElementById('recaptcha-badge-styles')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'recaptcha-badge-styles';
  styleElement.textContent = `
    /* Hide reCAPTCHA badge by default across the entire app */
    .grecaptcha-badge {
      visibility: hidden !important;
      opacity: 0 !important;
      transition: visibility 0.3s ease, opacity 0.3s ease !important;
    }
    
    /* Allow manual override when needed */
    .grecaptcha-badge.show {
      visibility: visible !important;
      opacity: 1 !important;
    }
  `;
  
  document.head.appendChild(styleElement);
  console.log('🎨 [RECAPTCHA-STYLES] Global reCAPTCHA badge styles injected');
};

/**
 * Utility to remove the injected styles (cleanup)
 */
export const removeRecaptchaBadgeStyles = () => {
  const styleElement = document.getElementById('recaptcha-badge-styles');
  if (styleElement) {
    styleElement.remove();
    console.log('🗑️ [RECAPTCHA-STYLES] Global reCAPTCHA badge styles removed');
  }
};
