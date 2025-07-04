
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useWebIconsGeneration } from "@/hooks/useWebIconsGeneration";
import { useUpgradeNotifications } from "@/hooks/useUpgradeNotifications";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import VantaBackground from "@/components/VantaBackground";
import StudioBreadcrumb from "@/components/studio/StudioBreadcrumb";
import WebIconsForm from "@/components/studio/WebIconsForm";
import WebIconsPreview from "@/components/studio/WebIconsPreview";
import DebugUpgradeButtons from "@/components/upgrade/DebugUpgradeButtons";
import { Palette, Sparkles, Stars, Zap, Wand2 } from "lucide-react";

const WebIcons = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  
  const { showUpgradeNotification } = useUpgradeNotifications();

  // Mouse tracking for magical effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  const {
    isGenerating,
    generatedIcon,
    generateIcon,
    clearIcon
  } = useWebIconsGeneration();

  const handleIconGeneration = useCallback(async (prompt: string, options: { category: string; size: string; style: string }) => {
    try {
      console.log('🎨 [WEB-ICONS] Starting icon generation with:', { prompt, options });
      await generateIcon(prompt, options);
    } catch (error: any) {
      console.log('❌ [WEB-ICONS] Icon generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [WEB-ICONS] Showing upgrade notification for image_generation');
        showUpgradeNotification("image_generation");
      } else {
        toast({
          title: "Icon Generation Failed",
          description: error.message || "Failed to generate web icon",
          variant: "destructive",
        });
      }
    }
  }, [generateIcon, showUpgradeNotification, toast]);

  const handleIconDownload = useCallback((format: string) => {
    if (!generatedIcon) return;
    
    const link = document.createElement('a');
    link.href = generatedIcon;
    link.download = `web-icon.${format}`;
    link.click();
  }, [generatedIcon]);

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

        {/* Mouse Follower Effect */}
        <motion.div
          className="fixed w-32 h-32 pointer-events-none"
          style={{
            left: mousePosition.x - 64,
            top: mousePosition.y - 64,
            zIndex: 1,
          }}
          animate={{
            scale: hoveredSection ? 1.2 : 0.8,
            opacity: hoveredSection ? 0.6 : 0.3,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
          <div className="w-full h-full bg-gradient-to-r from-figuro-accent/20 to-purple-400/20 rounded-full blur-2xl" />
        </motion.div>

        <VantaBackground>
          <Header />
          <div className="pt-20">
            <div className="container mx-auto px-4 py-8 relative">
              {/* Magical Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12 relative"
              >
                {/* Floating Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[Palette, Stars, Zap].map((Icon, index) => (
                    <motion.div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${15 + index * 35}%`,
                        top: `${5 + index * 10}%`,
                      }}
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2.5 + index,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3,
                      }}
                    >
                      <Icon className="w-5 h-5 text-figuro-accent/40" />
                    </motion.div>
                  ))}
                </div>

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
                    ✨ Icon Creation Magic ✨
                  </span>
                </motion.div>

                <StudioBreadcrumb 
                  currentPage="Web Icons"
                  description="Generate custom icons for your web projects with AI magic"
                />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Left Panel - Icon Generation */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                  onHoverStart={() => setHoveredSection('generation')}
                  onHoverEnd={() => setHoveredSection(null)}
                >
                  <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/20 hover:border-figuro-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-figuro-accent/25 group overflow-hidden">
                    {/* Magical border effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-figuro-accent/10 via-purple-400/10 to-figuro-accent/10 opacity-0 group-hover:opacity-100"
                      animate={{
                        background: [
                          "linear-gradient(0deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                          "linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                          "linear-gradient(180deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                          "linear-gradient(270deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                          "linear-gradient(360deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                        ]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="relative z-10">
                      <motion.h2 
                        className="text-3xl font-bold mb-6 flex items-center gap-3"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-figuro-accent to-purple-500 flex items-center justify-center"
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Palette className="w-6 h-6 text-white" />
                        </motion.div>

                        <span className="text-transparent bg-gradient-to-r from-white to-figuro-accent bg-clip-text">
                          Generate Icon
                        </span>
                      </motion.h2>

                      <WebIconsForm
                        onGenerate={handleIconGeneration}
                        isGenerating={isGenerating}
                      />
                    </div>
                  </div>

                  {/* Generation Progress */}
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        className="relative backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-6 border border-white/20 hover:border-figuro-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-figuro-accent/25 group overflow-hidden"
                      >
                        <div className="relative z-10">
                          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="w-5 h-5 text-figuro-accent" />
                            </motion.div>
                            Generation Progress
                          </h3>
                          <div className="space-y-3">
                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                              <motion.div 
                                className="bg-gradient-to-r from-figuro-accent to-purple-400 h-3 rounded-full relative"
                                animate={{ width: ["0%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                              </motion.div>
                            </div>
                            <p className="text-white/80 text-sm">Creating your magical icon...</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Right Panel - Icon Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                  onHoverStart={() => setHoveredSection('preview')}
                  onHoverEnd={() => setHoveredSection(null)}
                >
                  <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/20 hover:border-figuro-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-figuro-accent/25 group overflow-hidden h-[700px]">
                    {/* Magical border effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-figuro-accent/10 via-purple-400/10 to-figuro-accent/10 opacity-0 group-hover:opacity-100"
                      animate={{
                        background: [
                          "linear-gradient(0deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                          "linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                          "linear-gradient(180deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                          "linear-gradient(270deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                          "linear-gradient(360deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))",
                        ]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="relative z-10 h-full flex flex-col">
                      <motion.h2 
                        className="text-3xl font-bold mb-6 flex items-center gap-3"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <motion.div
                          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Stars className="w-6 h-6 text-white" />
                        </motion.div>

                        <span className="text-transparent bg-gradient-to-r from-white to-purple-400 bg-clip-text">
                          Icon Preview
                        </span>
                      </motion.h2>
                      
                      <div className="flex-1">
                        <WebIconsPreview
                          iconUrl={generatedIcon}
                          isLoading={isGenerating}
                          onClear={clearIcon}
                          onDownload={handleIconDownload}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </VantaBackground>

        {/* Debug Buttons - Remove in production */}
        {process.env.NODE_ENV === 'development' && <DebugUpgradeButtons />}
      </div>
    </SecurityEnforcedRoute>
  );
};

export default WebIcons;
