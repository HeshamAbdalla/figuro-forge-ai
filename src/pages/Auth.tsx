import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthForm } from "@/components/auth/AuthForm";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Sparkles, Zap, Users, Rocket } from "lucide-react";
import { cleanupAuthState } from "@/utils/authUtils";
import { Badge } from "@/components/ui/badge";
const Auth = () => {
  const {
    user,
    isLoading
  } = useEnhancedAuth();
  const navigate = useNavigate();

  // Clean up auth state when mounting the auth page
  useEffect(() => {
    cleanupAuthState();
  }, []);

  // Redirect if already authenticated to Studio
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/studio");
    }
  }, [user, isLoading, navigate]);
  return <div className="min-h-screen bg-gradient-to-br from-figuro-dark via-figuro-darker to-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Content */}
            <div className="space-y-8 lg:pr-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent">Welcome to Figuros.AI</h1>
                
              </div>

              {/* Exciting features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-figuro-accent/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-figuro-accent" />
                  </div>
                  <div className="flex-1">
                    <span>Instant AI-powered 3D creation magic</span>
                    
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-figuro-accent/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-figuro-accent" />
                  </div>
                  <span>Lightning-fast results that will blow your mind</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-figuro-accent/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-figuro-accent" />
                  </div>
                  <span>Vibrant community of passionate creators</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-figuro-accent/20 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-figuro-accent" />
                  </div>
                  <span>Turn ideas into reality in minutes, not hours</span>
                </div>
              </div>

              {/* Inspiring call-to-action */}
              

              {/* Success stories showcase */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-figuro-accent" />
                  What You Can Create
                </h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Fantasy characters and mythical creatures</li>
                  <li>• Custom action figures and collectibles</li>
                  <li>• Architectural models and prototypes</li>
                  <li>• Personalized gifts and decorations</li>
                  <li>• Game assets and miniatures</li>
                  <li>• Educational models and teaching aids</li>
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
    </div>;
};
export default Auth;