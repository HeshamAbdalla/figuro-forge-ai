
/**
 * Google reCAPTCHA v3 utilities
 * Handles token generation and validation for security enforcement
 */

import { securityManager } from "./securityUtils";
import { supabase } from "@/integrations/supabase/client";

// reCAPTCHA site key - matches the one in index.html
const RECAPTCHA_SITE_KEY = "6Le5lFcrAAAAAOySTtpVoOrDH7EQx8pQiLFq5pRT";

// Action types for reCAPTCHA
export type ReCaptchaAction = 
  | "signup" 
  | "login" 
  | "password_reset" 
  | "email_verification"
  | "contact_form";

interface RecaptchaValidationResult {
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  error?: string;
}

/**
 * Executes reCAPTCHA and returns a token
 * @param action The action being performed
 * @returns Promise with token string or error
 */
export const executeRecaptcha = async (action: ReCaptchaAction): Promise<string | null> => {
  try {
    console.log(`🤖 [RECAPTCHA] Executing reCAPTCHA for action: ${action}`);
    
    // Access the grecaptcha object from the global scope
    const grecaptcha = (window as any).grecaptcha;
    
    if (!grecaptcha || !grecaptcha.execute) {
      console.error('❌ [RECAPTCHA] reCAPTCHA not loaded properly');
      return null;
    }
    
    // Execute reCAPTCHA with our site key
    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    console.log(`✅ [RECAPTCHA] Token generated for ${action}, length: ${token.length}`);
    
    // Log the security event (non-blocking)
    securityManager.logSecurityEvent({
      event_type: 'recaptcha_executed',
      event_details: { action, token_length: token.length },
      success: true
    });
    
    return token;
  } catch (error) {
    console.error('❌ [RECAPTCHA] Error executing reCAPTCHA:', error);
    
    // Log the security event (non-blocking)
    securityManager.logSecurityEvent({
      event_type: 'recaptcha_error',
      event_details: { action, error: error instanceof Error ? error.message : 'Unknown error' },
      success: false
    });
    
    return null;
  }
};

/**
 * Server-side validation of a reCAPTCHA token using Supabase Edge Function
 * 
 * @param token The reCAPTCHA token to validate
 * @param expectedAction The action that should be embedded in the token
 * @param minimumScore The minimum acceptable score (0.0 to 1.0)
 * @returns Validation result
 */
export const validateRecaptchaServerSide = async (
  token: string | null, 
  expectedAction: ReCaptchaAction,
  minimumScore: number = 0.5
): Promise<RecaptchaValidationResult> => {
  try {
    console.log(`🔍 [RECAPTCHA] Server-side validation for action: ${expectedAction}`);
    
    // If no token, fail early
    if (!token) {
      return { 
        success: false, 
        error: 'No reCAPTCHA token provided' 
      };
    }
    
    // Call the Supabase Edge Function for verification
    const { data, error } = await supabase.functions.invoke('verify-recaptcha', {
      body: {
        token,
        action: expectedAction,
        minScore: minimumScore
      }
    });
    
    if (error) {
      console.error('❌ [RECAPTCHA] Server validation error:', error);
      return {
        success: false,
        error: 'Server validation failed'
      };
    }
    
    console.log('✅ [RECAPTCHA] Server validation result:', data);
    
    return {
      success: data.success,
      score: data.score,
      action: data.action,
      hostname: data.hostname,
      error: data.success ? undefined : 'Validation failed'
    };
    
  } catch (error) {
    console.error('❌ [RECAPTCHA] Validation exception:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
};

/**
 * Enhanced auth request with reCAPTCHA
 * Adds a token to auth requests and validates server-side
 */
export const withRecaptcha = async <T extends object>(
  action: ReCaptchaAction,
  authFunction: (params: T) => Promise<any>,
  params: T
): Promise<any> => {
  try {
    console.log(`🔐 [RECAPTCHA] Enhanced auth with action: ${action}`);
    
    // Get reCAPTCHA token
    const token = await executeRecaptcha(action);
    
    if (!token) {
      throw new Error('Failed to generate reCAPTCHA token');
    }
    
    // Validate the token server-side
    const validation = await validateRecaptchaServerSide(token, action);
    
    if (!validation.success) {
      console.error('❌ [RECAPTCHA] Server-side validation failed:', validation.error);
      throw new Error(`Security verification failed: ${validation.error || 'Unknown error'}`);
    }
    
    console.log(`✅ [RECAPTCHA] Validation passed with score: ${validation.score}`);
    
    // Include the token in auth request
    const enhancedParams = {
      ...params,
      options: {
        ...(params as any).options,
        captchaToken: token
      }
    };
    
    // Execute the auth function with the enhanced params
    return await authFunction(enhancedParams as T);
    
  } catch (error) {
    console.error('❌ [RECAPTCHA] Auth with reCAPTCHA failed:', error);
    throw error;
  }
};

// Helper to ensure reCAPTCHA is loaded with timeout
export const ensureRecaptchaLoaded = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkRecaptcha = () => {
      attempts++;
      const grecaptcha = (window as any).grecaptcha;
      
      if (grecaptcha && grecaptcha.execute) {
        console.log(`✅ [RECAPTCHA] Loaded successfully after ${attempts} attempts`);
        resolve(true);
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.error(`❌ [RECAPTCHA] Failed to load after ${maxAttempts} attempts`);
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
 * Checks if reCAPTCHA is ready immediately (non-blocking)
 */
export const isRecaptchaReady = (): boolean => {
  const grecaptcha = (window as any).grecaptcha;
  return !!(grecaptcha && grecaptcha.execute);
};

/**
 * Initialize reCAPTCHA with proper error handling
 */
export const initializeRecaptcha = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (isRecaptchaReady()) {
      resolve(true);
      return;
    }
    
    // Wait for reCAPTCHA to load
    ensureRecaptchaLoaded().then(resolve);
  });
};
