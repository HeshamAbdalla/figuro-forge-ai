import { supabase } from '@/integrations/supabase/client';

export interface SignupValidationResult {
  isValid: boolean;
  accountExists: boolean;
  needsVerification: boolean;
  error?: string;
}

export const validateSignupAttempt = async (email: string): Promise<SignupValidationResult> => {
  try {
    console.log('🔍 [AUTH-VALIDATION] Checking email status for:', email);
    
    // Simple password reset check to see if account exists
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/studio`
    });

    if (!resetError) {
      // Password reset succeeded, account exists
      console.log('👤 [AUTH-VALIDATION] Account exists (password reset succeeded)');
      return {
        isValid: false,
        accountExists: true,
        needsVerification: false,
        error: 'An account with this email already exists. Please sign in instead.'
      };
    } else if (resetError.message.includes('user not found') || 
               resetError.message.includes('email not found') ||
               resetError.message.includes('User not found')) {
      // Account doesn't exist, safe to proceed with signup
      console.log('✅ [AUTH-VALIDATION] Email is available for signup');
      return {
        isValid: true,
        accountExists: false,
        needsVerification: false
      };
    } else {
      // Other errors (rate limits, etc.) - allow signup to proceed to avoid blocking users
      console.log('⚠️ [AUTH-VALIDATION] Password reset error, allowing signup to proceed:', resetError.message);
      return {
        isValid: true,
        accountExists: false,
        needsVerification: false
      };
    }

  } catch (error: any) {
    console.error('❌ [AUTH-VALIDATION] Error during validation:', error);
    // On any validation error, allow signup to proceed to avoid blocking users
    return {
      isValid: true,
      accountExists: false,
      needsVerification: false
    };
  }
};

export const checkEmailVerificationStatus = async (email: string): Promise<boolean> => {
  // Simplified - just return true since we'll handle verification in the main flow
  return true;
};
