
import { supabase } from '@/integrations/supabase/client';
import { validateEmailBeforeSignup, detectExistingAccountPatterns } from './preSignupValidation';

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
  
  // Use the new pattern detection system
  const patternResult = detectExistingAccountPatterns(error, data);
  
  if (patternResult.exists) {
    console.log(`✅ [AUTH-VALIDATION] Existing account detected: ${patternResult.reason}`);
    return true;
  }
  
  console.log('❌ [AUTH-VALIDATION] No existing account detected');
  return false;
};

// Enhanced validation with pre-signup check
export const validateSignupAttempt = async (email: string): Promise<SignupValidationResult> => {
  console.log('🔍 [AUTH-VALIDATION] Starting pre-signup validation for:', email);
  
  try {
    // Perform pre-signup validation
    const preValidation = await validateEmailBeforeSignup(email);
    
    if (preValidation.accountExists) {
      console.log('✅ [AUTH-VALIDATION] Pre-validation detected existing account');
      return {
        isValid: false,
        accountExists: true,
        needsVerification: !preValidation.isVerified,
        error: preValidation.isVerified 
          ? 'Account already exists with this email' 
          : 'Account exists but needs email verification'
      };
    }
    
    console.log('✅ [AUTH-VALIDATION] Pre-validation passed, no existing account detected');
    return {
      isValid: true,
      accountExists: false,
      needsVerification: false
    };
    
  } catch (error) {
    console.log('⚠️ [AUTH-VALIDATION] Pre-validation failed, allowing signup attempt:', error);
    // Fail open - allow signup if pre-validation fails
    return {
      isValid: true,
      accountExists: false,
      needsVerification: false
    };
  }
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
