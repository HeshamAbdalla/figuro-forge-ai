
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
    
    // First, attempt a signup with a dummy password to see what happens
    // This is safer than trying to sign in with dummy credentials
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password: 'temp-validation-password-123456', // Temporary password for validation
      options: {
        data: { validation_check: true } // Mark this as a validation attempt
      }
    });

    // If signup was successful or resulted in email confirmation needed, email is available
    if (!signupError) {
      console.log('✅ [AUTH-VALIDATION] Email is available for signup');
      
      // Clean up the validation attempt by signing out immediately
      if (signupData.user && signupData.session) {
        await supabase.auth.signOut();
      }
      
      return {
        isValid: true,
        accountExists: false,
        needsVerification: false
      };
    }

    // Handle specific signup errors
    if (signupError) {
      console.log('📧 [AUTH-VALIDATION] Signup error:', signupError.message);
      
      // User already registered error - account exists
      if (signupError.message.includes('User already registered') || 
          signupError.message.includes('already been registered')) {
        console.log('👤 [AUTH-VALIDATION] Account already exists');
        
        // Try to determine if the account needs verification by attempting sign-in
        try {
          const { error: signinError } = await supabase.auth.signInWithPassword({
            email,
            password: 'dummy-check-verification'
          });
          
          if (signinError?.message.includes('Email not confirmed')) {
            console.log('📧 [AUTH-VALIDATION] Account exists but needs verification');
            return {
              isValid: false,
              accountExists: true,
              needsVerification: true,
              error: 'Your account exists but needs email verification. Please check your inbox or request a new verification email.'
            };
          }
        } catch (e) {
          // If verification check fails, assume account exists but is verified
          console.log('⚠️ [AUTH-VALIDATION] Could not check verification status');
        }
        
        return {
          isValid: false,
          accountExists: true,
          needsVerification: false,
          error: 'An account with this email already exists. Please sign in instead.'
        };
      }
      
      // Email rate limit or other service errors
      if (signupError.message.includes('rate limit') || 
          signupError.message.includes('too many requests')) {
        console.log('⏳ [AUTH-VALIDATION] Rate limited');
        return {
          isValid: true, // Allow signup to proceed, let the actual signup handle the rate limit
          accountExists: false,
          needsVerification: false
        };
      }
      
      // For other errors, log them but allow signup to proceed
      console.log('⚠️ [AUTH-VALIDATION] Unknown signup error, allowing signup to proceed:', signupError.message);
      return {
        isValid: true,
        accountExists: false,
        needsVerification: false
      };
    }

    // Fallback - should not reach here
    console.log('🤔 [AUTH-VALIDATION] Unexpected validation state, allowing signup');
    return {
      isValid: true,
      accountExists: false,
      needsVerification: false
    };

  } catch (error: any) {
    console.error('❌ [AUTH-VALIDATION] Error during validation:', error);
    // On any validation error, allow signup to proceed
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
