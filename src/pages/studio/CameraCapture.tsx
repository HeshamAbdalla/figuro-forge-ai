
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useUpgradeNotifications } from "@/hooks/useUpgradeNotifications";
import { useToast } from "@/hooks/use-toast";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VantaBackground from "@/components/VantaBackground";
import StudioBreadcrumb from "@/components/studio/StudioBreadcrumb";
import EnhancedCameraWorkflow from "@/components/studio/camera/EnhancedCameraWorkflow";
import ModelViewer from "@/components/model-viewer";
import CompactProgressIndicator from "@/components/studio/camera/CompactProgressIndicator";
import DebugUpgradeButtons from "@/components/upgrade/DebugUpgradeButtons";
import { Camera, Sparkles, Stars, Zap, AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const CameraCapture = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  const { isMobile } = useResponsiveLayout();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  
  const { showUpgradeNotification } = useUpgradeNotifications();

  // Mouse tracking for magical effects (desktop only)
  useEffect(() => {
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

  // Floating particles (desktop only)
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  const {
    isGenerating,
    progress,
    generate3DModel,
  } = useGallery3DGeneration();

  const [conversionAttempts, setConversionAttempts] = useState(0);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const handleImageCapture = useCallback(async (imageBlob: Blob) => {
    try {
      console.log('📸 [CAMERA-CAPTURE] Starting 3D generation from camera image');
      console.log('📸 [CAMERA-CAPTURE] Image blob size:', imageBlob.size, 'bytes');
      console.log('📸 [CAMERA-CAPTURE] Image blob type:', imageBlob.type);
      
      setConversionAttempts(prev => prev + 1);
      
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imageDataUrl = reader.result as string;
          console.log('📸 [CAMERA-CAPTURE] Converted to data URL, size:', imageDataUrl.length);
          
          await generate3DModel(imageDataUrl, `camera-capture-${Date.now()}.jpg`);
          
          toast({
            title: "Conversion Started",
            description: "Your camera photo is being converted to 3D. This may take a few minutes.",
          });

          // On mobile, automatically show preview when conversion starts
          if (isMobile) {
            setShowMobilePreview(true);
          }
        } catch (conversionError: any) {
          console.error('❌ [CAMERA-CAPTURE] 3D generation failed:', conversionError);
          handleConversionError(conversionError);
        }
      };
      
      reader.onerror = () => {
        console.error('❌ [CAMERA-CAPTURE] FileReader failed');
        toast({
          title: "Image Processing Failed",
          description: "Failed to process the camera image. Please try taking another photo.",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(imageBlob);
    } catch (error: any) {
      console.error('❌ [CAMERA-CAPTURE] Image capture handler failed:', error);
      handleConversionError(error);
    }
  }, [generate3DModel, toast, isMobile]);

  const handleConversionError = (error: any) => {
    console.log('🔍 [CAMERA-CAPTURE] Analyzing conversion error:', error);
    
    if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
      console.log('🔔 [CAMERA-CAPTURE] Showing upgrade notification for model_conversion');
      showUpgradeNotification("model_conversion");
    } else if (error?.message?.includes('authentication') || error?.message?.includes('session')) {
      toast({
        title: "Authentication Error",
        description: "Your session has expired. Please refresh the page and try again.",
        variant: "destructive",
      });
    } else if (error?.message?.includes('camera') || error?.message?.includes('blob')) {
      toast({
        title: "Camera Image Error",
        description: "Failed to process the camera image. Please try taking another photo with better lighting.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Camera Capture Failed",
        description: error.message || "Failed to generate 3D model from camera. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mobile layout
  if (isMobile) {
    return (
      <SecurityEnforcedRoute requireVerification={true}>
        <div className="min-h-screen bg-figuro-dark">
          <Header />
          <div className="pt-16">
            {/* Mobile header with proper button styling */}
            <div className="sticky top-16 z-40 bg-figuro-dark/95 backdrop-blur-sm border-b border-white/10 px-4 py-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/studio')}
                    className="text-white/70 hover:text-white hover:bg-white/10 px-2 py-1 h-8 text-xs flex-shrink-0 border border-white/20"
                  >
                    <Home className="w-3 h-3 mr-1" />
                    Hub
                  </Button>
                  <span className="text-white/40 text-sm flex-shrink-0">/</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <Camera className="w-4 h-4 text-figuro-accent flex-shrink-0" />
                    <h1 className="text-base font-semibold text-white truncate">Camera Capture</h1>
                  </div>
                </div>
                {progress.modelUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMobilePreview(!showMobilePreview)}
                    className="bg-white/10 border-white/20 text-white flex-shrink-0 ml-2"
                  >
                    {showMobilePreview ? 'Camera' : 'Preview'}
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile content */}
            <div className="px-4 pb-20">
              <AnimatePresence mode="wait">
                {showMobilePreview && progress.modelUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="mt-4"
                  >
                    <div className="bg-figuro-light/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">3D Model</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMobilePreview(false)}
                          className="text-white/70"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <ModelViewer
                          modelUrl={progress.modelUrl}
                          isLoading={isGenerating}
                          errorMessage={null}
                          onCustomModelLoad={(url, file) => {}}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="camera"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="mt-4"
                  >
                    <EnhancedCameraWorkflow
                      onImageCapture={handleImageCapture}
                      isProcessing={isGenerating}
                      progress={{
                        status: progress.status || 'idle',
                        progress: progress.progress || 0,
                        percentage: progress.percentage || 0,
                        message: progress.message || 'Ready to capture',
                        taskId: progress.taskId,
                        thumbnailUrl: progress.thumbnailUrl,
                        modelUrl: progress.modelUrl
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile compact progress indicator */}
            <CompactProgressIndicator
              isGenerating={isGenerating}
              progress={{
                status: progress.status || 'idle',
                progress: progress.progress || 0,
                percentage: progress.percentage || 0,
                message: progress.message || 'Ready to capture',
                modelUrl: progress.modelUrl
              }}
            />
          </div>
        </div>
      </SecurityEnforcedRoute>
    );
  }

  // Desktop layout with magical enhancements
  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <div className="min-h-screen relative overflow-x-hidden overflow-y-auto">
        {/* Floating Particles - Desktop Only */}
        {!isMobile && (
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
        )}

        {/* Mouse Follower Effect - Desktop Only */}
        {!isMobile && (
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
        )}

        <VantaBackground>
          <Header />
          <div className="pt-20">
            <div className="container mx-auto px-4 py-8 relative">
              {/* Magical Header Section - Desktop Only */}
              {!isMobile && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-12 relative"
                >
                  {/* Floating Icons */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[Camera, Stars, Zap].map((Icon, index) => (
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
                      ✨ Camera Capture Magic ✨
                    </span>
                  </motion.div>

                  <StudioBreadcrumb 
                    currentPage="Camera Capture"
                    description="Capture photos directly and convert them to 3D models with AI magic"
                  />
                </motion.div>
              )}

              {/* Mobile layout gets the original simpler version */}
              {isMobile && <StudioBreadcrumb currentPage="Camera Capture" description="Capture photos directly and convert them to 3D models" />}
            </div>
          </div>

          <div className="container mx-auto px-4 py-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Left Panel - Camera Interface */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Camera className="w-6 h-6 text-figuro-accent" />
                    Camera Capture
                  </h2>
                  <EnhancedCameraWorkflow
                    onImageCapture={handleImageCapture}
                    isProcessing={isGenerating}
                    progress={{
                      status: progress.status || 'idle',
                      progress: progress.progress || 0,
                      percentage: progress.percentage || 0,
                      message: progress.message || 'Ready to capture',
                      taskId: progress.taskId,
                      thumbnailUrl: progress.thumbnailUrl,
                      modelUrl: progress.modelUrl
                    }}
                  />
                </div>

                {/* Progress Section */}
                {(isGenerating || progress.modelUrl) && (
                  <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-figuro-accent" />
                      Generation Progress
                    </h3>
                    <div className="space-y-3">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-figuro-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-white/80 text-sm">{progress.message || 'Processing...'}</p>
                      <p className="text-figuro-accent text-sm">{progress.progress || 0}% complete</p>
                    </div>
                  </div>
                )}

                {/* Debug info for development */}
                {process.env.NODE_ENV === 'development' && conversionAttempts > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <AlertCircle size={16} />
                      <span className="text-sm font-medium">Debug Info</span>
                    </div>
                    <p className="text-xs text-yellow-300">
                      Conversion attempts: {conversionAttempts}
                    </p>
                    <p className="text-xs text-yellow-300">
                      Progress status: {progress.status}
                    </p>
                    <p className="text-xs text-yellow-300">
                      Is generating: {isGenerating ? 'Yes' : 'No'}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Right Panel - 3D Model Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10 h-[600px]">
                  <h2 className="text-2xl font-bold text-white mb-4">3D Model Preview</h2>
                  
                  {progress.modelUrl ? (
                    <div className="h-[500px] rounded-lg overflow-hidden">
                      <ModelViewer
                        modelUrl={progress.modelUrl}
                        isLoading={isGenerating}
                        errorMessage={null}
                        onCustomModelLoad={(url, file) => {}}
                      />
                    </div>
                  ) : (
                    <div className="h-[500px] flex flex-col items-center justify-center text-white/50 border-2 border-dashed border-white/20 rounded-lg">
                      {isGenerating ? (
                        <div className="text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-figuro-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p>Generating 3D model from photo...</p>
                          <div className="w-64 bg-white/10 rounded-full h-2 mt-4">
                            <div 
                              className="bg-figuro-accent h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress.progress || 0}%` }}
                            />
                          </div>
                          <p className="text-sm mt-2">{progress.progress || 0}% complete</p>
                          <p className="text-xs mt-1 text-white/40">{progress.message}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                            <Camera className="w-8 h-8" />
                          </div>
                          <p>Capture a photo to create your 3D model</p>
                          <p className="text-sm mt-2">Your generated model will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </VantaBackground>

        {/* Debug Buttons - Remove in production */}
        {process.env.NODE_ENV === 'development' && <DebugUpgradeButtons />}
      </div>
    </SecurityEnforcedRoute>
  );
};

export default CameraCapture;
