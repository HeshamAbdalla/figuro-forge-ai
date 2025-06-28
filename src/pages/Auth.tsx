
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHero } from "@/components/auth/AuthHero";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cleanupAuthState } from "@/utils/authUtils";
import { loadRecaptchaScript, unloadRecaptchaScript } from "@/utils/recaptchaUtils";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { logDebug, logInfo } from "@/utils/productionLogger";

const Auth = () => {
  const { user, isLoading } = useEnhancedAuth();
  const navigate = useNavigate();

  // Load reCAPTCHA script when Auth page mounts
  useEffect(() => {
    logDebug("Auth page mounted, loading reCAPTCHA and cleaning up auth state");
    
    cleanupAuthState();
    
    loadRecaptchaScript().then((loaded) => {
      if (loaded) {
        logInfo("reCAPTCHA loaded successfully on auth page");
      } else {
        logInfo("reCAPTCHA failed to load, continuing without it");
      }
    });

    return () => {
      logDebug("Auth page unmounting, cleaning up reCAPTCHA");
      unloadRecaptchaScript();
    };
  }, []);

  // OAuth-friendly redirect handling
  useEffect(() => {
    if (user && !isLoading) {
      const provider = user.app_metadata?.provider;
      const isOAuth = provider && provider !== 'email';
      
      logDebug("Authenticated user detected on auth page", { 
        provider,
        isOAuth,
        userId: user.id,
        currentPath: window.location.pathname
      });
      
      // OAuth users go directly to studio-hub
      if (isOAuth) {
        logInfo("OAuth user detected, redirecting to studio-hub");
        navigate("/studio-hub", { replace: true });
      } else {
        logInfo("Email user detected, redirecting to studio-hub");
        navigate("/studio-hub", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading state while redirecting authenticated users
  if (user && !isLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-figuro-accent mx-auto"></div>
          <p className="text-white mt-4">Redirecting to studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figuro-dark">
      <SEO 
        title="Sign In - Figuros.AI"
        description="Join thousands of creators using Figuros.AI to transform ideas into stunning 3D assets with AI-powered generation."
      />
      <Header />
      
      <main className="pt-20">
        <AuthHero />
        
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <AuthForm />
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
