
/**
 * Google reCAPTCHA v3 utilities - Dynamic loading for auth page only
 */

// reCAPTCHA site key
const RECAPTCHA_SITE_KEY = "6Le5lFcrAAAAAOySTtpVoOrDH7EQx8pQiLFq5pRT";

// Action types for reCAPTCHA
export type ReCaptchaAction = 
  | "signup" 
  | "login" 
  | "password_reset" 
  | "email_verification"
  | "contact_form";

/**
 * Dynamically loads the reCAPTCHA script
 */
export const loadRecaptchaScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (isRecaptchaReady()) {
      console.log('✅ [RECAPTCHA] Script already loaded');
      resolve(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (existingScript) {
      console.log('🔄 [RECAPTCHA] Script already loading, waiting...');
      // Wait for it to load
      const checkLoaded = () => {
        if (isRecaptchaReady()) {
          resolve(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    console.log('📦 [RECAPTCHA] Loading script dynamically...');
    
    // Create and load the script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ [RECAPTCHA] Script loaded successfully');
      // Wait a bit for grecaptcha to be ready
      setTimeout(() => {
        resolve(isRecaptchaReady());
      }, 500);
    };
    
    script.onerror = () => {
      console.error('❌ [RECAPTCHA] Failed to load script');
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Removes the reCAPTCHA script and cleans up
 */
export const unloadRecaptchaScript = (): void => {
  console.log('🧹 [RECAPTCHA] Cleaning up...');
  
  // Remove the script
  const scripts = document.querySelectorAll('script[src*="recaptcha"]');
  scripts.forEach(script => script.remove());
  
  // Remove reCAPTCHA elements
  const recaptchaElements = document.querySelectorAll('.grecaptcha-badge, [id^="grecaptcha"]');
  recaptchaElements.forEach(element => element.remove());
  
  // Clear the global grecaptcha object
  if (window && (window as any).grecaptcha) {
    delete (window as any).grecaptcha;
  }
  
  console.log('✅ [RECAPTCHA] Cleanup completed');
};

/**
 * Checks if reCAPTCHA is ready immediately (non-blocking)
 */
export const isRecaptchaReady = (): boolean => {
  const grecaptcha = (window as any).grecaptcha;
  return !!(grecaptcha && grecaptcha.execute);
};

/**
 * Initialize reCAPTCHA with dynamic loading
 */
export const initializeRecaptcha = (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    console.log('🚀 [RECAPTCHA] Initializing...');
    
    try {
      const loaded = await loadRecaptchaScript();
      if (loaded) {
        console.log('✅ [RECAPTCHA] Successfully initialized');
      } else {
        console.warn('⚠️ [RECAPTCHA] Failed to initialize, app will continue without reCAPTCHA');
      }
      resolve(loaded);
    } catch (error) {
      console.error('❌ [RECAPTCHA] Initialization error:', error);
      resolve(false);
    }
  });
};

/**
 * Executes reCAPTCHA and returns a token for Supabase auth
 * @param action The action being performed
 * @returns Promise with token string or null
 */
export const executeRecaptcha = async (action: ReCaptchaAction): Promise<string | null> => {
  try {
    console.log(`🤖 [RECAPTCHA] Executing reCAPTCHA for action: ${action}`);
    
    // Check if reCAPTCHA is ready
    if (!isRecaptchaReady()) {
      console.warn('❌ [RECAPTCHA] Not ready for execution');
      return null;
    }
    
    // Access the grecaptcha object from the global scope
    const grecaptcha = (window as any).grecaptcha;
    
    // Execute reCAPTCHA with our site key
    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    console.log(`✅ [RECAPTCHA] Token generated for ${action}, length: ${token.length}`);
    
    return token;
  } catch (error) {
    console.error('❌ [RECAPTCHA] Error executing reCAPTCHA:', error);
    return null;
  }
};

/**
 * Get current domain for debugging
 */
export const getCurrentDomain = (): string => {
  return window.location.hostname;
};

/**
 * Check if current domain is configured for reCAPTCHA
 */
export const isDomainConfigured = (): boolean => {
  const domain = getCurrentDomain();
  const configuredDomains = ['figuros.ai', 'www.figuros.ai', 'localhost'];
  return configuredDomains.includes(domain);
};
