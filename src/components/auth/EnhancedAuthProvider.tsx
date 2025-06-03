import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState, getAuthErrorMessage, checkRateLimitSafe } from "@/utils/authUtils";
import { sessionManager } from "@/utils/sessionManager";
import { securityManager } from "@/utils/securityUtils";

interface EnhancedAuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data: any }>;
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

  // Simplified security score calculation
  const calculateSecurityScore = (user: User | null, session: Session | null): number => {
    let score = 0;
    
    if (user?.email_confirmed_at) score += 25;
    if (session?.access_token) score += 25;
    if (user?.app_metadata?.provider === 'google') score += 25;
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilExpiry > 0) score += 25;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  // Simplified auth refresh
  const refreshAuth = async () => {
    try {
      console.log("🔄 [ENHANCED-AUTH] Refreshing auth state...");
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("❌ [ENHANCED-AUTH] Session error:", error.message);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      const newSecurityScore = calculateSecurityScore(session?.user ?? null, session);
      setSecurityScore(newSecurityScore);
      
      if (session?.user) {
        // Defer profile loading to prevent blocking
        setTimeout(async () => {
          try {
            const profileData = await sessionManager.getProfile(session.user.id);
            setProfile(profileData);
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

    // Set up auth state listener
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
            provider: session?.user?.app_metadata?.provider
          },
          success: true
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setSecurityScore(calculateSecurityScore(session?.user ?? null, session));
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user && mounted) {
            // Defer profile loading
            setTimeout(async () => {
              if (mounted) {
                try {
                  const profileData = await sessionManager.getProfile(session.user.id);
                  setProfile(profileData);
                } catch (error) {
                  console.error("❌ [ENHANCED-AUTH] Profile fetch failed:", error);
                }
                setIsLoading(false);
              }
            }, 100);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setSecurityScore(0);
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
                } catch (error) {
                  console.error("❌ [ENHANCED-AUTH] Initial profile fetch failed:", error);
                }
                setIsLoading(false);
              }
            }, 100);
          } else {
            setIsLoading(false);
          }
        }
      }
    );

    // Initialize auth
    const initializeAuth = async () => {
      try {
        console.log("🚀 [ENHANCED-AUTH] Initializing...");
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ [ENHANCED-AUTH] Initial session error:", error.message);
        }
        
        if (mounted) {
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
                } catch (error) {
                  console.error("❌ [ENHANCED-AUTH] Profile load failed:", error);
                }
                setIsLoading(false);
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
  }, []);

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
      
      // Configure session persistence based on "Remember Me"
      const authOptions = {
        email,
        password,
        options: {
          data: {
            remember_me: rememberMe
          }
        }
      };
      
      // Set session persistence in localStorage
      if (rememberMe) {
        localStorage.setItem('figuro_remember_me', 'true');
      } else {
        localStorage.removeItem('figuro_remember_me');
      }
      
      // Perform sign-in
      const { data, error } = await supabase.auth.signInWithPassword(authOptions);
      
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

  // Streamlined sign up
  const signUp = async (email: string, password: string) => {
    try {
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
        console.log("Pre-signUp global sign out error (non-critical)");
      }
      
      console.log("Attempting sign-up...");
      
      const origin = window.location.origin || 'http://localhost:5173';
      const redirectTo = `${origin}/complete-profile`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { plan: 'free' },
          emailRedirectTo: redirectTo
        }
      });
      
      if (error) {
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
        return { error: friendlyError, data: null };
      } else {
        const isEmailVerificationRequired = !data.session;
        
        securityManager.logSecurityEvent({
          event_type: 'signup_success',
          event_details: { email, user_id: data.user?.id, email_verification_required: isEmailVerificationRequired },
          success: true
        });
        
        toast({
          title: isEmailVerificationRequired ? "Verification email sent" : "Signup successful",
          description: isEmailVerificationRequired 
            ? "Please check your email to confirm your account."
            : "Your account has been created successfully.",
        });
      }
      
      return { error: null, data };
    } catch (error: any) {
      console.error("Sign-up exception:", error);
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
      return { error: friendlyError, data: null };
    }
  };

  // Password reset functionality
  const resetPassword = async (email: string) => {
    try {
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      console.log("🔄 [ENHANCED-AUTH] Sending password reset email...");
      
      const origin = window.location.origin || 'http://localhost:5173';
      const redirectTo = `${origin}/auth`;
      
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

  const signInWithGoogle = async () => {
    try {
      cleanupAuthState();
      
      const origin = window.location.origin || 'http://localhost:5173';
      const redirectTo = `${origin}/complete-profile`;
      
      securityManager.logSecurityEvent({
        event_type: 'google_signin_initiated',
        event_details: { redirect_to: redirectTo },
        success: true
      });
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
        }
      });
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
