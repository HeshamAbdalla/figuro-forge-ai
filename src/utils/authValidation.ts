
import { supabase } from '@/integrations/supabase/client';
import { EmailVerificationEnforcer } from './emailVerificationEnforcer';

export interface SignupValidationResult {
  isValid: boolean;
  accountExists: boolean;
  needsVerification: boolean;
  requiresEmailVerification: boolean;
  allowAccess: boolean;
  error?: string;
}

/**
 * Improved pattern detection for existing accounts - more conservative approach
 */
export const detectExistingAccountFromResponse = (error: any, data: any): boolean => {
  console.log('🔍 [AUTH-VALIDATION] Analyzing signup response for existing account detection');
  console.log('🔍 [AUTH-VALIDATION] Error:', error);
  console.log('🔍 [AUTH-VALIDATION] Data:', data);
  
  // Only detect existing accounts from EXPLICIT error messages
  if (error?.message) {
    const errorMsg = error.message.toLowerCase();
    const explicitExistingAccountKeywords = [
      'user already registered',
      'already been registered', 
      'email already in use',
      'user with this email already exists'
    ];
    
    for (const keyword of explicitExistingAccountKeywords) {
      if (errorMsg.includes(keyword)) {
        console.log(`✅ [AUTH-VALIDATION] Existing account detected: ${keyword}`);
        return true;
      }
    }
  }
  
  console.log('❌ [AUTH-VALIDATION] No existing account detected');
  return false;
};

/**
 * Simplified signup validation - no pre-flight checks
 */
export const validateSignupAttempt = async (email: string): Promise<SignupValidationResult> => {
  console.log('🔍 [AUTH-VALIDATION] Simplified signup validation for:', email);
  
  // No pre-validation - just allow the signup attempt
  // Supabase will handle duplicate detection properly
  return {
    isValid: true,
    accountExists: false,
    needsVerification: false,
    requiresEmailVerification: true,
    allowAccess: false
  };
};

/**
 * Simplified post-signup validation 
 */
export const validateSignupResponse = async (data: any, error: any): Promise<SignupValidationResult> => {
  console.log('🔍 [AUTH-VALIDATION] Validating signup response');
  
  // Check for existing account patterns first (but be conservative)
  const accountExists = detectExistingAccountFromResponse(error, data);
  
  if (accountExists) {
    return {
      isValid: false,
      accountExists: true,
      needsVerification: true,
      requiresEmailVerification: true,
      allowAccess: false,
      error: 'Account already exists with this email'
    };
  }

  // Handle explicit signup errors
  if (error) {
    console.log('❌ [AUTH-VALIDATION] Signup error:', error);
    return {
      isValid: false,
      accountExists: false,
      needsVerification: false,
      requiresEmailVerification: false,
      allowAccess: false,
      error: error.message || 'Signup failed'
    };
  }

  // Success case - user created, may need verification
  if (data?.user) {
    console.log('✅ [AUTH-VALIDATION] User created successfully');
    
    // Check if we have a session (immediate login) or need verification
    const hasSession = !!data?.session;
    const isEmailConfirmed = !!data.user.email_confirmed_at;
    
    if (hasSession && isEmailConfirmed) {
      // User can access immediately
      return {
        isValid: true,
        accountExists: false,
        needsVerification: false,
        requiresEmailVerification: false,
        allowAccess: true
      };
    }
    
    // User created but needs verification
    return {
      isValid: true,
      accountExists: false,
      needsVerification: !isEmailConfirmed,
      requiresEmailVerification: !isEmailConfirmed,
      allowAccess: false
    };
  }

  // Default case - require verification
  return {
    isValid: true,
    accountExists: false,
    needsVerification: true,
    requiresEmailVerification: true,
    allowAccess: false
  };
};

export const checkEmailVerificationStatus = async (email: string): Promise<boolean> => {
  // Remove this check - it was causing false positives
  console.log('⚠️ [AUTH-VALIDATION] Email verification check disabled to prevent false positives');
  return false;
};
