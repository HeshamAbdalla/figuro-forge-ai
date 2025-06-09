
/**
 * Google reCAPTCHA v3 utilities - Simplified for Supabase integration
 * Now uses Supabase's built-in reCAPTCHA instead of custom edge function
 */

// reCAPTCHA site key - matches the one in index.html
const RECAPTCHA_SITE_KEY = "6Le5lFcrAAAAAOySTtpVoOrDH7EQx8pQiLFq5pRT";

// Action types for reCAPTCHA
export type ReCaptchaAction = 
  | "signup" 
  | "login" 
  | "password_reset" 
  | "email_verification"
  | "contact_form";

/**
 * Checks if reCAPTCHA is ready immediately (non-blocking)
 */
export const isRecaptchaReady = (): boolean => {
  const grecaptcha = (window as any).grecaptcha;
  return !!(grecaptcha && grecaptcha.execute);
};

/**
 * Helper to ensure reCAPTCHA is loaded with reasonable timeout
 */
export const ensureRecaptchaLoaded = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already ready
    if (isRecaptchaReady()) {
      resolve(true);
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // 3 seconds max wait
    
    const checkRecaptcha = () => {
      attempts++;
      
      if (isRecaptchaReady()) {
        console.log(`✅ [RECAPTCHA] Loaded successfully after ${attempts * 100}ms`);
        resolve(true);
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.warn(`⚠️ [RECAPTCHA] Failed to load after ${maxAttempts * 100}ms, allowing app to continue`);
        resolve(false);
        return;
      }
      
      // Check again in 100ms
      setTimeout(checkRecaptcha, 100);
    };
    
    checkRecaptcha();
  });
};

/**
 * Initialize reCAPTCHA with improved error handling and faster timeout
 */
export const initializeRecaptcha = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (isRecaptchaReady()) {
      console.log('✅ [RECAPTCHA] Already initialized');
      resolve(true);
      return;
    }
    
    console.log('🚀 [RECAPTCHA] Initializing...');
    
    // Wait for reCAPTCHA to load with faster timeout
    ensureRecaptchaLoaded().then((loaded) => {
      if (loaded) {
        console.log('✅ [RECAPTCHA] Successfully initialized');
      } else {
        console.warn('⚠️ [RECAPTCHA] Failed to initialize, app will continue without reCAPTCHA');
      }
      resolve(loaded);
    });
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
      console.warn('❌ [RECAPTCHA] Not ready, attempting quick initialization...');
      const initialized = await ensureRecaptchaLoaded();
      if (!initialized) {
        console.error('❌ [RECAPTCHA] Quick initialization failed');
        return null;
      }
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
