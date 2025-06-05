
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
 * This enforces verification requirements regardless of Supabase configuration
 */
export class EmailVerificationEnforcer {
  
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

    // Check if email is confirmed
    const isEmailConfirmed = !!user.email_confirmed_at;
    console.log('📧 [VERIFICATION-ENFORCER] Email confirmed:', isEmailConfirmed);

    // Additional verification checks
    const verificationChecks = {
      hasConfirmedEmail: isEmailConfirmed,
      hasValidSession: !!session.access_token,
      sessionNotExpired: session.expires_at ? new Date(session.expires_at * 1000) > new Date() : false,
      userCreatedRecently: this.wasUserCreatedRecently(user.created_at)
    };

    console.log('🔍 [VERIFICATION-ENFORCER] Verification checks:', verificationChecks);

    // For newly created users without email confirmation, always require verification
    if (!verificationChecks.hasConfirmedEmail) {
      console.log('❌ [VERIFICATION-ENFORCER] Email not confirmed - verification required');
      
      // Log security event
      securityManager.logSecurityEvent({
        event_type: 'verification_enforcement_triggered',
        event_details: {
          user_id: user.id,
          email: user.email,
          has_confirmed_email: verificationChecks.hasConfirmedEmail,
          user_created_recently: verificationChecks.userCreatedRecently
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

    // Additional security check for suspicious sessions
    if (!verificationChecks.hasValidSession || !verificationChecks.sessionNotExpired) {
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
