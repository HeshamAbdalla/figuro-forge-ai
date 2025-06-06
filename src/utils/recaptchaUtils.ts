
/**
 * Google reCAPTCHA v3 utilities
 * Handles token generation and validation for security enforcement
 */

import { securityManager } from "./securityUtils";

// reCAPTCHA site key - for production this should come from environment variables
const RECAPTCHA_SITE_KEY = "6LezjlcrAAAAAK7x2og5wsiROqcf_bwkbQG6a-Wx";

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
    console.log(`✅ [RECAPTCHA] Token generated for ${action}`);
    
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
 * Client-side validation of a reCAPTCHA token
 * Note: This should be paired with server-side validation for security
 * 
 * @param token The reCAPTCHA token to validate
 * @param expectedAction The action that should be embedded in the token
 * @param minimumScore The minimum acceptable score (0.0 to 1.0)
 * @returns Validation result
 */
export const validateRecaptchaClientSide = async (
  token: string | null, 
  expectedAction: ReCaptchaAction,
  minimumScore: number = 0.5
): Promise<RecaptchaValidationResult> => {
  try {
    // If no token, fail early
    if (!token) {
      return { 
        success: false, 
        error: 'No reCAPTCHA token provided' 
      };
    }
    
    // In a production app, this should be validated server-side
    // For a complete implementation, this would call a server endpoint
    
    // For demonstration purposes, we'll implement a minimal check
    // that ensures the token is present and has the expected format
    if (token.length < 20) {
      return {
        success: false,
        error: 'Invalid token format'
      };
    }
    
    // For now, we'll simulate a successful verification
    // In production, this should be replaced with server-side verification
    const mockResult: RecaptchaValidationResult = {
      success: true,
      score: 0.9,
      action: expectedAction,
      hostname: window.location.hostname
    };
    
    // In production, verify the score against the minimum
    if (mockResult.score && mockResult.score < minimumScore) {
      return {
        success: false,
        score: mockResult.score,
        error: 'reCAPTCHA score too low'
      };
    }
    
    // In production, verify the action matches
    if (mockResult.action !== expectedAction) {
      return {
        success: false,
        action: mockResult.action,
        error: 'reCAPTCHA action mismatch'
      };
    }
    
    return mockResult;
    
  } catch (error) {
    console.error('❌ [RECAPTCHA] Validation error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
};

/**
 * Enhanced auth request with reCAPTCHA
 * Adds a token to auth requests
 */
export const withRecaptcha = async <T extends object>(
  action: ReCaptchaAction,
  authFunction: (params: T) => Promise<any>,
  params: T
): Promise<any> => {
  try {
    // Get reCAPTCHA token
    const token = await executeRecaptcha(action);
    
    // Validate the token client-side (minimal check)
    const validation = await validateRecaptchaClientSide(token, action);
    
    if (!validation.success) {
      console.error('❌ [RECAPTCHA] Client-side validation failed:', validation.error);
      throw new Error(`Security check failed: ${validation.error || 'Unknown error'}`);
    }
    
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

// Helper to ensure reCAPTCHA is loaded
export const ensureRecaptchaLoaded = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const checkRecaptcha = () => {
      const grecaptcha = (window as any).grecaptcha;
      if (grecaptcha && grecaptcha.execute) {
        resolve(true);
        return;
      }
      
      // Check again in 100ms
      setTimeout(checkRecaptcha, 100);
    };
    
    checkRecaptcha();
  });
};
