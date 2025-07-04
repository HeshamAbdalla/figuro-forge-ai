
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useUpgradeNotifications } from "@/hooks/useUpgradeNotifications";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import VantaBackground from "@/components/VantaBackground";
import StudioBreadcrumb from "@/components/studio/StudioBreadcrumb";
import EnhancedPromptForm from "@/components/studio/EnhancedPromptForm";
import StreamlinedImagePreview from "@/components/studio/StreamlinedImagePreview";
import ImageTo3DConfigModal from "@/components/studio/ImageTo3DConfigModal";
import ModelViewer from "@/components/model-viewer";
import DebugUpgradeButtons from "@/components/upgrade/DebugUpgradeButtons";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2, Sparkles, Stars, Zap } from "lucide-react";

const ImageTo3D = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  const [configModalOpen, setConfigModalOpen] = useState(false);
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
    isGeneratingImage,
    generatedImage,
    generationProgress,
    handleGenerate: originalHandleGenerate,
  } = useImageGeneration();

  const {
    isGenerating,
    progress,
    generate3DModel,
  } = useGallery3DGeneration();

  const handleGenerate = useCallback(async (prompt: string, style: string): Promise<void> => {
    try {
      console.log('🎨 [IMAGE-TO-3D] Starting image generation with:', { prompt, style });
      await originalHandleGenerate(prompt, style);
    } catch (error: any) {
      console.log('❌ [IMAGE-TO-3D] Image generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [IMAGE-TO-3D] Showing upgrade notification for image_generation');
        showUpgradeNotification("image_generation");
      } else {
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate image",
          variant: "destructive",
        });
      }
    }
  }, [originalHandleGenerate, showUpgradeNotification, toast]);

  const handleQuickConvert = useCallback(async () => {
    if (!generatedImage) {
      toast({
        title: "No Image",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('⚡ [IMAGE-TO-3D] Starting quick convert');
      await generate3DModel(generatedImage, `generated-${Date.now()}.jpg`);
    } catch (error: any) {
      console.log('❌ [IMAGE-TO-3D] Quick convert failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [IMAGE-TO-3D] Showing upgrade notification for model_conversion');
        showUpgradeNotification("model_conversion");
      } else {
        toast({
          title: "Conversion Failed",
          description: error.message || "Failed to convert to 3D",
          variant: "destructive",
        });
      }
    }
  }, [generatedImage, generate3DModel, showUpgradeNotification, toast]);

  const handleOpenConfigModal = useCallback(() => {
    if (!generatedImage) {
      toast({
        title: "No Image",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }
    setConfigModalOpen(true);
  }, [generatedImage, toast]);

  const handleGenerate3DWithConfig = useCallback(async (config: any) => {
    if (!generatedImage) return;

    try {
      console.log('⚙️ [IMAGE-TO-3D] Starting 3D generation with config:', config);
      setConfigModalOpen(false);
      await generate3DModel(generatedImage, `generated-${Date.now()}.jpg`, config);
    } catch (error: any) {
      console.log('❌ [IMAGE-TO-3D] 3D generation with config failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [IMAGE-TO-3D] Showing upgrade notification for model_conversion');
        showUpgradeNotification("model_conversion");
      } else {
        toast({
          title: "3D Generation Failed",
          description: error.message || "Failed to generate 3D model",
          variant: "destructive",
        });
      }
    }
  }, [generatedImage, generate3DModel, showUpgradeNotification, toast, setConfigModalOpen]);

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
                  {[Wand2, Stars, Zap].map((Icon, index) => (
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
                    ✨ Image to 3D Magic ✨
                  </span>
                </motion.div>

                <StudioBreadcrumb 
                  currentPage="Image to 3D"
                  description="Transform your images into stunning 3D models with AI magic"
                />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Left Panel - Image Generation */}
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
                          <Wand2 className="w-6 h-6 text-white" />
                        </motion.div>

                        <span className="text-transparent bg-gradient-to-r from-white to-figuro-accent bg-clip-text">
                          Generate Image
                        </span>
                      </motion.h2>

                      <EnhancedPromptForm
                        onGenerate={handleGenerate}
                        isGenerating={isGeneratingImage}
                      />
                      
                      {/* Enhanced Progress Display */}
                      <AnimatePresence>
                        {generationProgress && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="mt-6 p-6 bg-gradient-to-br from-black/20 to-black/30 rounded-2xl border border-white/10 backdrop-blur-sm"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm text-white/90 capitalize font-medium flex items-center gap-2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                  <Sparkles className="w-4 h-4 text-figuro-accent" />
                                </motion.div>
                                {generationProgress.stage.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-figuro-accent font-semibold">
                                {generationProgress.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-3 mb-3 overflow-hidden">
                              <motion.div 
                                className="bg-gradient-to-r from-figuro-accent to-purple-400 h-3 rounded-full relative"
                                style={{ width: `${generationProgress.progress}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${generationProgress.progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                              </motion.div>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed">
                              {generationProgress.message}
                              {generationProgress.retryAttempt && generationProgress.retryAttempt > 0 && (
                                <span className="ml-2 text-yellow-400 font-medium">
                                  (Attempt {generationProgress.retryAttempt + 1})
                                </span>
                              )}
                              {generationProgress.modelUsed && generationProgress.stage === 'completed' && (
                                <span className="ml-2 text-green-400 font-medium">
                                  via {generationProgress.modelUsed}
                                </span>
                              )}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <AnimatePresence>
                    {generatedImage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="relative backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 border border-white/20 hover:border-figuro-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-figuro-accent/25 group overflow-hidden"
                      >
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white to-figuro-accent bg-clip-text mb-6">
                            Generated Image
                          </h3>
                          <StreamlinedImagePreview
                            imageSrc={generatedImage}
                            isLoading={isGeneratingImage}
                            onConvertTo3D={handleQuickConvert}
                            onOpenConfig={handleOpenConfigModal}
                            isConverting={isGenerating}
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
                          3D Model Preview
                        </span>
                      </motion.h2>
                      
                      <div className="flex-1">
                        {progress.modelUrl ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-2xl overflow-hidden border border-white/10"
                          >
                            <ModelViewer
                              modelUrl={progress.modelUrl}
                              isLoading={isGenerating}
                              errorMessage={null}
                              onCustomModelLoad={(url, file) => {}}
                            />
                          </motion.div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-white/60 border-2 border-dashed border-white/20 rounded-2xl relative overflow-hidden">
                            {/* Background glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/5 to-purple-500/5 animate-pulse" />
                            
                            {isGenerating ? (
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center relative z-10"
                              >
                                <motion.div
                                  className="relative mb-6"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                  <div className="w-16 h-16 border-4 border-figuro-accent border-t-transparent rounded-full mx-auto" />
                                  <motion.div
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  >
                                    <Zap className="w-6 h-6 text-figuro-accent" />
                                  </motion.div>
                                </motion.div>

                                <p className="text-xl font-semibold text-white mb-4">
                                  Converting image to 3D model...
                                </p>

                                <div className="w-80 bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
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

                                <p className="text-lg font-medium text-figuro-accent mb-2">
                                  {progress.progress || 0}% complete
                                </p>
                                {progress.message && (
                                  <p className="text-sm text-white/70">{progress.message}</p>
                                )}
                              </motion.div>
                            ) : (
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center relative z-10"
                              >
                                <motion.div 
                                  className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                >
                                  <ArrowRight className="w-12 h-12 text-figuro-accent" />
                                </motion.div>
                                <p className="text-xl font-semibold text-white mb-2">
                                  Generate an image and convert it to 3D
                                </p>
                                <p className="text-white/70">
                                  Your magical 3D model will appear here
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
        <ImageTo3DConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          onGenerate={handleGenerate3DWithConfig}
          isGenerating={isGenerating}
          imageUrl={generatedImage}
        />

        {/* Debug Buttons - Remove in production */}
        {process.env.NODE_ENV === 'development' && <DebugUpgradeButtons />}
      </div>
    </SecurityEnforcedRoute>
  );
};

export default ImageTo3D;
