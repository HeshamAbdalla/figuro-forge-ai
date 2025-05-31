
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface StudioAuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useStudioAuth = () => {
  const [authState, setAuthState] = useState<StudioAuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('🔄 [STUDIO-AUTH] Initializing...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [STUDIO-AUTH] Session error:', error);
        }

        if (mounted) {
          setAuthState({
            user: session?.user || null,
            session: session,
            isLoading: false,
            isAuthenticated: !!session?.user
          });
          console.log('✅ [STUDIO-AUTH] Initialized:', !!session?.user);
        }
      } catch (error) {
        console.error('❌ [STUDIO-AUTH] Init error:', error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 [STUDIO-AUTH] Auth state changed:', event);
        
        setAuthState({
          user: session?.user || null,
          session: session,
          isLoading: false,
          isAuthenticated: !!session?.user
        });
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return authState;
};
