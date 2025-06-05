import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState, getAuthErrorMessage, checkRateLimitSafe, isExistingAccountError } from "@/utils/authUtils";
import { validateSignupAttempt, validateSignupResponse } from "@/utils/authValidation";
import { EmailVerificationEnforcer } from "@/utils/emailVerificationEnforcer";
import { sessionManager } from "@/utils/sessionManager";
import { securityManager } from "@/utils/securityUtils";

interface EnhancedAuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data: any, accountExists?: boolean }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshAuth: () => Promise<void>;
  securityScore: number;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

interface EnhancedAuthProviderProps {
  children: ReactNode;
}

export function EnhancedAuthProvider({ children }: EnhancedAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState(0);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Enhanced security score calculation
  const calculateSecurityScore = (user: User | null, session: Session | null): number => {
    let score = 0;
    
    if (user?.email_confirmed_at) score += 40; // Higher weight for verification
    if (session?.access_token) score += 30;
    if (user?.app_metadata?.provider === 'google') score += 20;
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilExpiry > 0) score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  // Enhanced auth refresh with security enforcement
  const refreshAuth = async () => {
    try {
      console.log("🔄 [ENHANCED-AUTH] Refreshing auth state with security enforcement...");
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("❌ [ENHANCED-AUTH] Session error:", error.message);
        return;
      }
      
      // SECURITY ENFORCEMENT: Always validate session integrity
      if (session?.user) {
        const enforcementResult = await EmailVerificationEnforcer.enforceVerification(
          session.user,
          session
        );

        if (!enforcementResult.allowAccess) {
          console.log("🚫 [ENHANCED-AUTH] Access denied due to verification enforcement");
          
          // Force sign out if verification is required
          await EmailVerificationEnforcer.forceSignOutUnverified(
            enforcementResult.error || 'Verification required'
          );
          
          setSession(null);
          setUser(null);
          setProfile(null);
          setSecurityScore(0);
          
          // Redirect to auth page if on protected route
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
          return;
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      const newSecurityScore = calculateSecurityScore(session?.user ?? null, session);
      setSecurityScore(newSecurityScore);
      
      if (session?.user) {
        // Load profile and trigger subscription refresh
        setTimeout(async () => {
          try {
            const profileData = await sessionManager.getProfile(session.user.id);
            setProfile(profileData);
            
            // Trigger subscription refresh after successful auth
            window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
          } catch (error) {
            console.error("❌ [ENHANCED-AUTH] Profile fetch failed:", error);
          }
        }, 100);
      } else {
        setProfile(null);
      }
      
    } catch (error) {
      console.error("❌ [ENHANCED-AUTH] Error refreshing auth:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener with enhanced security
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("🔄 [ENHANCED-AUTH] Auth state changed:", event);
        
        // Log auth event (non-blocking)
        securityManager.logSecurityEvent({
          event_type: `auth_${event.toLowerCase()}`,
          event_details: {
            user_id: session?.user?.id,
            email: session?.user?.email,
            provider: session?.user?.app_metadata?.provider,
            current_path: window.location.pathname,
            email_confirmed: !!session?.user?.email_confirmed_at
          },
          success: true
        });
        
        // SECURITY ENFORCEMENT: Validate every auth state change
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const enforcementResult = await EmailVerificationEnforcer.enforceVerification(
            session.user,
            session
          );

          if (!enforcementResult.allowAccess) {
            console.log("🚫 [ENHANCED-AUTH] Access denied during auth state change");
            
            // Force sign out for unverified users
            await EmailVerificationEnforcer.forceSignOutUnverified(
              enforcementResult.error || 'Verification required'
            );
            
            // Clear state and redirect
            setSession(null);
            setUser(null);
            setProfile(null);
            setSecurityScore(0);
            
            if (window.location.pathname !== '/auth') {
              window.location.href = '/auth';
            }
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setSecurityScore(calculateSecurityScore(session?.user ?? null, session));
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user && mounted) {
            // Handle Google OAuth redirect with verification check
            if (session.user.app_metadata?.provider === 'google' && 
                window.location.pathname === '/auth' && 
                !hasRedirected) {
              
              console.log("✅ [ENHANCED-AUTH] Google sign-in successful, redirecting to studio");
              setHasRedirected(true);
              
              // Defer profile loading and redirect
              setTimeout(async () => {
                if (mounted) {
                  try {
                    const profileData = await sessionManager.getProfile(session.user.id);
                    setProfile(profileData);
                    
                    // Trigger subscription refresh
                    window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
                    
                    // Only redirect if we're still on the auth page
                    if (window.location.pathname === '/auth') {
                      window.location.href = '/studio';
                    }
                  } catch (error) {
                    console.error("❌ [ENHANCED-AUTH] Profile fetch failed:", error);
                    setIsLoading(false);
                  }
                }
              }, 200);
            } else {
              // Regular email/password sign-in with verification enforcement
              setTimeout(async () => {
                if (mounted) {
                  try {
                    let profileData = await sessionManager.getProfile(session.user.id);
                    
                    // If no profile exists, create one for new user
                    if (!profileData) {
                      console.log("🆕 [ENHANCED-AUTH] New user detected, creating profile with onboarding flag");
                      
                      const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert({
                          id: session.user.id,
                          is_onboarding_complete: false,
                          plan: 'free'
                        })
                        .select()
                        .single();
                      
                      if (createError) {
                        console.error("❌ [ENHANCED-AUTH] Failed to create profile:", createError);
                      } else {
                        profileData = newProfile;
                        console.log("✅ [ENHANCED-AUTH] Created new profile for onboarding");
                      }
                    }
                    
                    setProfile(profileData);
                    
                    // Trigger subscription refresh
                    window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
                    
                    setIsLoading(false);
                  } catch (error) {
                    console.error("❌ [ENHANCED-AUTH] Profile fetch failed:", error);
                    setIsLoading(false);
                  }
                }
              }, 100);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setSecurityScore(0);
          setHasRedirected(false);
          sessionManager.clearCache();
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user && mounted) {
            // Defer profile loading
            setTimeout(async () => {
              if (mounted) {
                try {
                  const profileData = await sessionManager.getProfile(session.user.id);
                  setProfile(profileData);
                  
                  // Trigger subscription refresh on initial load
                  window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
                  
                  setIsLoading(false);
                } catch (error) {
                  console.error("❌ [ENHANCED-AUTH] Initial profile fetch failed:", error);
                  setIsLoading(false);
                }
              }
            }, 100);
          } else {
            setIsLoading(false);
          }
        }
      }
    );

    // Initialize auth with security enforcement
    const initializeAuth = async () => {
      try {
        console.log("🚀 [ENHANCED-AUTH] Initializing with security enforcement...");
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ [ENHANCED-AUTH] Initial session error:", error.message);
        }
        
        if (mounted) {
          // SECURITY ENFORCEMENT: Validate initial session
          if (session?.user) {
            const enforcementResult = await EmailVerificationEnforcer.enforceVerification(
              session.user,
              session
            );

            if (!enforcementResult.allowAccess) {
              console.log("🚫 [ENHANCED-AUTH] Initial session denied due to verification");
              
              // Force sign out and redirect
              await EmailVerificationEnforcer.forceSignOutUnverified(
                enforcementResult.error || 'Verification required'
              );
              
              setSession(null);
              setUser(null);
              setProfile(null);
              setSecurityScore(0);
              setIsLoading(false);
              
              if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
              }
              return;
            }
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setSecurityScore(calculateSecurityScore(session?.user ?? null, session));
          
          if (session?.user) {
            // Defer profile loading
            setTimeout(async () => {
              if (mounted) {
                try {
                  const profileData = await sessionManager.getProfile(session.user.id);
                  setProfile(profileData);
                  
                  // Trigger subscription refresh on initial load
                  window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
                  
                  setIsLoading(false);
                } catch (error) {
                  console.error("❌ [ENHANCED-AUTH] Profile load failed:", error);
                  setIsLoading(false);
                }
              }
            }, 100);
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("❌ [ENHANCED-AUTH] Initialization error:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hasRedirected]);

  // Enhanced sign up with comprehensive security validation
  const signUp = async (email: string, password: string) => {
    try {
      console.log("🚀 [ENHANCED-AUTH] Starting comprehensive secure signup process for:", email);
      
      // Validation
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = securityManager.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      // Optional rate limit check
      const canProceed = await checkRateLimitSafe('auth_signup');
      if (!canProceed) {
        throw new Error('Too many sign up attempts. Please wait a few minutes.');
      }

      cleanupAuthState();
      
      // Quick sign out attempt
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("⚠️ [ENHANCED-AUTH] Pre-signup signout failed (non-critical)");
      }
      
      // STEP 1: Pre-signup validation
      console.log("🔍 [ENHANCED-AUTH] Performing comprehensive pre-signup validation...");
      const preValidation = await validateSignupAttempt(email);
      
      if (preValidation.accountExists) {
        console.log("👤 [ENHANCED-AUTH] Pre-validation detected existing account");
        
        securityManager.logSecurityEvent({
          event_type: 'signup_existing_account_pre_detected',
          event_details: { 
            email, 
            needs_verification: preValidation.needsVerification,
            detection_method: 'pre_validation'
          },
          success: true
        });
        
        return { error: null, data: null, accountExists: true };
      }
      
      // STEP 2: Attempt actual signup with security enforcement
      const redirectTo = `${window.location.origin}/studio`;
      
      console.log("📧 [ENHANCED-AUTH] Pre-validation passed, attempting secure Supabase signup...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { plan: 'free' },
          emailRedirectTo: redirectTo
        }
      });
      
      console.log("📊 [ENHANCED-AUTH] Signup response - Error:", error?.message || 'None');
      console.log("📊 [ENHANCED-AUTH] Signup response - Data:", {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userEmailConfirmed: data?.user?.email_confirmed_at,
        userCreatedAt: data?.user?.created_at,
        userId: data?.user?.id
      });
      
      // STEP 3: Enhanced post-signup validation with security enforcement
      const validationResult = await validateSignupResponse(data, error);
      
      // Log validation result
      securityManager.logSecurityEvent({
        event_type: 'signup_validation_completed',
        event_details: {
          email,
          validation_result: validationResult,
          has_session: !!data?.session,
          has_user: !!data?.user
        },
        success: true
      });
      
      if (validationResult.accountExists) {
        console.log("👤 [ENHANCED-AUTH] Post-signup validation found existing account");
        return { error: null, data: null, accountExists: true };
      }
      
      // SECURITY ENFORCEMENT: Never allow immediate access without verification
      if (!validationResult.allowAccess) {
        console.log("🔒 [ENHANCED-AUTH] Access denied by security enforcement");
        
        // If there's a session but verification is required, force sign out
        if (data?.session) {
          console.log("🚪 [ENHANCED-AUTH] Forcing sign out due to verification requirement");
          await EmailVerificationEnforcer.forceSignOutUnverified('Email verification required');
        }
        
        // Always show verification required message
        toast({
          title: "Email verification required",
          description: "Please check your email for the verification link before signing in.",
        });
        
        return { error: null, data: data, accountExists: false };
      }
      
      // Handle explicit signup errors
      if (error) {
        console.log("❌ [ENHANCED-AUTH] Signup error:", error.message);
        
        const friendlyError = getAuthErrorMessage(error);
        
        securityManager.logSecurityEvent({
          event_type: 'signup_failed',
          event_details: { email, error: error.message },
          success: false
        });
        
        toast({
          title: "Error signing up",
          description: friendlyError,
          variant: "destructive",
        });
        return { error: friendlyError, data: null, accountExists: false };
      }
      
      // This should not be reached due to security enforcement above
      console.log("✅ [ENHANCED-AUTH] Signup completed with verification requirement");
      
      return { error: null, data, accountExists: false };
      
    } catch (error: any) {
      console.error("❌ [ENHANCED-AUTH] Signup exception:", error);
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'signup_exception',
        event_details: { email, error: error.message },
        success: false
      });
      
      toast({
        title: "Error signing up",
        description: friendlyError,
        variant: "destructive",
      });
      return { error: friendlyError, data: null, accountExists: false };
    }
  };

  // Enhanced sign in with "Remember Me" support
  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    console.log("🚀 [ENHANCED-AUTH] Starting sign-in...");
    
    try {
      // Quick validation
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Optional rate limit check (non-blocking)
      const canProceed = await checkRateLimitSafe('auth_signin');
      if (!canProceed) {
        throw new Error('Too many sign in attempts. Please wait a few minutes.');
      }

      // Clean up state
      cleanupAuthState();
      
      // Quick sign out attempt (non-blocking)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("⚠️ [ENHANCED-AUTH] Pre-signin signout failed (non-critical)");
      }
      
      console.log("🔐 [ENHANCED-AUTH] Attempting sign-in...");
      
      // Set session persistence in localStorage based on "Remember Me"
      if (rememberMe) {
        localStorage.setItem('figuro_remember_me', 'true');
      } else {
        localStorage.removeItem('figuro_remember_me');
      }
      
      // Perform sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        console.error("❌ [ENHANCED-AUTH] Sign-in failed:", error.message);
        
        // Log failure (non-blocking)
        securityManager.logSecurityEvent({
          event_type: 'signin_failed',
          event_details: { email, error: error.message, remember_me: rememberMe },
          success: false
        });
        
        toast({
          title: "Error signing in",
          description: friendlyError,
          variant: "destructive",
        });
        return { error: friendlyError };
      }
      
      // Log success (non-blocking)
      securityManager.logSecurityEvent({
        event_type: 'signin_success',
        event_details: { email, user_id: data.user?.id, remember_me: rememberMe },
        success: true
      });
      
      console.log("✅ [ENHANCED-AUTH] Sign-in successful");
      
      toast({
        title: "Welcome back! 🎉",
        description: "You've been signed in successfully.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("❌ [ENHANCED-AUTH] Sign-in exception:", error);
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'signin_exception',
        event_details: { email, error: error.message },
        success: false
      });
      
      toast({
        title: "Error signing in",
        description: friendlyError,
        variant: "destructive",
      });
      return { error: friendlyError };
    }
  };

  // Password reset functionality
  const resetPassword = async (email: string) => {
    try {
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      console.log("🔄 [ENHANCED-AUTH] Sending password reset email...");
      
      const redirectTo = `${window.location.origin}/studio`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        
        securityManager.logSecurityEvent({
          event_type: 'password_reset_failed',
          event_details: { email, error: error.message },
          success: false
        });
        
        return { error: friendlyError };
      }
      
      securityManager.logSecurityEvent({
        event_type: 'password_reset_success',
        event_details: { email },
        success: true
      });
      
      console.log("✅ [ENHANCED-AUTH] Password reset email sent");
      
      return { error: null };
    } catch (error: any) {
      console.error("❌ [ENHANCED-AUTH] Password reset exception:", error);
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'password_reset_exception',
        event_details: { email, error: error.message },
        success: false
      });
      
      return { error: friendlyError };
    }
  };

  // Simplified sign out
  const signOut = async () => {
    try {
      const currentUserId = user?.id;
      
      securityManager.logSecurityEvent({
        event_type: 'signout_initiated',
        event_details: { user_id: currentUserId },
        success: true
      });
      
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/auth';
      
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'signout_error',
        event_details: { error: error.message },
        success: false
      });
      
      toast({
        title: "Error signing out",
        description: friendlyError,
        variant: "destructive",
      });
    }
  };

  // Enhanced Google sign-in with environment-aware redirects
  const signInWithGoogle = async () => {
    try {
      cleanupAuthState();
      
      const redirectTo = `${window.location.origin}/studio`;
      
      console.log("🚀 [ENHANCED-AUTH] Starting Google sign-in with redirect:", redirectTo);
      
      securityManager.logSecurityEvent({
        event_type: 'google_signin_initiated',
        event_details: { redirect_to: redirectTo },
        success: true
      });
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("❌ [ENHANCED-AUTH] Google sign-in error:", error);
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'google_signin_error',
        event_details: { error: error.message },
        success: false
      });
      
      toast({
        title: "Error signing in with Google",
        description: friendlyError,
        variant: "destructive",
      });
    }
  };
  
  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        
        securityManager.logSecurityEvent({
          event_type: 'verification_resend_failed',
          event_details: { email, error: error.message },
          success: false
        });
        
        toast({
          title: "Error sending verification email",
          description: friendlyError,
          variant: "destructive",
        });
        return { error: friendlyError };
      }
      
      securityManager.logSecurityEvent({
        event_type: 'verification_resend_success',
        event_details: { email },
        success: true
      });
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
      
      return { error: null };
    } catch (error: any) {
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'verification_resend_exception',
        event_details: { email, error: error.message },
        success: false
      });
      
      toast({
        title: "Error sending verification email",
        description: friendlyError,
        variant: "destructive",
      });
      return { error: friendlyError };
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resendVerificationEmail,
    resetPassword,
    refreshAuth,
    securityScore,
  };

  return <EnhancedAuthContext.Provider value={value}>{children}</EnhancedAuthContext.Provider>;
}

export function useEnhancedAuth() {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error("useEnhancedAuth must be used within an EnhancedAuthProvider");
  }
  return context;
}
