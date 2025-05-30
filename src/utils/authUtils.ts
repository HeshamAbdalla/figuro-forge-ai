
/**
 * Clean up all Supabase auth-related state from storage
 * This helps prevent "limbo" states when switching accounts or sessions
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Also clean sessionStorage if in use
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

/**
 * Clear rate limits for debugging purposes
 */
export const clearAuthRateLimits = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.rpc('clear_rate_limits_for_endpoint', {
      p_endpoint: 'auth_signin'
    });
    console.log('✅ [AUTH-UTILS] Rate limits cleared for auth_signin');
  } catch (error) {
    console.error('❌ [AUTH-UTILS] Failed to clear rate limits:', error);
  }
};

/**
 * Simplified rate limit check that fails open
 */
export const checkRateLimitSafe = async (endpoint: string): Promise<boolean> => {
  try {
    console.log(`🔍 [AUTH-UTILS] Quick rate limit check for ${endpoint}...`);
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Very short timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Rate limit timeout')), 1000);
    });
    
    const checkPromise = supabase.rpc('check_rate_limit', {
      p_user_id: null,
      p_ip_address: null,
      p_endpoint: endpoint,
      p_limit: 50, // More lenient limit
      p_window_minutes: 15
    });
    
    const result = await Promise.race([checkPromise, timeoutPromise]);
    const { data, error } = result;
    
    if (error) {
      console.log('⚠️ [AUTH-UTILS] Rate limit check failed, allowing:', error.message);
      return true; // Fail open
    }
    
    const canProceed = data === true;
    console.log(`${canProceed ? '✅' : '⚠️'} [AUTH-UTILS] Rate limit result:`, canProceed);
    return canProceed;
    
  } catch (error) {
    console.log('⚠️ [AUTH-UTILS] Rate limit check error, allowing:', error instanceof Error ? error.message : 'Unknown');
    return true; // Always fail open to prevent blocking
  }
};

/**
 * Parse authentication errors and return user-friendly messages
 */
export const getAuthErrorMessage = (error: any): string => {
  const errorMessage = error?.message || error?.error_description || String(error);
  
  // Handle rate limiting errors specifically
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return 'Too many sign-in attempts. Please wait a few minutes before trying again.';
  }
  
  // Handle common auth error scenarios
  if (errorMessage.includes('Email not confirmed')) {
    return 'Please verify your email before signing in. Check your inbox for the verification link.';
  }
  
  if (errorMessage.includes('Invalid login')) {
    return 'Invalid email or password. Please try again.';
  }

  if (errorMessage.includes('Email already registered')) {
    return 'This email is already registered. Please sign in instead.';
  }

  if (errorMessage.includes('Password should be')) {
    return 'Password should be at least 6 characters long.';
  }

  if (errorMessage.includes('Invalid email format')) {
    return 'Please enter a valid email address.';
  }
  
  // Return the original error if no specific handling
  return errorMessage;
};

/**
 * Check if an error is related to email verification
 */
export const isEmailVerificationError = (error: string): boolean => {
  return error.includes('verify your email') || 
         error.includes('Email not confirmed') || 
         error.includes('confirmation');
};

/**
 * Check if an error is related to rate limiting
 */
export const isRateLimitError = (error: string): boolean => {
  return error.includes('rate limit') || 
         error.includes('too many') ||
         error.includes('Too many sign in attempts');
};
