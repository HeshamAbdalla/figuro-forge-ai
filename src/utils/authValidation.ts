
import { supabase } from '@/integrations/supabase/client';

export interface SignupValidationResult {
  isValid: boolean;
  accountExists: boolean;
  needsVerification: boolean;
  error?: string;
}

// Enhanced detection for existing accounts based on Supabase response patterns
export const detectExistingAccountFromResponse = (error: any, data: any): boolean => {
  console.log('🔍 [AUTH-VALIDATION] Analyzing signup response for existing account detection');
  console.log('🔍 [AUTH-VALIDATION] Error:', error);
  console.log('🔍 [AUTH-VALIDATION] Data:', data);
  
  // Check for explicit error messages about existing accounts
  if (error?.message) {
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('user_repeated_signup') || 
        errorMsg.includes('user already registered') ||
        errorMsg.includes('already been registered') ||
        errorMsg.includes('already exists')) {
      console.log('✅ [AUTH-VALIDATION] Existing account detected via error message');
      return true;
    }
  }
  
  // Key pattern: successful response with user but no session + user has email_confirmed_at
  // This typically indicates an existing verified account
  if (!error && data?.user && !data?.session) {
    console.log('🔍 [AUTH-VALIDATION] No error, user exists, no session - checking user details');
    console.log('🔍 [AUTH-VALIDATION] User email_confirmed_at:', data.user.email_confirmed_at);
    console.log('🔍 [AUTH-VALIDATION] User created_at:', data.user.created_at);
    
    // If user has email_confirmed_at, it's likely an existing verified account
    if (data.user.email_confirmed_at) {
      console.log('✅ [AUTH-VALIDATION] Existing verified account detected');
      return true;
    }
    
    // Additional check: if created_at is very recent (within last few seconds), 
    // it might be a new account needing verification
    if (data.user.created_at) {
      const createdAt = new Date(data.user.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - createdAt.getTime();
      
      // If account was created more than 10 seconds ago, it's likely existing
      if (timeDiff > 10000) {
        console.log('✅ [AUTH-VALIDATION] Existing account detected based on creation time');
        return true;
      }
    }
  }
  
  console.log('❌ [AUTH-VALIDATION] No existing account detected');
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
