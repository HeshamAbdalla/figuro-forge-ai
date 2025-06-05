
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
    
    // First, try to sign in with a dummy password to check if account exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password-check'
    });

    // If no error or specific error types, account likely exists
    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        // Account exists but password is wrong
        console.log('✅ [AUTH-VALIDATION] Account exists but credentials invalid');
        return {
          isValid: false,
          accountExists: true,
          needsVerification: false,
          error: 'An account with this email already exists. Please sign in instead.'
        };
      } else if (signInError.message.includes('Email not confirmed')) {
        // Account exists but needs verification
        console.log('📧 [AUTH-VALIDATION] Account exists but needs verification');
        return {
          isValid: false,
          accountExists: true,
          needsVerification: true,
          error: 'Your account exists but needs email verification. Please check your inbox or request a new verification email.'
        };
      }
    }

    // If sign in was successful, account definitely exists
    if (signInData.user) {
      console.log('✅ [AUTH-VALIDATION] Account exists and is verified');
      await supabase.auth.signOut(); // Clean up the test sign in
      return {
        isValid: false,
        accountExists: true,
        needsVerification: false,
        error: 'An account with this email already exists. Please sign in instead.'
      };
    }

    // Account likely doesn't exist, safe to proceed with signup
    console.log('🆕 [AUTH-VALIDATION] Email appears to be new, safe to sign up');
    return {
      isValid: true,
      accountExists: false,
      needsVerification: false
    };

  } catch (error: any) {
    console.error('❌ [AUTH-VALIDATION] Error during validation:', error);
    return {
      isValid: true, // Allow signup to proceed if validation fails
      accountExists: false,
      needsVerification: false
    };
  }
};

export const checkEmailVerificationStatus = async (email: string): Promise<boolean> => {
  try {
    // This is a simplified check - in a real app, you might want to use admin APIs
    // For now, we'll rely on the sign-in attempt method
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-check'
    });

    return !error?.message.includes('Email not confirmed');
  } catch (error) {
    console.error('Error checking email verification status:', error);
    return false;
  }
};
