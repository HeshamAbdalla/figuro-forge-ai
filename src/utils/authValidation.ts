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
    
    // Try to sign in with a dummy password to check account status
    // This is safer than creating dummy signup attempts
    const { error: signinError } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-validation-check-12345678'
    });

    // Analyze the signin error to determine account status
    if (!signinError) {
      // This shouldn't happen with a dummy password, but if it does, account exists and is verified
      console.log('🤔 [AUTH-VALIDATION] Unexpected successful signin with dummy password');
      return {
        isValid: false,
        accountExists: true,
        needsVerification: false,
        error: 'An account with this email already exists. Please sign in instead.'
      };
    }

    const errorMessage = signinError.message.toLowerCase();
    console.log('📧 [AUTH-VALIDATION] Signin error:', errorMessage);

    // Check for different error types
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid credentials')) {
      // This could mean either:
      // 1. Account exists but wrong password (expected for our dummy password)
      // 2. Account doesn't exist
      // We need to differentiate by trying a password reset
      
      console.log('🔍 [AUTH-VALIDATION] Checking if account exists via password reset');
      
      // Try password reset to see if account exists
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/studio`
      });

      if (!resetError) {
        // Password reset succeeded, account exists and is verified
        console.log('👤 [AUTH-VALIDATION] Account exists and is verified');
        return {
          isValid: false,
          accountExists: true,
          needsVerification: false,
          error: 'An account with this email already exists. Please sign in instead.'
        };
      } else if (resetError.message.includes('user not found') || 
                 resetError.message.includes('email not found')) {
        // Account doesn't exist, safe to proceed with signup
        console.log('✅ [AUTH-VALIDATION] Email is available for signup');
        return {
          isValid: true,
          accountExists: false,
          needsVerification: false
        };
      } else {
        // Other error, assume account might exist but be safe
        console.log('⚠️ [AUTH-VALIDATION] Password reset error, assuming account exists:', resetError.message);
        return {
          isValid: false,
          accountExists: true,
          needsVerification: false,
          error: 'Unable to validate email. Please try signing in if you have an account.'
        };
      }
    } else if (errorMessage.includes('email not confirmed') || 
               errorMessage.includes('email confirmation')) {
      // Account exists but needs verification
      console.log('📧 [AUTH-VALIDATION] Account exists but needs verification');
      return {
        isValid: false,
        accountExists: true,
        needsVerification: true,
        error: 'Your account exists but needs email verification. Please check your inbox or request a new verification email.'
      };
    } else if (errorMessage.includes('rate limit') || 
               errorMessage.includes('too many')) {
      // Rate limited, allow signup to proceed
      console.log('⏳ [AUTH-VALIDATION] Rate limited, allowing signup to proceed');
      return {
        isValid: true,
        accountExists: false,
        needsVerification: false
      };
    } else {
      // Unknown error, be conservative and allow signup
      console.log('🤷 [AUTH-VALIDATION] Unknown error, allowing signup to proceed:', errorMessage);
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
  try {
    console.log('🔍 [AUTH-VALIDATION] Checking verification status for:', email);
    
    // Try to sign in to check verification status
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-verification-check'
    });

    // If the error is about email not being confirmed, return false
    if (error?.message.includes('Email not confirmed')) {
      console.log('📧 [AUTH-VALIDATION] Email not confirmed');
      return false;
    }
    
    // For any other error (including invalid credentials), assume email is confirmed
    // because the error would be different if the email wasn't confirmed
    console.log('✅ [AUTH-VALIDATION] Email appears to be confirmed');
    return true;
    
  } catch (error) {
    console.error('❌ [AUTH-VALIDATION] Error checking email verification status:', error);
    // On error, assume email is confirmed to avoid blocking users
    return true;
  }
};
