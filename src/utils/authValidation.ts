
import { supabase } from '@/integrations/supabase/client';

export interface SignupValidationResult {
  isValid: boolean;
  accountExists: boolean;
  needsVerification: boolean;
  error?: string;
}

// Detect if the signup response indicates an existing account
export const detectExistingAccountFromResponse = (error: any, data: any): boolean => {
  // Check for the user_repeated_signup event in auth logs
  if (error?.message?.includes('user_repeated_signup') || 
      error?.message?.includes('User already registered') ||
      error?.message?.includes('already been registered')) {
    return true;
  }
  
  // Check if we got a user back but no session (could indicate existing unverified account)
  if (data?.user && !data?.session && data?.user?.email_confirmed_at === null) {
    return true;
  }
  
  return false;
};

// Simplified validation - we'll let Supabase handle the validation directly
export const validateSignupAttempt = async (email: string): Promise<SignupValidationResult> => {
  console.log('🔍 [AUTH-VALIDATION] Skipping pre-validation, letting Supabase handle signup directly');
  
  return {
    isValid: true,
    accountExists: false,
    needsVerification: false
  };
};

export const checkEmailVerificationStatus = async (email: string): Promise<boolean> => {
  // Simplified - just return true since we'll handle verification in the main flow
  return true;
};
