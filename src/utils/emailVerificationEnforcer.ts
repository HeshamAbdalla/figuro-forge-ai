
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
 * Simplified OAuth-friendly email verification enforcement
 * Focuses on allowing legitimate users access while maintaining basic security
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
   * Simplified verification enforcement - OAuth-friendly approach
   */
  static async enforceVerification(user: any, session: any): Promise<VerificationEnforcementResult> {
    console.log('🔒 [VERIFICATION-ENFORCER] Simplified verification check');
    
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

    // For email users, only block if explicitly unverified AND account is old
    if (!isEmailConfirmed) {
      // Check if this is a brand new signup (less than 5 minutes old)
      const userCreated = new Date(user.created_at);
      const now = new Date();
      const ageInMinutes = (now.getTime() - userCreated.getTime()) / (1000 * 60);
      
      // Allow new signups some time to verify their email
      if (ageInMinutes < 5) {
        console.log('✅ [VERIFICATION-ENFORCER] New email user - allowing grace period');
        return {
          isVerified: false,
          requiresVerification: true,
          allowAccess: true // Allow access during grace period
        };
      }
      
      console.log('⚠️ [VERIFICATION-ENFORCER] Email user needs verification');
      
      securityManager.logSecurityEvent({
        event_type: 'email_verification_needed',
        event_details: {
          user_id: user.id,
          email: user.email,
          provider: provider,
          account_age_minutes: ageInMinutes
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
