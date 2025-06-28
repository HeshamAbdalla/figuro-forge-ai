
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
 * Comprehensive email verification enforcement utility
 * This enforces verification requirements with OAuth provider awareness
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
   */
  private static isVerifiedOAuthProvider(provider: string): boolean {
    const verifiedProviders = ['google', 'github', 'microsoft', 'linkedin_oidc'];
    return verifiedProviders.includes(provider);
  }

  /**
   * Enforce email verification for a user session
   */
  static async enforceVerification(user: any, session: any): Promise<VerificationEnforcementResult> {
    console.log('🔒 [VERIFICATION-ENFORCER] Starting comprehensive verification check');
    
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

    console.log('📧 [VERIFICATION-ENFORCER] User details:', {
      provider,
      isOAuth,
      isEmailConfirmed,
      email: user.email
    });

    // For OAuth users from trusted providers, we trust their email verification
    if (isOAuth && this.isVerifiedOAuthProvider(provider)) {
      console.log('✅ [VERIFICATION-ENFORCER] OAuth user from trusted provider - allowing access');
      
      securityManager.logSecurityEvent({
        event_type: 'oauth_user_verified_access',
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

    // For email/password users, check email confirmation
    if (!isOAuth && !isEmailConfirmed) {
      console.log('❌ [VERIFICATION-ENFORCER] Email user without confirmation - verification required');
      
      securityManager.logSecurityEvent({
        event_type: 'email_verification_enforcement_triggered',
        event_details: {
          user_id: user.id,
          email: user.email,
          provider: provider,
          has_confirmed_email: isEmailConfirmed
        },
        success: true
      });

      return {
        isVerified: false,
        requiresVerification: true,
        allowAccess: false,
        redirectTo: '/auth',
        error: 'Email verification required before accessing the application'
      };
    }

    // Additional security checks for all users
    const sessionChecks = {
      hasValidSession: !!session.access_token,
      sessionNotExpired: session.expires_at ? new Date(session.expires_at * 1000) > new Date() : false
    };

    console.log('🔍 [VERIFICATION-ENFORCER] Session checks:', sessionChecks);

    if (!sessionChecks.hasValidSession || !sessionChecks.sessionNotExpired) {
      console.log('⚠️ [VERIFICATION-ENFORCER] Invalid or expired session');
      
      return {
        isVerified: false,
        requiresVerification: true,
        allowAccess: false,
        redirectTo: '/auth',
        error: 'Session invalid or expired'
      };
    }

    console.log('✅ [VERIFICATION-ENFORCER] All verification checks passed');
    
    return {
      isVerified: true,
      requiresVerification: false,
      allowAccess: true
    };
  }

  /**
   * Check if user was created within the last 24 hours
   */
  private static wasUserCreatedRecently(createdAt: string): boolean {
    const userCreated = new Date(createdAt);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return userCreated > twentyFourHoursAgo;
  }

  /**
   * Force sign out for unverified users
   */
  static async forceSignOutUnverified(reason: string): Promise<void> {
    console.log('🚪 [VERIFICATION-ENFORCER] Forcing sign out:', reason);
    
    try {
      await supabase.auth.signOut({ scope: 'global' });
      
      securityManager.logSecurityEvent({
        event_type: 'forced_signout_unverified',
        event_details: { reason },
        success: true
      });
    } catch (error) {
      console.error('❌ [VERIFICATION-ENFORCER] Failed to force sign out:', error);
    }
  }

  /**
   * Validate session integrity
   */
  static validateSessionIntegrity(session: any): boolean {
    if (!session) return false;
    
    const requiredFields = ['access_token', 'user', 'expires_at'];
    return requiredFields.every(field => !!session[field]);
  }
}
