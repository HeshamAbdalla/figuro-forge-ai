
import { supabase } from '@/integrations/supabase/client';
import { securityManager } from './securityUtils';

export interface VerificationEnforcementResult {
  isVerified: boolean;
  requiresVerification: boolean;
  allowAccess: boolean;
  redirectTo?: string;
  error?: string;
}

/**
 * OAuth-friendly email verification enforcement utility
 * Designed to be permissive for OAuth users while maintaining security
 */
export class EmailVerificationEnforcer {
  
  /**
   * Check if user signed up with OAuth provider
   */
  private static isOAuthUser(user: any): boolean {
    const provider = user?.app_metadata?.provider;
    return provider && provider !== 'email';
  }

  /**
   * Check if OAuth provider handles email verification
   * Most major OAuth providers pre-verify emails
   */
  private static isVerifiedOAuthProvider(provider: string): boolean {
    const verifiedProviders = ['google', 'github', 'microsoft', 'linkedin_oidc', 'facebook', 'twitter'];
    return verifiedProviders.includes(provider);
  }

  /**
   * OAuth-friendly verification enforcement
   * Prioritizes user access while maintaining security
   */
  static async enforceVerification(user: any, session: any): Promise<VerificationEnforcementResult> {
    console.log('🔒 [VERIFICATION-ENFORCER] OAuth-friendly verification check');
    
    if (!user || !session) {
      return {
        isVerified: false,
        requiresVerification: false,
        allowAccess: false,
        error: 'No user or session provided'
      };
    }

    const isOAuth = this.isOAuthUser(user);
    const provider = user.app_metadata?.provider || 'email';
    const isEmailConfirmed = !!user.email_confirmed_at;

    console.log('📧 [VERIFICATION-ENFORCER] User verification details:', {
      provider,
      isOAuth,
      isEmailConfirmed,
      email: user.email
    });

    // OAuth users are ALWAYS allowed - they're pre-verified by the provider
    if (isOAuth) {
      console.log('✅ [VERIFICATION-ENFORCER] OAuth user - automatically allowing access');
      
      securityManager.logSecurityEvent({
        event_type: 'oauth_user_access_granted',
        event_details: {
          user_id: user.id,
          email: user.email,
          provider: provider
        },
        success: true
      });

      return {
        isVerified: true,
        requiresVerification: false,
        allowAccess: true
      };
    }

    // For email users, be lenient - only block if explicitly unverified
    if (!isEmailConfirmed) {
      console.log('⚠️ [VERIFICATION-ENFORCER] Email user needs verification');
      
      securityManager.logSecurityEvent({
        event_type: 'email_verification_needed',
        event_details: {
          user_id: user.id,
          email: user.email,
          provider: provider
        },
        success: true
      });

      return {
        isVerified: false,
        requiresVerification: true,
        allowAccess: false,
        redirectTo: '/auth',
        error: 'Please verify your email to continue'
      };
    }

    // Basic session validation (lightweight)
    if (!session.access_token) {
      console.log('⚠️ [VERIFICATION-ENFORCER] Invalid session token');
      
      return {
        isVerified: false,
        requiresVerification: true,
        allowAccess: false,
        redirectTo: '/auth',
        error: 'Session expired, please sign in again'
      };
    }

    console.log('✅ [VERIFICATION-ENFORCER] All checks passed - access granted');
    
    return {
      isVerified: true,
      requiresVerification: false,
      allowAccess: true
    };
  }

  /**
   * Gentle sign out for unverified users (non-destructive)
   */
  static async forceSignOutUnverified(reason: string): Promise<void> {
    console.log('🚪 [VERIFICATION-ENFORCER] Gentle sign out:', reason);
    
    try {
      await supabase.auth.signOut();
      
      securityManager.logSecurityEvent({
        event_type: 'gentle_signout_unverified',
        event_details: { reason },
        success: true
      });
    } catch (error) {
      console.error('❌ [VERIFICATION-ENFORCER] Sign out failed (non-critical):', error);
    }
  }

  /**
   * Basic session integrity check
   */
  static validateSessionIntegrity(session: any): boolean {
    if (!session) return false;
    
    // Only check essential fields
    return !!(session.access_token && session.user);
  }
}
