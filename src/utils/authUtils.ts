
import { supabase } from '@/integrations/supabase/client';

/**
 * Comprehensive auth cleanup utility to prevent auth limbo states
 * Clears all Supabase auth keys from storage
 */
export const cleanupAuthState = () => {
  try {
    console.log("🧹 [AUTH-UTILS] Cleaning up auth state");
    
    // Remove all Supabase auth-related items from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || 
          key.includes('sb-') ||
          key === 'figuro_remember_me') {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if used
    try {
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Ignore sessionStorage errors (may not be available in some contexts)
    }
    
  } catch (error) {
    console.error('❌ [AUTH-UTILS] Error during auth state cleanup:', error);
  }
};

/**
 * Format auth error messages to be more user-friendly
 */
export const getAuthErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  const errorMessage = error.message || error.toString();
  const lowerMessage = errorMessage.toLowerCase();
  
  // Handle email verification errors
  if (lowerMessage.includes('email not confirmed') || 
      lowerMessage.includes('email verification')) {
    return 'Please verify your email address before signing in.';
  }
  
  // Handle invalid credentials
  if (lowerMessage.includes('invalid login') || 
      lowerMessage.includes('invalid credentials') ||
      lowerMessage.includes('incorrect username or password')) {
    return 'Invalid email or password.';
  }
  
  // Handle rate limiting
  if (lowerMessage.includes('too many requests') ||
      lowerMessage.includes('rate limit') ||
      lowerMessage.includes('too many attempts')) {
    return 'Too many login attempts. Please try again later.';
  }
  
  // Handle reCAPTCHA errors
  if (lowerMessage.includes('recaptcha') ||
      lowerMessage.includes('security check') ||
      lowerMessage.includes('captcha')) {
    return 'Security verification failed. Please try again.';
  }
  
  // Handle user not found
  if (lowerMessage.includes('user not found')) {
    return 'No account found with this email address.';
  }
  
  // Handle existing account
  if (lowerMessage.includes('already registered') || 
      lowerMessage.includes('already exists') ||
      lowerMessage.includes('email already')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  
  // Weak password
  if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
    return 'Please choose a stronger password.';
  }
  
  // General network/server errors
  if (lowerMessage.includes('network') || 
      lowerMessage.includes('connection') ||
      lowerMessage.includes('timeout')) {
    return 'Connection error. Please check your internet and try again.';
  }
  
  // Default case - pass through cleaned up error message
  return errorMessage.replace('AuthApiError: ', '')
                    .replace('AuthError: ', '')
                    .replace('Error: ', '');
};

/**
 * Check if error message indicates an email verification issue
 */
export const isEmailVerificationError = (error: string): boolean => {
  if (!error) return false;
  
  const lowerError = error.toLowerCase();
  return lowerError.includes('email not confirmed') || 
         lowerError.includes('verify your email') ||
         lowerError.includes('email verification');
};

/**
 * Check if error message indicates rate limiting
 */
export const isRateLimitError = (error: string): boolean => {
  if (!error) return false;
  
  const lowerError = error.toLowerCase();
  return lowerError.includes('too many requests') || 
         lowerError.includes('rate limit') ||
         lowerError.includes('too many attempts');
};

/**
 * Check if error indicates existing account
 */
export const isExistingAccountError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMsg = typeof error === 'string' 
    ? error.toLowerCase() 
    : (error.message || '').toLowerCase();
  
  return errorMsg.includes('already registered') || 
         errorMsg.includes('already been registered') ||
         errorMsg.includes('already exists') ||
         errorMsg.includes('email already in use');
};

/**
 * Safe rate limit checking with fallback
 */
export const checkRateLimitSafe = async (endpoint: string): Promise<boolean> => {
  try {
    const { data } = await supabase.rpc('check_rate_limit', { 
      p_user_id: null,
      p_ip_address: null,
      p_endpoint: endpoint,
      p_limit: 10,
      p_window_minutes: 5
    });
    
    return data === true;
  } catch (error) {
    console.log("⚠️ [AUTH-UTILS] Rate limit check failed, allowing:", error);
    return true; // Fail open if check fails
  }
};

/**
 * Reset auth rate limits for testing
 */
export const clearAuthRateLimits = async (): Promise<void> => {
  try {
    await supabase.rpc('clear_rate_limits_for_endpoint', { p_endpoint: 'auth_signin' });
    await supabase.rpc('clear_rate_limits_for_endpoint', { p_endpoint: 'auth_signup' });
    console.log("✅ [AUTH-UTILS] Auth rate limits cleared");
  } catch (error) {
    console.error('❌ [AUTH-UTILS] Failed to clear rate limits:', error);
    throw error;
  }
};
