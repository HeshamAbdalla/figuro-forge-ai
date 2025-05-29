import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState, getAuthErrorMessage } from "@/utils/authUtils";
import { sessionManager } from "@/utils/sessionManager";
import { sessionDebugger } from "@/utils/debugUtils";
import { securityManager } from "@/utils/securityUtils";

interface EnhancedAuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
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

  // Calculate security score based on various factors
  const calculateSecurityScore = (user: User | null, session: Session | null): number => {
    let score = 0;
    
    if (user?.email_confirmed_at) score += 25;
    if (user?.phone_confirmed_at) score += 15;
    if (session?.access_token) score += 20;
    if (user?.app_metadata?.provider === 'google') score += 10;
    
    // Check for recent login - use expires_at instead of issued_at
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilExpiry > 0) score += 20;
      else if (hoursUntilExpiry > -168) score += 10; // 1 week grace period
    }
    
    // Check for suspicious activity
    if (user && session && securityManager.detectSuspiciousActivity(user, session)) {
      score -= 30;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  // Enhanced refresh auth with security monitoring
  const refreshAuth = async () => {
    const refreshStart = performance.now();
    try {
      console.log("🔄 [ENHANCED-AUTH] Refreshing auth state with security monitoring...");
      
      const sessionHealth = await sessionManager.initializeSession();
      console.log("📊 [ENHANCED-AUTH] Session health:", sessionHealth);
      
      if (!sessionHealth.isValid) {
        console.warn("⚠️ [ENHANCED-AUTH] Session health issues:", sessionHealth.issues);
        await securityManager.logSecurityEvent({
          event_type: 'session_health_warning',
          event_details: { issues: sessionHealth.issues },
          success: false
        });
        setSession(null);
        setUser(null);
        setProfile(null);
        setSecurityScore(0);
        return;
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        sessionDebugger.logSessionError(error, 'Enhanced auth refresh - get session');
        await securityManager.logSecurityEvent({
          event_type: 'session_error',
          event_details: { error: error.message },
          success: false
        });
        return;
      }
      
      console.log("🔍 [ENHANCED-AUTH] Current session:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Calculate and update security score
      const newSecurityScore = calculateSecurityScore(session?.user ?? null, session);
      setSecurityScore(newSecurityScore);
      
      if (session?.user) {
        try {
          const profileData = await sessionManager.getProfile(session.user.id);
          setProfile(profileData);
          console.log("✅ [ENHANCED-AUTH] Profile loaded successfully");
          
          // Log successful auth refresh
          await securityManager.logSecurityEvent({
            event_type: 'auth_refresh_success',
            event_details: { 
              user_id: session.user.id,
              security_score: newSecurityScore
            },
            success: true
          });
        } catch (error) {
          sessionDebugger.logSessionError(error, 'Enhanced auth refresh - profile fetch');
          console.error("❌ [ENHANCED-AUTH] Profile fetch failed:", error);
          
          await securityManager.logSecurityEvent({
            event_type: 'profile_fetch_error',
            event_details: { error: error instanceof Error ? error.message : 'Unknown error' },
            success: false
          });
        }
      } else {
        setProfile(null);
        setSecurityScore(0);
      }
      
      console.log("✅ [ENHANCED-AUTH] Auth refresh completed in", performance.now() - refreshStart, "ms");
      
    } catch (error) {
      sessionDebugger.logSessionError(error, 'Enhanced auth refresh failed');
      console.error("❌ [ENHANCED-AUTH] Error refreshing auth:", error);
      
      await securityManager.logSecurityEvent({
        event_type: 'auth_refresh_error',
        event_details: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("🔄 [ENHANCED-AUTH] Auth state changed:", event, session?.user?.email);
        
        // Log auth event for security monitoring
        await securityManager.logSecurityEvent({
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
        
        // Update security score
        const newSecurityScore = calculateSecurityScore(session?.user ?? null, session);
        setSecurityScore(newSecurityScore);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user && mounted) {
            console.log("👤 [ENHANCED-AUTH] User signed in, fetching profile...");
            setTimeout(async () => {
              if (mounted) {
                try {
                  const profileData = await sessionManager.getProfile(session.user.id);
                  setProfile(profileData);
                  setIsLoading(false);
                  console.log("✅ [ENHANCED-AUTH] Profile loaded after sign in");
                } catch (error) {
                  sessionDebugger.logSessionError(error, 'Enhanced profile fetch after sign in');
                  setIsLoading(false);
                }
              }
            }, 200);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("👋 [ENHANCED-AUTH] User signed out, clearing data...");
          setProfile(null);
          setSecurityScore(0);
          sessionManager.clearCache();
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user && mounted) {
            console.log("🚀 [ENHANCED-AUTH] Initial session found, loading profile...");
            setTimeout(async () => {
              if (mounted) {
                try {
                  const profileData = await sessionManager.getProfile(session.user.id);
                  setProfile(profileData);
                  setIsLoading(false);
                  console.log("✅ [ENHANCED-AUTH] Initial profile loaded");
                } catch (error) {
                  sessionDebugger.logSessionError(error, 'Enhanced initial profile fetch');
                  setIsLoading(false);
                }
              }
            }, 200);
          } else {
            console.log("❌ [ENHANCED-AUTH] No initial session found");
            setIsLoading(false);
          }
        }
      }
    );

    // Initialize auth with security monitoring
    const initializeAuth = async () => {
      try {
        console.log("🚀 [ENHANCED-AUTH] Initializing enhanced authentication...");
        
        const initHealth = await sessionManager.initializeSession();
        console.log("📊 [ENHANCED-AUTH] Initialization health:", initHealth);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          sessionDebugger.logSessionError(error, 'Enhanced auth initialization');
          console.error("❌ [ENHANCED-AUTH] Error getting initial session:", error);
        }
        
        if (mounted) {
          console.log("🔍 [ENHANCED-AUTH] Initial session check:", session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          
          // Calculate initial security score
          const initialSecurityScore = calculateSecurityScore(session?.user ?? null, session);
          setSecurityScore(initialSecurityScore);
          
          if (session?.user) {
            try {
              const profileData = await sessionManager.getProfile(session.user.id);
              setProfile(profileData);
              console.log("✅ [ENHANCED-AUTH] Initial profile loaded successfully");
              
              // Log successful initialization
              await securityManager.logSecurityEvent({
                event_type: 'auth_initialization_success',
                event_details: { 
                  user_id: session.user.id,
                  security_score: initialSecurityScore
                },
                success: true
              });
            } catch (error) {
              sessionDebugger.logSessionError(error, 'Enhanced initial profile load');
              console.error("❌ [ENHANCED-AUTH] Initial profile load failed:", error);
            }
          }
          
          setIsLoading(false);
          console.log("✅ [ENHANCED-AUTH] Enhanced authentication initialization completed");
        }
      } catch (error) {
        sessionDebugger.logSessionError(error, 'Enhanced auth initialization failed');
        console.error("❌ [ENHANCED-AUTH] Error initializing enhanced auth:", error);
        
        await securityManager.logSecurityEvent({
          event_type: 'auth_initialization_error',
          event_details: { error: error instanceof Error ? error.message : 'Unknown error' },
          success: false
        });
        
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

  // Enhanced sign in with security validation
  const signIn = async (email: string, password: string) => {
    try {
      // Validate input
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Check rate limit
      const canProceed = await securityManager.checkRateLimit('auth_signin', 5, 15);
      if (!canProceed) {
        throw new Error('Too many sign in attempts. Please try again later.');
      }

      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("Pre-signIn global sign out error (non-critical):", err);
      }
      
      console.log("Attempting enhanced sign-in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log("Enhanced sign-in response:", error ? "Error" : "Success", error || data);
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        
        // Log failed sign in attempt
        await securityManager.logSecurityEvent({
          event_type: 'signin_failed',
          event_details: { 
            email, 
            error: error.message,
            friendly_error: friendlyError
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
      
      // Log successful sign in
      await securityManager.logSecurityEvent({
        event_type: 'signin_success',
        event_details: { 
          email,
          user_id: data.user?.id
        },
        success: true
      });
      
      toast({
        title: "Signed in successfully",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Enhanced sign-in exception:", error);
      const friendlyError = getAuthErrorMessage(error);
      
      await securityManager.logSecurityEvent({
        event_type: 'signin_exception',
        event_details: { 
          email, 
          error: error.message
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
  };

  // Enhanced sign up with password validation
  const signUp = async (email: string, password: string) => {
    try {
      // Validate input
      if (!securityManager.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = securityManager.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('. '));
      }

      // Check rate limit
      const canProceed = await securityManager.checkRateLimit('auth_signup', 3, 60);
      if (!canProceed) {
        throw new Error('Too many sign up attempts. Please try again later.');
      }

      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("Pre-signUp global sign out error (non-critical):", err);
      }
      
      console.log("Attempting enhanced sign-up with email:", email);
      
      const origin = window.location.origin || 'http://localhost:5173';
      const redirectTo = `${origin}/complete-profile`;
      console.log("Using redirect URL:", redirectTo);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { plan: 'free' },
          emailRedirectTo: redirectTo
        }
      });
      
      console.log("Enhanced sign-up response:", error ? "Error" : "Success", error || data);
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        
        // Log failed sign up attempt
        await securityManager.logSecurityEvent({
          event_type: 'signup_failed',
          event_details: { 
            email, 
            error: error.message,
            friendly_error: friendlyError
          },
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
        
        // Log successful sign up
        await securityManager.logSecurityEvent({
          event_type: 'signup_success',
          event_details: { 
            email,
            user_id: data.user?.id,
            email_verification_required: isEmailVerificationRequired
          },
          success: true
        });
        
        toast({
          title: isEmailVerificationRequired ? "Verification email sent" : "Signup successful",
          description: isEmailVerificationRequired 
            ? "Please check your email (including spam folder) to confirm your account before signing in."
            : "Your account has been created successfully.",
        });
      }
      
      return { error: null, data };
    } catch (error: any) {
      console.error("Enhanced sign-up exception:", error);
      const friendlyError = getAuthErrorMessage(error);
      
      await securityManager.logSecurityEvent({
        event_type: 'signup_exception',
        event_details: { 
          email, 
          error: error.message
        },
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

  // Enhanced sign out with security logging
  const signOut = async () => {
    try {
      const currentUserId = user?.id;
      
      // Log sign out attempt
      await securityManager.logSecurityEvent({
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
      
      await securityManager.logSecurityEvent({
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
      console.log("Using Google redirect URL:", redirectTo);
      
      await securityManager.logSecurityEvent({
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
      
      await securityManager.logSecurityEvent({
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
      console.log("Resending verification email to:", email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      console.log("Resend response:", error ? "Error" : "Success", error || "Email sent");
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        
        await securityManager.logSecurityEvent({
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
      
      await securityManager.logSecurityEvent({
        event_type: 'verification_resend_success',
        event_details: { email },
        success: true
      });
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox (including spam folder) for the verification link.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Resend verification exception:", error);
      const friendlyError = getAuthErrorMessage(error);
      
      await securityManager.logSecurityEvent({
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
