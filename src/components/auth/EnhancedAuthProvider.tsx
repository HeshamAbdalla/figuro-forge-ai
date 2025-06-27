import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { cleanupAuthState, getAuthErrorMessage, checkRateLimitSafe, isExistingAccountError } from "@/utils/authUtils";
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
  const [hasRedirected, setHasRedirected] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

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

  // Load reCAPTCHA when component mounts with improved handling
  useEffect(() => {
    const loadRecaptcha = async () => {
      try {
        logDebug('Initializing reCAPTCHA...');
        
        // Check if it's already ready
        if (isRecaptchaReady()) {
          logDebug('reCAPTCHA already ready');
          setRecaptchaLoaded(true);
          return;
        }
        
        // Try to initialize with improved timeout
        const loaded = await initializeRecaptcha();
        
        // Always set to true to allow the app to continue
        setRecaptchaLoaded(true);
        
        if (loaded) {
          logDebug('reCAPTCHA loaded successfully');
        } else {
          logWarn('reCAPTCHA failed to load, app will continue without it');
        }
      } catch (error) {
        logError('reCAPTCHA initialization error', error);
        setRecaptchaLoaded(true); // Allow app to continue
      }
    };
    
    loadRecaptcha();
  }, []);

  // Enhanced auth refresh with security enforcement
  const refreshAuth = async () => {
    try {
      logDebug("Refreshing auth state with security enforcement...");
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logError("Session error", error);
        return;
      }
      
      // SECURITY ENFORCEMENT: Always validate session integrity
      if (session?.user) {
        const enforcementResult = await EmailVerificationEnforcer.enforceVerification(
          session.user,
          session
        );

        if (!enforcementResult.allowAccess) {
          logWarn("Access denied due to verification enforcement");
          
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

  // ... keep existing code (useEffect for auth state management)

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener with enhanced security
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        logDebug("Auth state changed", { event, userEmail: session?.user?.email });
        
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
            logWarn("Access denied during auth state change");
            
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
              
              logInfo("Google sign-in successful, redirecting to studio");
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
                    logError("Profile fetch failed", error);
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
                      logInfo("New user detected, creating profile with onboarding flag");
                      
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
                        logInfo("Created new profile for onboarding");
                      }
                    }
                    
                    setProfile(profileData);
                    
                    // Trigger subscription refresh
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

    // Initialize auth with security enforcement
    const initializeAuth = async () => {
      try {
        logDebug("Initializing with security enforcement...");
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logError("Initial session error", error);
        }
        
        if (mounted) {
          // SECURITY ENFORCEMENT: Validate initial session
          if (session?.user) {
            const enforcementResult = await EmailVerificationEnforcer.enforceVerification(
              session.user,
              session
            );

            if (!enforcementResult.allowAccess) {
              logWarn("Initial session denied due to verification");
              
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
  }, [hasRedirected]);

  // Enhanced sign up with Supabase's built-in reCAPTCHA
  const signUp = async (email: string, password: string) => {
    try {
      logDebug("Starting secure signup process", { email });
      
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
      
      // STEP 1: Pre-signup validation
      logDebug("Performing comprehensive pre-signup validation...");
      const preValidation = await validateSignupAttempt(email);
      
      if (preValidation.accountExists) {
        logInfo("Pre-validation detected existing account");
        
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
      
      // STEP 2: Get reCAPTCHA token for Supabase auth
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
      
      // STEP 3: Attempt actual signup with Supabase's built-in reCAPTCHA
      const redirectTo = `${window.location.origin}/studio`;
      
      logDebug("Attempting secure Supabase signup...");
      
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
      
      // STEP 4: Enhanced post-signup validation with security enforcement
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
        logInfo("Post-signup validation found existing account");
        return { error: null, data: null, accountExists: true };
      }
      
      // SECURITY ENFORCEMENT: Never allow immediate access without verification
      if (!validationResult.allowAccess) {
        logInfo("Access denied by security enforcement");
        
        // If there's a session but verification is required, force sign out
        if (data?.session) {
          logInfo("Forcing sign out due to verification requirement");
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
      
      // This should not be reached due to security enforcement above
      logInfo("Signup completed with verification requirement");
      
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

  // Enhanced sign in with Supabase's built-in reCAPTCHA
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

  // Password reset with Supabase's built-in reCAPTCHA
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

  // Resend verification email with Supabase's built-in reCAPTCHA
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

  // Enhanced secure sign out with advanced toast feedback
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
      setHasRedirected(false);
      
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
      
      const redirectTo = `${window.location.origin}/studio`;
      
      logDebug("Starting Google sign-in", { redirectTo });
      
      // Try to execute reCAPTCHA for logging purposes (but don't block)
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
