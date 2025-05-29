
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthForm } from "@/components/auth/AuthForm";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Shield, Lock, Mail, Activity } from "lucide-react";
import { cleanupAuthState } from "@/utils/authUtils";
import { Badge } from "@/components/ui/badge";

const Auth = () => {
  const { user, isLoading, securityScore } = useEnhancedAuth();
  const navigate = useNavigate();
  
  // Clean up auth state when mounting the auth page
  useEffect(() => {
    cleanupAuthState();
  }, []);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-figuro-dark via-figuro-darker to-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Content */}
            <div className="space-y-8 lg:pr-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent">
                  Welcome to Figuro.AI
                </h1>
                <p className="text-xl text-white/70 leading-relaxed">
                  Transform your ideas into stunning 3D figurines with the power of AI. 
                  Join thousands of creators bringing their imagination to life.
                </p>
              </div>

              {/* Enhanced security features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-figuro-accent/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-figuro-accent" />
                  </div>
                  <div className="flex-1">
                    <span>Enterprise-grade security protection</span>
                    <Badge variant="secondary" className="ml-2">
                      Enhanced
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-figuro-accent/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-figuro-accent" />
                  </div>
                  <span>Advanced password security validation</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-figuro-accent/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-figuro-accent" />
                  </div>
                  <span>Real-time security monitoring & alerts</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-figuro-accent/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-figuro-accent" />
                  </div>
                  <span>Secure email verification system</span>
                </div>
              </div>

              {/* Enhanced email verification notice */}
              <Alert className="bg-figuro-accent/10 border-figuro-accent/30 backdrop-blur-sm">
                <Info className="h-4 w-4 text-figuro-accent" />
                <AlertDescription className="text-white/90">
                  <strong>Enhanced Security:</strong> After signing up, please check your email inbox (and spam folder) 
                  for the verification link. Our advanced security system monitors all authentication activities 
                  and protects your account from unauthorized access.
                </AlertDescription>
              </Alert>

              {/* Security features list */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-figuro-accent" />
                  Security Features
                </h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Rate limiting protection against brute force attacks</li>
                  <li>• Comprehensive audit logging of all activities</li>
                  <li>• Strong password requirements and validation</li>
                  <li>• IP-based security monitoring</li>
                  <li>• Automated suspicious activity detection</li>
                  <li>• Secure session management</li>
                </ul>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <AuthForm />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Auth;
