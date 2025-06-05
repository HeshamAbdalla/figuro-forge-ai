
import { supabase } from '@/integrations/supabase/client';

export interface PreSignupValidationResult {
  accountExists: boolean;
  isVerified: boolean;
  error?: string;
}

/**
 * Enhanced pre-signup validation to check if an account already exists
 * This uses a more comprehensive approach with better security
 */
export const validateEmailBeforeSignup = async (email: string): Promise<PreSignupValidationResult> => {
  try {
    console.log('🔍 [PRE-SIGNUP] Starting enhanced email existence check for:', email);
    
    // Quick timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), 2000);
    });
    
    // Try a sign-in attempt with invalid password to check account existence
    const validationPromise = supabase.auth.signInWithPassword({
      email,
      password: 'invalid-test-password-' + Math.random()
    });
    
    const result = await Promise.race([validationPromise, timeoutPromise]);
    const { error } = result;
    
    if (error) {
      const errorMsg = error.message.toLowerCase();
      
      // Account exists but wrong password (verified account)
      if (errorMsg.includes('invalid login') || 
          errorMsg.includes('invalid credentials') ||
          errorMsg.includes('wrong password')) {
        console.log('✅ [PRE-SIGNUP] Verified account exists (wrong password error)');
        return { accountExists: true, isVerified: true };
      }
      
      // Account exists but not verified
      if (errorMsg.includes('email not confirmed') || 
          errorMsg.includes('email confirmation') ||
          errorMsg.includes('verify your email')) {
        console.log('⚠️ [PRE-SIGNUP] Unverified account exists');
        return { accountExists: true, isVerified: false };
      }
      
      // No account found
      if (errorMsg.includes('user not found') || 
          errorMsg.includes('no user found') ||
          errorMsg.includes('invalid email')) {
        console.log('❌ [PRE-SIGNUP] No account found');
        return { accountExists: false, isVerified: false };
      }

      // Rate limiting or other errors
      if (errorMsg.includes('rate') || errorMsg.includes('too many')) {
        console.log('⚠️ [PRE-SIGNUP] Rate limited, assuming no account');
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
 * Enhanced pattern matching for existing account detection with better security
 */
export const detectExistingAccountPatterns = (error: any, data: any): { exists: boolean; reason: string } => {
  console.log('🔍 [PATTERN-DETECTION] Analyzing signup response patterns with enhanced security');
  
  // Pattern 1: Explicit error messages indicating existing account
  if (error?.message) {
    const errorMsg = error.message.toLowerCase();
    const existingAccountKeywords = [
      'user_repeated_signup',
      'user already registered',
      'already been registered',
      'already exists',
      'email already in use',
      'user with this email already exists',
      'signup_disabled_for_email'
    ];
    
    for (const keyword of existingAccountKeywords) {
      if (errorMsg.includes(keyword)) {
        return { exists: true, reason: `Error message contains: ${keyword}` };
      }
    }
  }
  
  // Pattern 2: User returned but no session (potential security bypass attempt)
  if (!error && data?.user && !data?.session) {
    console.log('🔍 [PATTERN-DETECTION] User without session detected - checking verification');
    
    // If user has confirmed email, this indicates existing account
    if (data.user.email_confirmed_at) {
      return { exists: true, reason: 'User has confirmed email but no session' };
    }
    
    // Check creation time - if older than expected, likely existing
    if (data.user.created_at) {
      const createdAt = new Date(data.user.created_at);
      const now = new Date();
      const ageInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
      
      // If user was created more than 5 minutes ago, likely existing
      if (ageInSeconds > 300) {
        return { exists: true, reason: `User created ${Math.round(ageInSeconds)}s ago, likely existing account` };
      }
    }
  }
  
  // Pattern 3: Suspicious session characteristics
  if (data?.session && data?.user) {
    console.log('🔍 [PATTERN-DETECTION] Session provided - checking for bypass attempts');
    
    // Check if user was created much earlier than session
    if (data.user.created_at && data.session.expires_at) {
      const userCreated = new Date(data.user.created_at);
      const sessionExpires = new Date(data.session.expires_at * 1000);
      const hoursDifference = (sessionExpires.getTime() - userCreated.getTime()) / (1000 * 60 * 60);
      
      // If user was created more than 2 hours before session expires, suspicious
      if (hoursDifference > 2) {
        return { exists: true, reason: 'User creation and session timing mismatch suggests existing account' };
      }
    }
  }
  
  return { exists: false, reason: 'No existing account patterns detected' };
};
