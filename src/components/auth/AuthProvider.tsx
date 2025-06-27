
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState, getAuthErrorMessage } from "@/utils/authUtils";
import { sessionManager } from "@/utils/sessionManager";
import { sessionDebugger } from "@/utils/debugUtils";
import { getStudioUrl } from "@/utils/environmentUtils";
import { logDebug, logInfo, logError } from "@/utils/productionLogger";

interface AuthContextType {
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize debugging and monitoring
  useEffect(() => {
    logDebug('Initializing auth provider with debugging...');
    sessionDebugger.monitorConcurrentSessions();
    
    return () => {
      sessionManager.destroy();
    };
  }, []);

  // Refresh auth state with comprehensive error handling
  const refreshAuth = async () => {
    const refreshStart = performance.now();
    try {
      logDebug("Refreshing auth state...");
      
      // Initialize session with health check
      const sessionHealth = await sessionManager.initializeSession();
      logDebug("Session health check completed", sessionHealth);
      
      if (!sessionHealth.isValid) {
        logInfo("Session health issues detected", sessionHealth.issues);
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        sessionDebugger.logSessionError(error, 'Auth refresh - get session');
        return;
      }
      
      logDebug("Current session retrieved", { userEmail: session?.user?.email });
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch profile with enhanced error handling
      if (session?.user) {
        try {
          const profileData = await sessionManager.getProfile(session.user.id);
          setProfile(profileData);
          logInfo("Profile loaded successfully");
        } catch (error) {
          sessionDebugger.logSessionError(error, 'Auth refresh - profile fetch');
          logError("Profile fetch failed", error);
        }
      } else {
        setProfile(null);
      }
      
      const duration = performance.now() - refreshStart;
      logInfo(`Auth refresh completed in ${duration.toFixed(2)}ms`);
      
    } catch (error) {
      sessionDebugger.logSessionError(error, 'Auth refresh failed');
      logError("Error refreshing auth", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener with enhanced debugging
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        logDebug("Auth state changed", { event, userEmail: session?.user?.email });
        
        // Track auth events for debugging
        const authEvent = {
          event,
          userEmail: session?.user?.email,
          timestamp: new Date().toISOString(),
          sessionValid: !!session,
          hasAccessToken: !!session?.access_token
        };
        logDebug("Auth event details", authEvent);
        
        // Update state immediately for better UX
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events with enhanced monitoring
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user && mounted) {
            logInfo("User signed in, fetching profile...");
            // Defer profile fetching to prevent conflicts
            setTimeout(async () => {
              if (mounted) {
                try {
                  const profileData = await sessionManager.getProfile(session.user.id);
                  setProfile(profileData);
                  setIsLoading(false);
                  logInfo("Profile loaded after sign in");
                } catch (error) {
                  sessionDebugger.logSessionError(error, 'Profile fetch after sign in');
                  setIsLoading(false);
                }
              }
            }, 200);
          }
        } else if (event === 'SIGNED_OUT') {
          logInfo("User signed out, clearing data...");
          setProfile(null);
          sessionManager.clearCache();
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user && mounted) {
            logInfo("Initial session found, loading profile...");
            setTimeout(async () => {
              if (mounted) {
                try {
                  const profileData = await sessionManager.getProfile(session.user.id);
                  setProfile(profileData);
                  setIsLoading(false);
                  logInfo("Initial profile loaded");
                } catch (error) {
                  sessionDebugger.logSessionError(error, 'Initial profile fetch');
                  setIsLoading(false);
                }
              }
            }, 200);
          } else {
            logInfo("No initial session found");
            setIsLoading(false);
          }
        }
      }
    );

    // Check for existing session with enhanced error handling
    const initializeAuth = async () => {
      try {
        logDebug("Initializing authentication...");
        
        const initHealth = await sessionManager.initializeSession();
        logDebug("Initialization health check", initHealth);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          sessionDebugger.logSessionError(error, 'Auth initialization');
          logError("Error getting initial session", error);
        }
        
        if (mounted) {
          logDebug("Initial session check", { userEmail: session?.user?.email });
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            try {
              const profileData = await sessionManager.getProfile(session.user.id);
              setProfile(profileData);
              logInfo("Initial profile loaded successfully");
            } catch (error) {
              sessionDebugger.logSessionError(error, 'Initial profile load');
              logError("Initial profile load failed", error);
            }
          }
          
          setIsLoading(false);
          logInfo("Authentication initialization completed");
        }
      } catch (error) {
        sessionDebugger.logSessionError(error, 'Auth initialization failed');
        logError("Error initializing auth", error);
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

  // Enhanced fetchProfile with debugging
  const fetchProfile = async (userId: string) => {
    try {
      logDebug('Fetching profile for user', { userId });
      const profileData = await sessionManager.getProfile(userId, true); // Force refresh
      setProfile(profileData);
      logInfo('Profile fetched successfully', profileData);
    } catch (error) {
      sessionDebugger.logSessionError(error, 'fetchProfile');
      logError('Error in fetchProfile', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing auth state before attempting sign in
      cleanupAuthState();
      
      // Attempt global sign out to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        logInfo("Pre-signIn global sign out error (non-critical)", err);
      }
      
      // Log the attempt for debugging
      logDebug("Attempting sign-in", { email });
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      logDebug("Sign-in response", { hasError: !!error, hasData: !!data });
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        toast({
          title: "Error signing in",
          description: friendlyError,
          variant: "destructive",
        });
        return { error: friendlyError };
      }
      
      toast({
        title: "Signed in successfully",
      });
      
      return { error: null };
    } catch (error: any) {
      logError("Sign-in exception", error);
      const friendlyError = getAuthErrorMessage(error);
      toast({
        title: "Error signing in",
        description: friendlyError,
        variant: "destructive",
      });
      return { error: friendlyError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Attempt global sign out to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        logInfo("Pre-signUp global sign out error (non-critical)", err);
      }
      
      logDebug("Attempting sign-up", { email });
      
      // Use environment-aware redirect URL
      const redirectTo = getStudioUrl();
      logDebug("Using redirect URL", { redirectTo });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { plan: 'free' },
          emailRedirectTo: redirectTo
        }
      });
      
      logDebug("Sign-up response", { hasError: !!error, hasData: !!data });
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        toast({
          title: "Error signing up",
          description: friendlyError,
          variant: "destructive",
        });
        return { error: friendlyError, data: null };
      } else {
        const isEmailVerificationRequired = !data.session;
        
        toast({
          title: isEmailVerificationRequired ? "Verification email sent" : "Signup successful",
          description: isEmailVerificationRequired 
            ? "Please check your email (including spam folder) to confirm your account before signing in."
            : "Your account has been created successfully.",
        });
      }
      
      return { error: null, data };
    } catch (error: any) {
      logError("Sign-up exception", error);
      const friendlyError = getAuthErrorMessage(error);
      toast({
        title: "Error signing up",
        description: friendlyError,
        variant: "destructive",
      });
      return { error: friendlyError, data: null };
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload to ensure clean state
      window.location.href = '/auth';
      
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      const friendlyError = getAuthErrorMessage(error);
      toast({
        title: "Error signing out",
        description: friendlyError,
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      const redirectTo = getStudioUrl();
      logDebug("Using Google redirect URL", { redirectTo });
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
        }
      });
    } catch (error: any) {
      const friendlyError = getAuthErrorMessage(error);
      toast({
        title: "Error signing in with Google",
        description: friendlyError,
        variant: "destructive",
      });
    }
  };
  
  const resendVerificationEmail = async (email: string) => {
    try {
      logDebug("Resending verification email", { email });
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      logDebug("Resend response", { hasError: !!error });
      
      if (error) {
        const friendlyError = getAuthErrorMessage(error);
        toast({
          title: "Error sending verification email",
          description: friendlyError,
          variant: "destructive",
        });
        return { error: friendlyError };
      }
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox (including spam folder) for the verification link.",
      });
      
      return { error: null };
    } catch (error: any) {
      logError("Resend verification exception", error);
      const friendlyError = getAuthErrorMessage(error);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
