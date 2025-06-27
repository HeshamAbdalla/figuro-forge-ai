
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
    
    // Clean up auth state
    cleanupAuthState();
    
    // Load reCAPTCHA script
    loadRecaptchaScript().then((loaded) => {
      if (loaded) {
        logInfo("reCAPTCHA loaded successfully on auth page");
      } else {
        logInfo("reCAPTCHA failed to load, continuing without it");
      }
    });

    // Cleanup function to remove reCAPTCHA when leaving the page
    return () => {
      logDebug("Auth page unmounting, cleaning up reCAPTCHA");
      unloadRecaptchaScript();
    };
  }, []);

  // Redirect if already authenticated to Studio
  useEffect(() => {
    if (user && !isLoading) {
      logDebug("User already authenticated, redirecting to studio");
      navigate("/studio");
    }
  }, [user, isLoading, navigate]);

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
