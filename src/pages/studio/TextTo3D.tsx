
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useUpgradeNotifications } from "@/hooks/useUpgradeNotifications";
import { useToast } from "@/hooks/use-toast";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import Header from "@/components/Header";
import VantaBackground from "@/components/VantaBackground";
import StudioBreadcrumb from "@/components/studio/StudioBreadcrumb";
import TextTo3DForm from "@/components/studio/TextTo3DForm";
import TextTo3DConfigModal from "@/components/studio/TextTo3DConfigModal";
import TextTo3DProgress from "@/components/studio/TextTo3DProgress";
import ModelViewer from "@/components/model-viewer";
import DebugUpgradeButtons from "@/components/upgrade/DebugUpgradeButtons";
import { Type, Sparkles, Stars, Zap, Wand2 } from "lucide-react";

const TextTo3D = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configPrompt, setConfigPrompt] = useState("");
  const { isMobile, isTablet } = useResponsiveLayout();
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
    currentTaskId,
    progress,
    generateModel,
    generateModelWithConfig,
  } = useTextTo3D();

  const handleTextTo3D = useCallback(async (prompt: string, artStyle: string, negativePrompt: string = "") => {
    try {
      console.log('📝 [TEXT-TO-3D] Starting generation with:', { prompt, artStyle, negativePrompt });
      return await generateModel(prompt, artStyle, negativePrompt);
    } catch (error: any) {
      console.log('❌ [TEXT-TO-3D] Generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [TEXT-TO-3D] Showing upgrade notification for model_conversion');
        showUpgradeNotification("model_conversion");
      } else {
        toast({
          title: "Text-to-3D Failed",
          description: error.message || "Failed to generate 3D model from text",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [generateModel, showUpgradeNotification, toast]);

  const handleOpenConfigModal = useCallback((prompt: string) => {
    setConfigPrompt(prompt);
    setConfigModalOpen(true);
  }, []);

  const handleTextTo3DWithConfig = useCallback(async (config: any): Promise<void> => {
    try {
      console.log('⚙️ [TEXT-TO-3D] Starting generation with config:', config);
      setConfigModalOpen(false);
      await generateModelWithConfig(config);
    } catch (error: any) {
      console.log('❌ [TEXT-TO-3D] Config generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [TEXT-TO-3D] Showing upgrade notification for model_conversion');
        showUpgradeNotification("model_conversion");
      } else {
        toast({
          title: "Text-to-3D Failed",
          description: error.message || "Failed to generate 3D model",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [generateModelWithConfig, showUpgradeNotification, toast, setConfigModalOpen]);

  const handleModelError = useCallback((error: string) => {
    toast({
      title: "Model Loading Error",
      description: error,
      variant: "destructive",
    });
  }, [toast]);

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
            <div className={`container mx-auto px-4 py-4 sm:py-8 relative ${isMobile ? 'max-w-full' : ''}`}>
              {/* Magical Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12 relative"
              >
                {/* Floating Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[Type, Stars, Zap].map((Icon, index) => (
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
                    ✨ Text to 3D Magic ✨
                  </span>
                </motion.div>

                <StudioBreadcrumb 
                  currentPage="Text to 3D"
                  description="Create 3D models from text descriptions using AI magic"
                />
              </motion.div>

              <div className={`grid grid-cols-1 ${
                isMobile ? 'gap-6 mt-6' : isTablet ? 'gap-6 mt-8' : 'lg:grid-cols-2 gap-8 mt-8'
              }`}>
                {/* Left Panel - Text Input */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className={`space-y-4 sm:space-y-6 ${isMobile ? 'order-1' : ''}`}
                  onHoverStart={() => setHoveredSection('input')}
                  onHoverEnd={() => setHoveredSection(null)}
                >
                  <div className={`relative backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/10 rounded-3xl border border-white/20 hover:border-figuro-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-figuro-accent/25 group overflow-hidden ${
                    isMobile ? 'p-4' : 'p-4 sm:p-8'
                  }`}>
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
                        className={`font-bold mb-4 flex items-center gap-2 ${
                          isMobile ? 'text-lg' : 'text-xl sm:text-3xl'
                        }`}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div
                          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-figuro-accent to-purple-500 flex items-center justify-center"
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Type className="w-6 h-6 text-white" />
                        </motion.div>

                        <span className="text-transparent bg-gradient-to-r from-white to-figuro-accent bg-clip-text truncate">
                          Describe Your Model
                        </span>
                      </motion.h2>

                      <TextTo3DForm
                        onGenerate={handleTextTo3D}
                        onOpenConfigModal={handleOpenConfigModal}
                        isGenerating={isGenerating}
                      />
                    </div>
                  </div>

                  {/* Progress Section */}
                  <AnimatePresence>
                    {(isGenerating || progress.modelUrl) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        className={`relative backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/10 rounded-3xl border border-white/20 hover:border-figuro-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-figuro-accent/25 group overflow-hidden ${
                          isMobile ? 'p-4' : 'p-4 sm:p-6'
                        }`}
                      >
                        <div className="relative z-10">
                          <h3 className={`font-semibold text-white mb-4 flex items-center gap-2 ${
                            isMobile ? 'text-base' : 'text-lg sm:text-xl'
                          }`}>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className={`text-figuro-accent flex-shrink-0 ${
                                isMobile ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
                              }`} />
                            </motion.div>
                            
                            <span className="truncate">Generation Progress</span>
                          </h3>
                          <TextTo3DProgress
                            taskId={currentTaskId}
                            status={progress.status}
                            progress={progress.progress}
                            modelUrl={progress.modelUrl}
                            localModelUrl={progress.localModelUrl}
                            thumbnailUrl={progress.thumbnailUrl}
                            downloadStatus={progress.downloadStatus}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Right Panel - 3D Model Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`space-y-4 sm:space-y-6 ${isMobile ? 'order-2' : ''}`}
                  onHoverStart={() => setHoveredSection('preview')}
                  onHoverEnd={() => setHoveredSection(null)}
                >
                  <div className={`relative backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/10 rounded-3xl border border-white/20 hover:border-figuro-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-figuro-accent/25 group overflow-hidden ${
                    isMobile ? 'p-4' : 'p-4 sm:p-6'
                  } ${
                    isMobile ? 'h-[350px]' : isTablet ? 'h-[450px]' : 'h-[600px]'
                  }`}>
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
                        className={`font-bold text-white mb-4 flex items-center gap-3 ${
                          isMobile ? 'text-lg' : 'text-xl sm:text-3xl'
                        }`}
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

                        <span className="text-transparent bg-gradient-to-r from-white to-purple-400 bg-clip-text truncate">
                          3D Model Preview
                        </span>
                      </motion.h2>
                      
                      <div className="flex-1">
                        {progress.modelUrl ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className={`rounded-2xl overflow-hidden border border-white/10 ${
                              isMobile ? 'h-[250px]' : isTablet ? 'h-[350px]' : 'h-[450px]'
                            }`}
                          >
                            <ModelViewer
                              modelUrl={progress.modelUrl}
                              isLoading={isGenerating}
                              errorMessage={null}
                              onCustomModelLoad={(url, file) => {}}
                            />
                          </motion.div>
                        ) : (
                          <div className={`flex flex-col items-center justify-center text-white/60 border-2 border-dashed border-white/20 rounded-2xl p-4 relative overflow-hidden ${
                            isMobile ? 'h-[250px]' : isTablet ? 'h-[350px]' : 'h-[450px]'
                          }`}>
                            {/* Background glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/5 to-purple-500/5 animate-pulse" />
                            
                            {isGenerating ? (
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center max-w-sm relative z-10"
                              >
                                <motion.div
                                  className="relative mb-6"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                  <div className="w-12 h-12 border-4 border-figuro-accent border-t-transparent rounded-full mx-auto" />
                                  <motion.div
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  >
                                    <Zap className="w-4 h-4 text-figuro-accent" />
                                  </motion.div>
                                </motion.div>

                                <p className={`break-words mb-2 text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>
                                  Generating 3D model from text...
                                </p>
                                <div className="w-full max-w-64 bg-white/10 rounded-full h-3 mt-4 overflow-hidden">
                                  <motion.div 
                                    className="bg-gradient-to-r from-figuro-accent to-purple-400 h-3 rounded-full relative"
                                    style={{ width: `${progress.progress || 0}%` }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress.progress || 0}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                  >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                                  </motion.div>
                                </div>
                                <p className={`mt-2 text-figuro-accent font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  {progress.progress || 0}% complete
                                </p>
                              </motion.div>
                            ) : (
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center max-w-sm relative z-10"
                              >
                                <motion.div 
                                  className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                >
                                  <Type className="w-10 h-10 text-figuro-accent" />
                                </motion.div>
                                <p className={`break-words mb-2 text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>
                                  Describe your 3D model in text
                                </p>
                                <p className={`break-words text-white/70 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  Your magical model will appear here
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </VantaBackground>

        {/* Config Modal */}
        <TextTo3DConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          onGenerate={handleTextTo3DWithConfig}
          isGenerating={isGenerating}
          initialPrompt={configPrompt}
        />

        {/* Debug Buttons - Remove in production */}
        {process.env.NODE_ENV === 'development' && <DebugUpgradeButtons />}
      </div>
    </SecurityEnforcedRoute>
  );
};

export default TextTo3D;
