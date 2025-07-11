import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import Header from "@/components/Header";
import VantaBackground from "@/components/VantaBackground";
import { Button } from "@/components/ui/button";
import { Images, Stars, Sparkles, Wand2 } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import SimpleErrorBoundary from "@/components/common/SimpleErrorBoundary";
import { RadialOrbitalTimeline } from "@/components/studio/timeline/RadialOrbitalTimeline";
import { studioNodes } from "@/components/studio/data/studioNodes";
import { TimelineNode } from "@/components/studio/types";

const StudioHub = () => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating particles animation
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  const handleNodeClick = (node: TimelineNode) => {
    navigate(node.path);
  };

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <div className="min-h-screen relative overflow-x-hidden overflow-y-auto">
        {/* Floating Particles */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-figuro-accent to-purple-400 rounded-full opacity-30"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <VantaBackground>
          <Header />
          <div className="pt-20">
            <div className="container mx-auto px-4 py-12">
              
              {/* Magical Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-16 relative"
              >
                <motion.div
                  className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-figuro-accent/10 backdrop-blur-xl rounded-full border border-figuro-accent/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-figuro-accent" />
                  </motion.div>
                  <span className="text-transparent bg-gradient-to-r from-figuro-accent to-purple-400 bg-clip-text font-semibold">
                    ✨ AI-Powered Creative Magic ✨
                  </span>
                </motion.div>

                <motion.h1 
                  className="text-5xl md:text-7xl font-bold mb-6 relative"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="text-transparent bg-gradient-to-r from-white via-figuro-accent to-purple-400 bg-clip-text">
                    Welcome to Your
                  </span>
                  <br />
                  <motion.span
                    className="text-transparent bg-gradient-to-r from-figuro-accent via-purple-400 to-pink-400 bg-clip-text"
                    animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    Magical Studio
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Step into a realm where imagination meets reality. Transform your wildest dreams into stunning 3D masterpieces with the power of AI magic.
                </motion.p>

                <motion.div 
                  className="flex items-center justify-center gap-4 text-figuro-accent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Stars className="w-5 h-5" />
                  </motion.div>
                  <span className="text-sm font-medium">Where Dreams Become Reality</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <Wand2 className="w-5 h-5" />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Orbital Timeline Interface */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="max-w-7xl mx-auto mb-16"
              >
                <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-[600px]">
                      <div className="text-white">Loading 3D Timeline...</div>
                    </div>
                  }>
                    <SimpleErrorBoundary>
                      <RadialOrbitalTimeline
                        nodes={studioNodes}
                        onNodeClick={handleNodeClick}
                        className="h-[600px]"
                      />
                    </SimpleErrorBoundary>
                  </Suspense>
                </div>
              </motion.div>

              {/* Magical Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-center relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-figuro-accent/10 to-pink-500/10 rounded-3xl blur-xl" />
                
                <div className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10">
                  <motion.h3 
                    className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-figuro-accent bg-clip-text mb-6"
                    animate={{ 
                      backgroundPosition: ['0%', '100%', '0%'] 
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    ✨ Discover Magical Creations ✨
                  </motion.h3>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => navigate('/gallery')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <Images className="w-5 h-5 mr-2 relative z-10" />
                        <span className="relative z-10">Browse Gallery</span>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => navigate('/profile/figurines')}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <Stars className="w-5 h-5 mr-2 relative z-10" />
                        <span className="relative z-10">My Creations</span>
                      </Button>
                    </motion.div>
                  </div>

                  {/* Floating elements around the section */}
                  <div className="absolute -top-6 -left-6">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1] 
                      }}
                      transition={{ 
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Sparkles className="w-8 h-8 text-figuro-accent/50" />
                    </motion.div>
                  </div>
                  
                  <div className="absolute -bottom-6 -right-6">
                    <motion.div
                      animate={{ 
                        rotate: -360,
                        y: [0, -10, 0] 
                      }}
                      transition={{ 
                        rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Stars className="w-8 h-8 text-purple-400/50" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </VantaBackground>
      </div>
    </SecurityEnforcedRoute>
  );
};

export default StudioHub;