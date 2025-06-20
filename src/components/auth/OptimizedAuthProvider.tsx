import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState, getAuthErrorMessage, checkRateLimitSafe } from "@/utils/authUtils";
import { validateSignupAttempt, validateSignupResponse } from "@/utils/authValidation";
import { EmailVerificationEnforcer } from "@/utils/emailVerificationEnforcer";
import { sessionManager } from "@/utils/sessionManager";
import { securityManager } from "@/utils/securityUtils";
import { executeRecaptcha, ReCaptchaAction, initializeRecaptcha, isRecaptchaReady } from "@/utils/recaptchaUtils";
import { logger } from "@/utils/logLevelManager";

interface OptimizedAuthContextType {
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

const OptimizedAuthContext = createContext<OptimizedAuthContextType | undefined>(undefined);

interface OptimizedAuthProviderProps {
  children: ReactNode;
}

export function OptimizedAuthProvider({ children }: OptimizedAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState(0);
  
  // Performance optimization refs
  const mountedRef = useRef(true);
  const lastAuthEventRef = useRef<string>('');
  const profileFetchTimeoutRef = useRef<NodeJS.Timeout>();
  const authStateStableRef = useRef(false);
  
  logger.debug('OptimizedAuthProvider: Component rendered', 'auth-perf');

  // Memoized security score calculation
  const calculateSecurityScore = useCallback((user: User | null, session: Session | null): number => {
    let score = 0;
    if (user?.email_confirmed_at) score += 40;
    if (session?.access_token) score += 30;
    if (user?.app_metadata?.provider === 'google') score += 20;
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilExpiry > 0) score += 10;
    }
    return Math.max(0, Math.min(100, score));
  }, []);

  // Optimized profile fetch with debouncing
  const fetchProfileDebounced = useCallback(async (userId: string) => {
    if (profileFetchTimeoutRef.current) {
      clearTimeout(profileFetchTimeoutRef.current);
    }
    
    profileFetchTimeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      
      try {
        logger.debug('OptimizedAuthProvider: Fetching profile', 'auth-perf', { userId });
        const profileData = await sessionManager.getProfile(userId);
        
        if (mountedRef.current) {
          setProfile(profileData);
          // Trigger subscription refresh only once
          window.dispatchEvent(new CustomEvent('auth-subscription-refresh'));
        }
      } catch (error) {
        logger.error('OptimizedAuthProvider: Profile fetch failed', 'auth-perf', error);
      }
    }, 100);
  }, []);

  // Optimized auth refresh
  const refreshAuth = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      logger.debug('OptimizedAuthProvider: Refreshing auth state', 'auth-perf');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.error('OptimizedAuthProvider: Session error', 'auth-perf', error);
        return;
      }
      
      if (!mountedRef.current) return;
      
      // Security enforcement
      if (session?.user) {
        const enforcementResult = await EmailVerificationEnforcer.enforceVerification(
          session.user,
          session
        );

        if (!enforcementResult.allowAccess) {
          logger.warn('OptimizedAuthProvider: Access denied', 'auth-perf');
          await EmailVerificationEnforcer.forceSignOutUnverified(
            enforcementResult.error || 'Verification required'
          );
          
          if (mountedRef.current) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setSecurityScore(0);
          }
          return;
        }
      }
      
      if (mountedRef.current) {
        setSession(session);
        setUser(session?.user ?? null);
        setSecurityScore(calculateSecurityScore(session?.user ?? null, session));
        
        if (session?.user) {
          fetchProfileDebounced(session.user.id);
        } else {
          setProfile(null);
        }
      }
    } catch (error) {
      logger.error('OptimizedAuthProvider: Error refreshing auth', 'auth-perf', error);
    }
  }, [calculateSecurityScore, fetchProfileDebounced]);

  // Initialize auth with performance optimization
  useEffect(() => {
    let authSubscription: any;
    
    const initializeAuth = async () => {
      try {
        logger.debug('OptimizedAuthProvider: Initializing auth', 'auth-perf');
        
        // Set up auth state listener with deduplication
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mountedRef.current) return;
            
            // Deduplicate auth events
            const eventKey = `${event}-${session?.user?.id || 'null'}`;
            if (lastAuthEventRef.current === eventKey) {
              logger.debug('OptimizedAuthProvider: Duplicate auth event ignored', 'auth-perf', { event });
              return;
            }
            lastAuthEventRef.current = eventKey;
            
            logger.debug('OptimizedAuthProvider: Auth state changed', 'auth-perf', { event });
            
            // Security logging (non-blocking)
            securityManager.logSecurityEvent({
              event_type: `auth_${event.toLowerCase()}`,
              event_details: {
                user_id: session?.user?.id,
                email: session?.user?.email,
                provider: session?.user?.app_metadata?.provider,
                email_confirmed: !!session?.user?.email_confirmed_at
              },
              success: true
            }).catch(() => {}); // Non-blocking
            
            // Security enforcement for signed in users
            if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              const enforcementResult = await EmailVerificationEnforcer.enforceVerification(
                session.user,
                session
              );

              if (!enforcementResult.allowAccess) {
                logger.warn('OptimizedAuthProvider: Access denied during auth change', 'auth-perf');
                await EmailVerificationEnforcer.forceSignOutUnverified(
                  enforcementResult.error || 'Verification required'
                );
                
                if (mountedRef.current) {
                  setSession(null);
                  setUser(null);
                  setProfile(null);
                  setSecurityScore(0);
                }
                return;
              }
            }
            
            if (mountedRef.current) {
              setSession(session);
              setUser(session?.user ?? null);
              setSecurityScore(calculateSecurityScore(session?.user ?? null, session));
              
              if (session?.user) {
                fetchProfileDebounced(session.user.id);
              } else {
                setProfile(null);
                sessionManager.clearCache();
              }
              
              // Set auth state as stable after first change
              if (!authStateStableRef.current) {
                authStateStableRef.current = true;
                setIsLoading(false);
              }
            }
          }
        );

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('OptimizedAuthProvider: Initial session error', 'auth-perf', error);
        }
        
        if (mountedRef.current) {
          // Security enforcement for initial session
          if (session?.user) {
            const enforcementResult = await EmailVerificationEnforcer.enforceVerification(
              session.user,
              session
            );

            if (!enforcementResult.allowAccess) {
              logger.warn('OptimizedAuthProvider: Initial session denied', 'auth-perf');
              await EmailVerificationEnforcer.forceSignOutUnverified(
                enforcementResult.error || 'Verification required'
              );
              
              setSession(null);
              setUser(null);
              setProfile(null);
              setSecurityScore(0);
              setIsLoading(false);
              return;
            }
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setSecurityScore(calculateSecurityScore(session?.user ?? null, session));
          
          if (session?.user) {
            fetchProfileDebounced(session.user.id);
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        logger.error('OptimizedAuthProvider: Initialization error', 'auth-perf', error);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      if (authSubscription) {
        authSubscription.subscription.unsubscribe();
      }
      if (profileFetchTimeoutRef.current) {
        clearTimeout(profileFetchTimeoutRef.current);
      }
    };
  }, [calculateSecurityScore, fetchProfileDebounced]);

  // Initialize reCAPTCHA once
  useEffect(() => {
    initializeRecaptcha().catch(() => {
      logger.warn('OptimizedAuthProvider: reCAPTCHA initialization failed', 'auth-perf');
    });
  }, []);

  // Memoized auth functions (keep original implementation but with performance logging)
  const signUp = useCallback(async (email: string, password: string) => {
    logger.debug('OptimizedAuthProvider: SignUp initiated', 'auth-perf');
    try {
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = securityManager.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      const canProceed = await checkRateLimitSafe('auth_signup');
      if (!canProceed) {
        throw new Error('Too many sign up attempts. Please wait a few minutes.');
      }

      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        logger.debug('OptimizedAuthProvider: Pre-signup signout failed (non-critical)', 'auth-perf');
      }
      
      const preValidation = await validateSignupAttempt(email);
      
      if (preValidation.accountExists) {
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
      
      let recaptchaToken: string | null = null;
      
      if (isRecaptchaReady()) {
        recaptchaToken = await executeRecaptcha("signup");
      }
      
      const redirectTo = `${window.location.origin}/studio`;
      
      const signupParams = {
        email,
        password,
        options: {
          data: { plan: 'free' },
          emailRedirectTo: redirectTo,
          ...(recaptchaToken && { captchaToken: recaptchaToken })
        }
      };
      
      const { data, error } = await supabase.auth.signUp(signupParams);
      
      const validationResult = await validateSignupResponse(data, error);
      
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
        return { error: null, data: null, accountExists: true };
      }
      
      if (!validationResult.allowAccess) {
        if (data?.session) {
          await EmailVerificationEnforcer.forceSignOutUnverified('Email verification required');
        }
        
        toast({
          title: "Email verification required",
          description: "Please check your email for the verification link before signing in.",
        });
        
        return { error: null, data: data, accountExists: false };
      }
      
      if (error) {
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
          variant: "destructive",
        });
        return { error: friendlyError, data: null, accountExists: false };
      }
      
      return { error: null, data, accountExists: false };
      
    } catch (error: any) {
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
  }, []);

  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    logger.debug('OptimizedAuthProvider: SignIn initiated', 'auth-perf');
    try {
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const canProceed = await checkRateLimitSafe('auth_signin');
      if (!canProceed) {
        throw new Error('Too many sign in attempts. Please wait a few minutes.');
      }

      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        logger.debug('OptimizedAuthProvider: Pre-signin signout failed (non-critical)', 'auth-perf');
      }

      let recaptchaToken: string | null = null;
      
      if (isRecaptchaReady()) {
        recaptchaToken = await executeRecaptcha("login");
      }
      
      if (rememberMe) {
        localStorage.setItem('figuro_remember_me', 'true');
      } else {
        localStorage.removeItem('figuro_remember_me');
      }
      
      const signInParams = {
        email,
        password,
        options: {
          ...(recaptchaToken && { captchaToken: recaptchaToken })
        }
      };
      
      const { data, error } = await supabase.auth.signInWithPassword(signInParams);
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        
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
          variant: "destructive",
        });
        return { error: friendlyError };
      }
      
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
      
      toast({
        title: "Welcome back! 🎉",
        description: "You've been signed in successfully.",
      });
      
      return { error: null };
    } catch (error: any) {
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
  }, []);

  const signOut = useCallback(async () => {
    logger.debug('OptimizedAuthProvider: SignOut initiated', 'auth-perf');
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
  }, [user?.id]);

  const signInWithGoogle = useCallback(async () => {
    logger.debug('OptimizedAuthProvider: Google SignIn initiated', 'auth-perf');
    try {
      cleanupAuthState();
      
      const redirectTo = `${window.location.origin}/studio`;
      
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
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    logger.debug('OptimizedAuthProvider: Password reset initiated', 'auth-perf');
    try {
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      
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
      
      return { error: null };
    } catch (error: any) {
      const friendlyError = getAuthErrorMessage(error);
      
      securityManager.logSecurityEvent({
        event_type: 'password_reset_exception',
        event_details: { email, error: error.message },
        success: false
      });
      
      return { error: friendlyError };
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    logger.debug('OptimizedAuthProvider: Verification email resend initiated', 'auth-perf');
    try {
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
          variant: "destructive",
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
        variant: "destructive",
      });
      return { error: friendlyError };
    }
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
  }), [
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
  ]);

  return (
    <OptimizedAuthContext.Provider value={contextValue}>
      {children}
    </OptimizedAuthContext.Provider>
  );
}

export function useOptimizedAuth() {
  const context = useContext(OptimizedAuthContext);
  if (context === undefined) {
    throw new Error("useOptimizedAuth must be used within an OptimizedAuthProvider");
  }
  return context;
}
