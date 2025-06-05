
import { supabase } from '@/integrations/supabase/client';
import { validateEmailBeforeSignup, detectExistingAccountPatterns } from './preSignupValidation';
import { EmailVerificationEnforcer } from './emailVerificationEnforcer';

export interface SignupValidationResult {
  isValid: boolean;
  accountExists: boolean;
  needsVerification: boolean;
  requiresEmailVerification: boolean;
  allowAccess: boolean;
  error?: string;
}

// Enhanced detection for existing accounts based on Supabase response patterns
export const detectExistingAccountFromResponse = (error: any, data: any): boolean => {
  console.log('🔍 [AUTH-VALIDATION] Analyzing signup response for existing account detection');
  console.log('🔍 [AUTH-VALIDATION] Error:', error);
  console.log('🔍 [AUTH-VALIDATION] Data:', data);
  
  // Use the new pattern detection system
  const patternResult = detectExistingAccountPatterns(error, data);
  
  if (patternResult.exists) {
    console.log(`✅ [AUTH-VALIDATION] Existing account detected: ${patternResult.reason}`);
    return true;
  }
  
  console.log('❌ [AUTH-VALIDATION] No existing account detected');
  return false;
};

// Enhanced validation with comprehensive security checks
export const validateSignupAttempt = async (email: string): Promise<SignupValidationResult> => {
  console.log('🔍 [AUTH-VALIDATION] Starting comprehensive pre-signup validation for:', email);
  
  try {
    // Perform pre-signup validation
    const preValidation = await validateEmailBeforeSignup(email);
    
    if (preValidation.accountExists) {
      console.log('✅ [AUTH-VALIDATION] Pre-validation detected existing account');
      return {
        isValid: false,
        accountExists: true,
        needsVerification: !preValidation.isVerified,
        requiresEmailVerification: !preValidation.isVerified,
        allowAccess: false,
        error: preValidation.isVerified 
          ? 'Account already exists with this email' 
          : 'Account exists but needs email verification'
      };
    }
    
    console.log('✅ [AUTH-VALIDATION] Pre-validation passed, no existing account detected');
    return {
      isValid: true,
      accountExists: false,
      needsVerification: false,
      requiresEmailVerification: true, // Always require verification for new accounts
      allowAccess: false // No immediate access until verified
    };
    
  } catch (error) {
    console.log('⚠️ [AUTH-VALIDATION] Pre-validation failed, allowing signup attempt:', error);
    // Fail open - allow signup but require verification
    return {
      isValid: true,
      accountExists: false,
      needsVerification: false,
      requiresEmailVerification: true,
      allowAccess: false
    };
  }
};

/**
 * Enhanced post-signup validation with verification enforcement
 */
export const validateSignupResponse = async (data: any, error: any): Promise<SignupValidationResult> => {
  console.log('🔍 [AUTH-VALIDATION] Validating signup response with security enforcement');
  
  // Check for existing account patterns first
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

  // If we have a user but no session, verification is required
  if (data?.user && !data?.session) {
    console.log('📧 [AUTH-VALIDATION] User created, email verification required');
    return {
      isValid: true,
      accountExists: false,
      needsVerification: true,
      requiresEmailVerification: true,
      allowAccess: false
    };
  }

  // SECURITY ENFORCEMENT: Even if we get a session, enforce verification
  if (data?.user && data?.session) {
    console.log('🔒 [AUTH-VALIDATION] Session received, enforcing verification requirements');
    
    const enforcementResult = await EmailVerificationEnforcer.enforceVerification(
      data.user, 
      data.session
    );

    return {
      isValid: enforcementResult.allowAccess,
      accountExists: false,
      needsVerification: !enforcementResult.isVerified,
      requiresEmailVerification: enforcementResult.requiresVerification,
      allowAccess: enforcementResult.allowAccess,
      error: enforcementResult.error
    };
  }

  // Handle explicit errors
  if (error) {
    return {
      isValid: false,
      accountExists: false,
      needsVerification: false,
      requiresEmailVerification: false,
      allowAccess: false,
      error: error.message || 'Signup failed'
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
  try {
    const preValidation = await validateEmailBeforeSignup(email);
    return preValidation.isVerified;
  } catch (error) {
    console.log('⚠️ [AUTH-VALIDATION] Verification check failed:', error);
    return false;
  }
};
