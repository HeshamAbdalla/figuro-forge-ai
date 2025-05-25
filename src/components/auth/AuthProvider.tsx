import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState, getAuthErrorMessage } from "@/utils/authUtils";

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

  // Refresh auth state
  const refreshAuth = async () => {
    try {
      console.log("Refreshing auth state...");
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return;
      }
      
      console.log("Current session:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch fresh profile data if user exists
      if (session?.user) {
        console.log("Fetching fresh profile for user:", session.user.id);
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener with non-async callback to prevent deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, session?.user?.email);
        
        // Update state immediately for better UX
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events with deferred profile fetching
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user && mounted) {
            // Defer profile fetching to prevent conflicts
            setTimeout(async () => {
              if (mounted) {
                await fetchProfile(session.user.id);
                setIsLoading(false);
              }
            }, 200);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsLoading(false);
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user && mounted) {
            setTimeout(async () => {
              if (mounted) {
                await fetchProfile(session.user.id);
                setIsLoading(false);
              }
            }, 200);
          } else {
            setIsLoading(false);
          }
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
        }
        
        if (mounted) {
          console.log("Initial session check:", session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
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

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile fetched:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
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
        console.log("Pre-signIn global sign out error (non-critical):", err);
      }
      
      // Log the attempt for debugging
      console.log("Attempting sign-in with email:", email);
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log("Sign-in response:", error ? "Error" : "Success", error || data);
      
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
      console.error("Sign-in exception:", error);
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
        console.log("Pre-signUp global sign out error (non-critical):", err);
      }
      
      console.log("Attempting sign-up with email:", email);
      
      // Make sure we have the correct redirect URL
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
      
      console.log("Sign-up response:", error ? "Error" : "Success", error || data);
      
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
      console.error("Sign-up exception:", error);
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
      
      const origin = window.location.origin || 'http://localhost:5173';
      const redirectTo = `${origin}/complete-profile`;
      console.log("Using Google redirect URL:", redirectTo);
      
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
      console.log("Resending verification email to:", email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      console.log("Resend response:", error ? "Error" : "Success", error || "Email sent");
      
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
      console.error("Resend verification exception:", error);
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
