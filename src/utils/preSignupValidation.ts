
import { supabase } from '@/integrations/supabase/client';

export interface PreSignupValidationResult {
  accountExists: boolean;
  isVerified: boolean;
  error?: string;
}

/**
 * Pre-signup validation to check if an account already exists
 * This uses a non-blocking approach to avoid performance issues
 */
export const validateEmailBeforeSignup = async (email: string): Promise<PreSignupValidationResult> => {
  try {
    console.log('🔍 [PRE-SIGNUP] Checking email existence for:', email);
    
    // Quick timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), 3000);
    });
    
    // Try a quick sign-in attempt to check if account exists
    const validationPromise = supabase.auth.signInWithPassword({
      email,
      password: 'invalid-password-for-validation-only'
    });
    
    const result = await Promise.race([validationPromise, timeoutPromise]);
    const { error } = result;
    
    if (error) {
      const errorMsg = error.message.toLowerCase();
      
      // Account exists but wrong password
      if (errorMsg.includes('invalid login') || 
          errorMsg.includes('invalid credentials') ||
          errorMsg.includes('wrong password')) {
        console.log('✅ [PRE-SIGNUP] Account exists (wrong password error)');
        return { accountExists: true, isVerified: true };
      }
      
      // Account exists but not verified
      if (errorMsg.includes('email not confirmed') || 
          errorMsg.includes('email confirmation')) {
        console.log('✅ [PRE-SIGNUP] Account exists (unverified)');
        return { accountExists: true, isVerified: false };
      }
      
      // No account found
      if (errorMsg.includes('user not found') || 
          errorMsg.includes('no user found')) {
        console.log('❌ [PRE-SIGNUP] No account found');
        return { accountExists: false, isVerified: false };
      }
    }
    
    // Fallback: assume no account exists if we can't determine
    console.log('⚠️ [PRE-SIGNUP] Could not determine account status, assuming no account');
    return { accountExists: false, isVerified: false };
    
  } catch (error) {
    console.log('⚠️ [PRE-SIGNUP] Validation failed, proceeding with signup:', error);
    // Fail open - allow signup attempt if validation fails
    return { accountExists: false, isVerified: false };
  }
};

/**
 * Enhanced pattern matching for existing account detection
 */
export const detectExistingAccountPatterns = (error: any, data: any): { exists: boolean; reason: string } => {
  console.log('🔍 [PATTERN-DETECTION] Analyzing signup response patterns');
  
  // Pattern 1: Explicit error messages
  if (error?.message) {
    const errorMsg = error.message.toLowerCase();
    const existingAccountKeywords = [
      'user_repeated_signup',
      'user already registered',
      'already been registered',
      'already exists',
      'email already in use',
      'user with this email already exists'
    ];
    
    for (const keyword of existingAccountKeywords) {
      if (errorMsg.includes(keyword)) {
        return { exists: true, reason: `Error message contains: ${keyword}` };
      }
    }
  }
  
  // Pattern 2: Successful response with user but no session
  if (!error && data?.user && !data?.session) {
    console.log('🔍 [PATTERN-DETECTION] User without session detected');
    
    // Check if user has confirmed email (strong indicator of existing account)
    if (data.user.email_confirmed_at) {
      return { exists: true, reason: 'User has confirmed email but no session' };
    }
    
    // Check creation time - if more than 30 seconds old, likely existing
    if (data.user.created_at) {
      const createdAt = new Date(data.user.created_at);
      const now = new Date();
      const ageInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
      
      if (ageInSeconds > 30) {
        return { exists: true, reason: `User created ${ageInSeconds}s ago, likely existing account` };
      }
    }
    
    // If we have a user ID that looks like it's not a new UUID pattern
    if (data.user.id) {
      console.log('🔍 [PATTERN-DETECTION] User ID present, checking patterns');
      // Additional heuristics could be added here
    }
  }
  
  // Pattern 3: Check metadata patterns
  if (data?.user?.user_metadata || data?.user?.app_metadata) {
    // If metadata is populated in a way that suggests existing account
    console.log('🔍 [PATTERN-DETECTION] Checking metadata patterns');
  }
  
  return { exists: false, reason: 'No existing account patterns detected' };
};
