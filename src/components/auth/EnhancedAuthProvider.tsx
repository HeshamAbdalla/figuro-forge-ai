import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { cleanupAuthState, getAuthErrorMessage, checkRateLimitSafe } from "@/utils/authUtils";
import { validateSignupAttempt, validateSignupResponse } from "@/utils/authValidation";
import { EmailVerificationEnforcer } from "@/utils/emailVerificationEnforcer";
import { sessionManager } from "@/utils/sessionManager";
import { securityManager } from "@/utils/securityUtils";
import { executeRecaptcha, ReCaptchaAction, initializeRecaptcha, isRecaptchaReady } from "@/utils/recaptchaUtils";
import { toast, success, error, warning, info, loading, promise } from "@/hooks/use-enhanced-toast";
import { logDebug, logInfo, logWarn, logError } from "@/utils/productionLogger";

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

  // Enhanced security score calculation
  const calculateSecurityScore = (user: User | null, session: Session | null): number => {
    let score = 0;
    
    // OAuth users get higher base score
    const isOAuth = user?.app_metadata?.provider !== 'email';
    if (isOAuth) score += 60;
    else if (user?.email_confirmed_at) score += 40;
    
    if (session?.access_token) score += 30;
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilExpiry > 0) score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  // Load reCAPTCHA when component mounts
  useEffect(() => {
    const loadRecaptcha = async () => {
      try {
        logDebug('Initializing reCAPTCHA...');
        
        if (isRecaptchaReady()) {
          logDebug('reCAPTCHA already ready');
          return;
        }
        
        const loaded = await initializeRecaptcha();
        
        if (loaded) {
          logDebug('reCAPTCHA loaded successfully');
        } else {
          logWarn('reCAPTCHA failed to load, app will continue without it');
        }
      } catch (error) {
        logError('reCAPTCHA initialization error', error);
      }
    };
    
    loadRecaptcha();
  }, []);

  // Enhanced auth refresh
  const refreshAuth = async () => {
    try {
      logDebug("Refreshing auth state...");
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logError("Session error", error);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      const newSecurityScore = calculateSecurityScore(session?.user ?? null, session);
      setSecurityScore(newSecurityScore);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            const profileData = await sessionManager.getProfile(session.user.id);
            setProfile(profileData);
            
            window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
          } catch (error) {
            logError("Profile fetch failed", error);
          }
        }, 100);
      } else {
        setProfile(null);
      }
      
    } catch (error) {
      logError("Error refreshing auth", error);
    }
  };

  // Enhanced auth state management with OAuth-friendly approach
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        logDebug("Auth state changed", { 
          event, 
          userEmail: session?.user?.email,
          provider: session?.user?.app_metadata?.provider,
          currentPath: window.location.pathname
        });
        
        // Log auth event
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
        
        // Update state immediately
        setSession(session);
        setUser(session?.user ?? null);
        setSecurityScore(calculateSecurityScore(session?.user ?? null, session));
        
        // Handle different auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user && mounted) {
            const provider = session.user.app_metadata?.provider;
            const isOAuth = provider && provider !== 'email';
            
            logInfo(`User signed in via ${provider || 'email'}`);
            
            // OAuth users get fast-tracked to studio
            if (isOAuth && window.location.pathname === '/auth') {
              logInfo("OAuth sign-in successful, redirecting to studio");
              
              toast({
                title: "Welcome! 🎉",
                description: `Signed in successfully with ${provider}`,
              });
              
              // Load profile and redirect immediately
              setTimeout(async () => {
                if (mounted) {
                  try {
                    const profileData = await sessionManager.getProfile(session.user.id);
                    setProfile(profileData);
                    
                    window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
                    
                    // Redirect to studio for OAuth users
                    window.location.href = '/studio-hub';
                  } catch (error) {
                    logError("Profile fetch failed during OAuth", error);
                    window.location.href = '/studio-hub';
                  }
                }
              }, 300);
            } else {
              // Regular email sign-in
              setTimeout(async () => {
                if (mounted) {
                  try {
                    let profileData = await sessionManager.getProfile(session.user.id);
                    
                    if (!profileData) {
                      logInfo("New user detected, creating profile");
                      
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
                        logError("Failed to create profile", createError);
                      } else {
                        profileData = newProfile;
                      }
                    }
                    
                    setProfile(profileData);
                    window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
                    setIsLoading(false);
                  } catch (error) {
                    logError("Profile fetch failed", error);
                    setIsLoading(false);
                  }
                }
              }, 100);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          logInfo("User signed out");
          setProfile(null);
          setSecurityScore(0);
          sessionManager.clearCache();
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user && mounted) {
            setTimeout(async () => {
              if (mounted) {
                try {
                  const profileData = await sessionManager.getProfile(session.user.id);
                  setProfile(profileData);
                  
                  window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
                  setIsLoading(false);
                } catch (error) {
                  logError("Initial profile fetch failed", error);
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

    const initializeAuth = async () => {
      try {
        logDebug("Initializing OAuth-friendly auth...");
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logError("Initial session error", error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setSecurityScore(calculateSecurityScore(session?.user ?? null, session));
          
          if (session?.user) {
            setTimeout(async () => {
              if (mounted) {
                try {
                  const profileData = await sessionManager.getProfile(session.user.id);
                  setProfile(profileData);
                  
                  window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
                  setIsLoading(false);
                } catch (error) {
                  logError("Profile load failed", error);
                  setIsLoading(false);
                }
              }
            }, 100);
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        logError("Initialization error", error);
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
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      logDebug("Starting simplified signup process", { email });
      
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
        logWarn("Pre-signup signout failed (non-critical)");
      }
      
      // REMOVED: Pre-signup validation that was causing false positives
      logDebug("Skipping pre-signup validation to prevent false positives");
      
      // Get reCAPTCHA token for Supabase auth
      let recaptchaToken: string | null = null;
      
      if (isRecaptchaReady()) {
        logDebug("Getting reCAPTCHA token for signup action");
        recaptchaToken = await executeRecaptcha("signup");
        
        if (recaptchaToken) {
          logDebug("reCAPTCHA token obtained for Supabase auth");
        }
      } else {
        logWarn("reCAPTCHA not available, proceeding without reCAPTCHA");
      }
      
      // Attempt actual signup with Supabase
      const redirectTo = `${window.location.origin}/studio-hub`;
      
      logDebug("Attempting Supabase signup...");
      
      const signupParams = {
        email,
        password,
        options: {
          data: { plan: 'free' },
          emailRedirectTo: redirectTo,
          ...(recaptchaToken && { captchaToken: recaptchaToken })
        }
      };
      
      // Execute signup
      const { data, error } = await supabase.auth.signUp(signupParams);
      
      logDebug("Signup response", { 
        hasError: !!error, 
        errorMessage: error?.message,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userEmailConfirmed: data?.user?.email_confirmed_at,
        userCreatedAt: data?.user?.created_at,
        userId: data?.user?.id
      });
      
      // Simplified post-signup validation
      const validationResult = await validateSignupResponse(data, error);
      
      // Log validation result
      securityManager.logSecurityEvent({
        event_type: 'signup_validation_completed',
        event_details: {
          email,
          validation_result: validationResult,
          has_session: !!data?.session,
          has_user: !!data?.user,
          recaptcha_used: !!recaptchaToken
        },
        success: true
      });
      
      if (validationResult.accountExists) {
        logInfo("Existing account detected from Supabase response");
        return { error: null, data: null, accountExists: true };
      }
      
      // Handle explicit signup errors
      if (error) {
        logError("Signup error", error);
        
        const friendlyError = getAuthErrorMessage(error);
        
        securityManager.logSecurityEvent({
          event_type: 'signup_failed',
          event_details: { 
            email, 
            error: error.message,
            recaptcha_used: !!recaptchaToken
          },
          success: false
        });
        
        toast({
          title: "Error signing up",
          description: friendlyError,
          variant: "error",
        });
        return { error: friendlyError, data: null, accountExists: false };
      }
      
      // Success - show appropriate message based on verification status
      if (validationResult.needsVerification) {
        logInfo("Signup successful - email verification required");
        
        toast({
          title: "Account created! 🎉",
          description: "Please check your email for the verification link to complete your registration.",
        });
      } else {
        logInfo("Signup successful - ready to use");
        
        toast({
          title: "Welcome! 🎉",
          description: "Your account has been created successfully.",
        });
      }
      
      return { error: null, data, accountExists: false };
      
    } catch (error: any) {
      logError("Signup exception", error);
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'signup_exception',
        event_details: { email, error: error.message },
        success: false
      });
      
      toast({
        title: "Error signing up",
        description: friendlyError,
        variant: "error",
      });
      return { error: friendlyError, data: null, accountExists: false };
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    logDebug("Starting secure sign-in...");
    
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
        logWarn("Pre-signin signout failed (non-critical)");
      }

      // Get reCAPTCHA token for Supabase auth
      let recaptchaToken: string | null = null;
      
      if (isRecaptchaReady()) {
        logDebug("Getting reCAPTCHA token for login action");
        recaptchaToken = await executeRecaptcha("login");
        
        if (recaptchaToken) {
          logDebug("reCAPTCHA token obtained for Supabase auth");
        }
      } else {
        logWarn("reCAPTCHA not available, proceeding without reCAPTCHA");
      }
      
      logDebug("Attempting sign-in...");
      
      // Set session persistence in localStorage based on "Remember Me"
      if (rememberMe) {
        localStorage.setItem('figuro_remember_me', 'true');
      } else {
        localStorage.removeItem('figuro_remember_me');
      }
      
      // Perform sign-in with Supabase's built-in reCAPTCHA
      const signInParams = {
        email,
        password,
        options: {
          ...(recaptchaToken && { captchaToken: recaptchaToken })
        }
      };
      
      // Execute login
      const { data, error } = await supabase.auth.signInWithPassword(signInParams);
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        logError("Sign-in failed", error);
        
        // Log failure (non-blocking)
        securityManager.logSecurityEvent({
          event_type: 'signin_failed',
          event_details: { 
            email, 
            error: error.message, 
            remember_me: rememberMe,
            recaptcha_used: !!recaptchaToken
          },
          success: false
        });
        
        toast({
          title: "Error signing in",
          description: friendlyError,
          variant: "error",
        });
        return { error: friendlyError };
      }
      
      // Log success (non-blocking)
      securityManager.logSecurityEvent({
        event_type: 'signin_success',
        event_details: { 
          email, 
          user_id: data.user?.id, 
          remember_me: rememberMe,
          recaptcha_used: !!recaptchaToken
        },
        success: true
      });
      
      logInfo("Secure sign-in successful");
      
      toast({
        title: "Welcome back! 🎉",
        description: "You've been signed in successfully.",
      });
      
      return { error: null };
    } catch (error: any) {
      logError("Sign-in exception", error);
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'signin_exception',
        event_details: { email, error: error.message },
        success: false
      });
      
      toast({
        title: "Error signing in",
        description: friendlyError,
        variant: "error",
      });
      return { error: friendlyError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      logDebug("Securely sending password reset email...");
      
      // Get reCAPTCHA token for Supabase auth
      let recaptchaToken: string | null = null;
      
      if (isRecaptchaReady()) {
        recaptchaToken = await executeRecaptcha("password_reset");
      }
      
      const redirectTo = `${window.location.origin}/studio`;
      
      const resetParams = {
        redirectTo: redirectTo,
        ...(recaptchaToken && { options: { captchaToken: recaptchaToken } })
      };
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, resetParams);
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        
        securityManager.logSecurityEvent({
          event_type: 'password_reset_failed',
          event_details: { 
            email, 
            error: error.message,
            recaptcha_used: !!recaptchaToken
          },
          success: false
        });
        
        return { error: friendlyError };
      }
      
      securityManager.logSecurityEvent({
        event_type: 'password_reset_success',
        event_details: { 
          email,
          recaptcha_used: !!recaptchaToken
        },
        success: true
      });
      
      logInfo("Password reset email sent securely");
      
      return { error: null };
    } catch (error: any) {
      logError("Password reset exception", error);
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'password_reset_exception',
        event_details: { email, error: error.message },
        success: false
      });
      
      return { error: friendlyError };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      // Get reCAPTCHA token for Supabase auth
      let recaptchaToken: string | null = null;
      
      if (isRecaptchaReady()) {
        recaptchaToken = await executeRecaptcha("email_verification");
      }
      
      const resendParams = {
        type: 'signup' as const,
        email,
        ...(recaptchaToken && { options: { captchaToken: recaptchaToken } })
      };
      
      const { error } = await supabase.auth.resend(resendParams);
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        
        securityManager.logSecurityEvent({
          event_type: 'verification_resend_failed',
          event_details: { 
            email, 
            error: error.message,
            recaptcha_used: !!recaptchaToken
          },
          success: false
        });
        
        toast({
          title: "Error sending verification email",
          description: friendlyError,
          variant: "error",
        });
        return { error: friendlyError };
      }
      
      securityManager.logSecurityEvent({
        event_type: 'verification_resend_success',
        event_details: { 
          email,
          recaptcha_used: !!recaptchaToken
        },
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
        variant: "error",
      });
      return { error: friendlyError };
    }
  };

  const signOut = async () => {
    const signOutStart = performance.now();
    
    try {
      const currentUserId = user?.id;
      const currentEmail = user?.email;
      
      logDebug("Starting enhanced secure sign out...");
      
      // Show loading toast with progress
      const loadingToast = loading({
        title: "Signing out...",
        description: "Securely ending your session",
        showProgress: true,
        persistent: true
      });
      
      // Log signout initiation (non-blocking)
      securityManager.logSecurityEvent({
        event_type: 'signout_initiated',
        event_details: { 
          user_id: currentUserId,
          email: currentEmail,
          current_path: window.location.pathname,
          session_duration: null // Remove session duration calculation since we can't reliably get session creation time
        },
        success: true
      });
      
      // Step 1: Clean up auth state
      logDebug("Cleaning up authentication state...");
      cleanupAuthState();
      
      // Step 2: Clear session manager cache
      logDebug("Clearing session cache...");
      sessionManager.clearCache();
      
      // Step 3: Perform global sign out
      logDebug("Performing global sign out...");
      await supabase.auth.signOut({ scope: 'global' });
      
      // Step 4: Clear local state
      logDebug("Clearing local auth state...");
      setSession(null);
      setUser(null);
      setProfile(null);
      setSecurityScore(0);
      
      // Step 5: Clear any remaining auth-related data
      logDebug("Final cleanup...");
      
      // Clear subscription refresh events
      window.dispatchEvent(new CustomEvent('auth-signout-complete'));
      
      const signOutDuration = performance.now() - signOutStart;
      logInfo(`Secure sign out completed in ${signOutDuration.toFixed(2)}ms`);
      
      // Log successful signout
      securityManager.logSecurityEvent({
        event_type: 'signout_success',
        event_details: { 
          user_id: currentUserId,
          email: currentEmail,
          duration_ms: signOutDuration,
          cleanup_completed: true
        },
        success: true
      });
      
      // Update loading toast to success
      loadingToast.update({
        id: loadingToast.id,
        title: "Signed out successfully! 👋",
        description: "Your session has been securely ended.",
        variant: "success",
        persistent: false,
        duration: 3000,
        showProgress: false
      });
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
      
    } catch (error: any) {
      const signOutDuration = performance.now() - signOutStart;
      logError("Sign out error", error);
      
      const friendlyError = getAuthErrorMessage(error);
      
      // Log signout error
      securityManager.logSecurityEvent({
        event_type: 'signout_error',
        event_details: { 
          error: error.message,
          duration_ms: signOutDuration
        },
        success: false
      });
      
      // Show error toast
      error({
        title: "Sign out error",
        description: friendlyError,
        duration: 5000,
        actionLabel: "Try Again",
        onAction: () => signOut() // Retry signout
      });
      
      // Force redirect anyway for security
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    }
  };

  // Enhanced Google sign-in
  const signInWithGoogle = async () => {
    try {
      cleanupAuthState();
      
      const redirectTo = `${window.location.origin}/studio-hub`;
      
      logDebug("Starting Google sign-in", { redirectTo });
      
      let recaptchaToken: string | null = null;
      if (isRecaptchaReady()) {
        recaptchaToken = await executeRecaptcha("login");
      }
      
      securityManager.logSecurityEvent({
        event_type: 'google_signin_initiated',
        event_details: { 
          redirect_to: redirectTo,
          recaptcha_used: !!recaptchaToken
        },
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
      logError("Google sign-in error", error);
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'google_signin_error',
        event_details: { error: error.message },
        success: false
      });
      
      toast({
        title: "Error signing in with Google",
        description: friendlyError,
        variant: "error",
      });
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
