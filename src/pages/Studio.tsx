import { useMemo, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useCameraProgress } from "@/hooks/useCameraProgress";
import { useEnhancedUpgradeModal } from "@/hooks/useEnhancedUpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import EnhancedUpgradeModal from "@/components/upgrade/EnhancedUpgradeModal";
import UpgradeCelebration from "@/components/upgrade/UpgradeCelebration";
import Header from "@/components/Header";
import StudioLayout from "@/components/studio/StudioLayout";
import { StudioErrorBoundary } from "@/components/studio/StudioErrorBoundary";
import { useStudioState } from "@/components/studio/hooks/useStudioState";
import { useStudioHandlers } from "@/components/studio/hooks/useStudioHandlers";

const Studio = () => {
  console.log('🎬 [STUDIO] Component rendering with security enforcement...');

  // Use EnhancedAuth for secure authentication
  const { user: authUser, isLoading: authLoading, session } = useEnhancedAuth();
  const isAuthenticated = !!session?.user;
  const { toast } = useToast();

  const {
    customModelUrl,
    setCustomModelUrl,
    customModelFile,
    setCustomModelFile,
    uploadModalOpen,
    setUploadModalOpen,
    configModalOpen,
    setConfigModalOpen,
    textTo3DConfigModalOpen,
    setTextTo3DConfigModalOpen,
    generationModalOpen,
    setGenerationModalOpen,
    textTo3DConfigPrompt,
    setTextTo3DConfigPrompt
  } = useStudioState();

  const {
    isGeneratingImage,
    generatedImage,
    handleGenerate,
  } = useImageGeneration();

  const {
    isGenerating,
    progress,
    generate3DModel,
    resetProgress
  } = useGallery3DGeneration();

  const {
    isGenerating: isGeneratingTextTo3D,
    currentTaskId,
    progress: textTo3DProgress,
    generateModel: generateTextTo3DModel,
    generateModelWithConfig: generateTextTo3DModelWithConfig,
    resetProgress: resetTextTo3DProgress,
    setCurrentTaskId
  } = useTextTo3D();

  const { activeTab, setActiveTab } = useTabNavigation({
    defaultTab: 'image-to-3d',
    tabs: ['image-to-3d', 'camera', 'text-to-3d', 'web-icons', 'gallery']
  });

  // Use enhanced upgrade modal functionality with debugging
  const {
    isUpgradeModalOpen,
    upgradeModalAction,
    showUpgradeModal,
    hideUpgradeModal,
    showCelebration,
    triggerCelebration,
    hideCelebration,
    celebrationPlan
  } = useEnhancedUpgradeModal();

  // Debug upgrade modal state changes with more detail
  useEffect(() => {
    console.log('🔧 [STUDIO] ===== UPGRADE MODAL STATE CHANGED =====');
    console.log('🔧 [STUDIO] Upgrade modal state changed:', {
      isUpgradeModalOpen,
      upgradeModalAction,
      shouldRenderModal: isUpgradeModalOpen && upgradeModalAction,
      timestamp: new Date().toISOString()
    });
    
    if (isUpgradeModalOpen && upgradeModalAction) {
      console.log('✅ [STUDIO] Modal should be visible now!');
    } else if (isUpgradeModalOpen && !upgradeModalAction) {
      console.log('⚠️ [STUDIO] Modal open but no action set');
    } else if (!isUpgradeModalOpen && upgradeModalAction) {
      console.log('⚠️ [STUDIO] Action set but modal not open');
    }
  }, [isUpgradeModalOpen, upgradeModalAction]);

  // Add debugging for showUpgradeModal function changes
  useEffect(() => {
    console.log('🔧 [STUDIO] showUpgradeModal function changed:', {
      hasFunction: !!showUpgradeModal,
      functionType: typeof showUpgradeModal
    });
  }, [showUpgradeModal]);

  // Determine which model URL to display
  const displayModelUrl = customModelUrl || textTo3DProgress.modelUrl || progress.modelUrl;

  // Add camera progress tracking
  const { cameraProgress, resetProgress: resetCameraProgress } = useCameraProgress(progress, displayModelUrl);

  // Call useStudioHandlers directly at the top level - FIX FOR HOOKS RULE VIOLATION
  const studioHandlers = useStudioHandlers({
    generatedImage,
    setCustomModelUrl,
    setCustomModelFile,
    setConfigModalOpen,
    setTextTo3DConfigModalOpen,
    setGenerationModalOpen,
    setTextTo3DConfigPrompt,
    handleGenerate,
    generate3DModel,
    generateTextTo3DModel,
    generateTextTo3DModelWithConfig,
    resetProgress,
    showUpgradeModal
  });

  // Memoize wrapper functions that match StudioLayout expectations
  const wrappedOnGenerate = useCallback(async (prompt: string, style: string) => {
    await studioHandlers.onGenerate(prompt, style);
  }, [studioHandlers.onGenerate]);

  const wrappedHandleTextTo3D = useCallback(async (prompt: string, artStyle: string, negativePrompt: string = "") => {
    return await studioHandlers.handleTextTo3D(prompt, artStyle, negativePrompt);
  }, [studioHandlers.handleTextTo3D]);

  const wrappedHandleTextTo3DWithConfig = useCallback(async (config: any) => {
    return await studioHandlers.handleTextTo3DWithConfig(config);
  }, [studioHandlers.handleTextTo3DWithConfig]);

  const wrappedHandleModelUpload = useCallback(async (figurineId: string, file: File) => {
    studioHandlers.handleModelUpload(file);
  }, [studioHandlers.handleModelUpload]);

  // Enhanced camera image capture with security validation
  const handleCameraImageCapture = useCallback(async (imageBlob: Blob) => {
    try {
      console.log('📸 [CAMERA] Image captured, starting secure processing...');
      
      // Validate blob
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Invalid image data captured');
      }
      
      // Validate blob size (max 10MB)
      if (imageBlob.size > 10 * 1024 * 1024) {
        throw new Error('Captured image is too large (max 10MB)');
      }
      
      // Validate blob type
      if (!imageBlob.type.startsWith('image/')) {
        throw new Error('Captured data is not a valid image');
      }
      
      console.log('✅ [CAMERA] Image validation passed:', {
        size: imageBlob.size,
        type: imageBlob.type
      });
      
      // Reset any previous camera progress
      resetCameraProgress();
      
      // Convert blob to URL for display and processing
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Generate a filename for the captured image
      const fileName = `camera-capture-${Date.now()}.jpg`;
      
      console.log('📸 [CAMERA] Starting secure 3D conversion for captured image...');
      
      // Enhanced configuration for camera captures
      const cameraConfig = {
        art_style: 'realistic',
        ai_model: 'meshy-5',
        topology: 'quad',
        target_polycount: 20000,
        texture_richness: 'high',
        moderation: true
      };
      
      // Create new figurine records for camera captures
      await generate3DModel(
        imageUrl,
        fileName,
        cameraConfig,
        false // shouldUpdateExisting: false to create new figurine records
      );
      
      console.log('✅ [CAMERA] Secure 3D conversion initiated successfully - will create new figurine');
      
    } catch (error) {
      console.error('❌ [CAMERA] Secure camera processing failed:', error);
      
      // Enhanced error handling for camera captures
      let errorMessage = 'Failed to process camera image';
      if (error instanceof Error) {
        if (error.message.includes('Invalid image data')) {
          errorMessage = 'Failed to capture image. Please try again.';
        } else if (error.message.includes('too large')) {
          errorMessage = 'Captured image is too large. Please try from a different angle.';
        } else if (error.message.includes('not a valid image')) {
          errorMessage = 'Invalid image format captured. Please try again.';
        } else if (error.message.includes('authentication')) {
          errorMessage = 'Authentication expired. Please refresh the page and try again.';
        } else if (error.message.includes('limit reached')) {
          errorMessage = 'You have reached your conversion limit. Please upgrade your plan.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error('❌ [CAMERA] Error details:', errorMessage);
      
      // Show user-friendly error message
      toast({
        title: "Camera Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Update camera progress to show error state
      resetCameraProgress();
    }
  }, [generate3DModel, resetCameraProgress, toast]);

  // Determine if ModelViewer should show loading
  const shouldModelViewerLoad = !isGenerating && !generationModalOpen && !isGeneratingTextTo3D && !!displayModelUrl;

  // Memoize the StudioLayout props to prevent unnecessary re-renders - FIXED DEPENDENCY ARRAY
  const studioLayoutProps = useMemo(() => ({
    activeTab,
    setActiveTab,
    authUser,
    generatedImage,
    isGeneratingImage,
    isGenerating,
    isGeneratingTextTo3D,
    currentTaskId,
    progress,
    textTo3DProgress,
    displayModelUrl,
    shouldModelViewerLoad,
    uploadModalOpen,
    setUploadModalOpen,
    configModalOpen,
    setConfigModalOpen,
    textTo3DConfigModalOpen,
    setTextTo3DConfigModalOpen,
    textTo3DConfigPrompt,
    generationModalOpen,
    setGenerationModalOpen,
    onGenerate: wrappedOnGenerate,
    handleOpenConfigModal: studioHandlers.handleOpenConfigModal,
    handleGenerate3DWithConfig: studioHandlers.handleGenerate3DWithConfig,
    handleQuickConvert: studioHandlers.handleQuickConvert,
    handleTextTo3D: wrappedHandleTextTo3D,
    handleOpenTextTo3DConfigModal: studioHandlers.handleOpenTextTo3DConfigModal,
    handleTextTo3DWithConfig: wrappedHandleTextTo3DWithConfig,
    handleModelUpload: wrappedHandleModelUpload,
    handleSignOut: studioHandlers.handleSignOut,
    handleSignIn: studioHandlers.handleSignIn,
    handleCloseGenerationModal: studioHandlers.handleCloseGenerationModal,
    setCustomModelUrl,
    onCameraImageCapture: handleCameraImageCapture
  }), [
    activeTab,
    setActiveTab,
    authUser,
    generatedImage,
    isGeneratingImage,
    isGenerating,
    isGeneratingTextTo3D,
    currentTaskId,
    progress,
    textTo3DProgress,
    displayModelUrl,
    shouldModelViewerLoad,
    uploadModalOpen,
    setUploadModalOpen,
    configModalOpen,
    setConfigModalOpen,
    textTo3DConfigModalOpen,
    setTextTo3DConfigModalOpen,
    textTo3DConfigPrompt,
    generationModalOpen,
    setGenerationModalOpen,
    wrappedOnGenerate,
    wrappedHandleTextTo3D,
    wrappedHandleTextTo3DWithConfig,
    wrappedHandleModelUpload,
    setCustomModelUrl,
    handleCameraImageCapture,
    // Fixed: Use individual handler functions instead of the entire studioHandlers object
    studioHandlers.handleOpenConfigModal,
    studioHandlers.handleGenerate3DWithConfig,
    studioHandlers.handleQuickConvert,
    studioHandlers.handleOpenTextTo3DConfigModal,
    studioHandlers.handleSignOut,
    studioHandlers.handleSignIn,
    studioHandlers.handleCloseGenerationModal
  ]);

  console.log('✅ [STUDIO] Rendering with secure auth state:', { isAuthenticated, hasUser: !!authUser });
  console.log('🔧 [STUDIO] About to render upgrade modal with state:', {
    isUpgradeModalOpen,
    upgradeModalAction,
    hasAction: !!upgradeModalAction,
    shouldRender: !!(isUpgradeModalOpen && upgradeModalAction)
  });

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <StudioErrorBoundary>
        <div className="min-h-screen bg-figuro-dark">
          <Header />
          <div className="pt-20">
            <StudioLayout {...studioLayoutProps} />
          </div>
          
          {/* Enhanced Upgrade Modal - Ensure it's properly rendered with more debugging */}
          <AnimatePresence>
            {isUpgradeModalOpen && upgradeModalAction && (
              <StudioErrorBoundary>
                {console.log('🎯 [STUDIO] ===== RENDERING UPGRADE MODAL =====', { 
                  isUpgradeModalOpen, 
                  upgradeModalAction,
                  timestamp: new Date().toISOString()
                })}
                <EnhancedUpgradeModal
                  isOpen={isUpgradeModalOpen}
                  onOpenChange={hideUpgradeModal}
                  actionType={upgradeModalAction}
                  title="Upgrade Required"
                  description={
                    upgradeModalAction === "image_generation"
                      ? "You've reached your daily image generation limit."
                      : "You've reached your monthly 3D conversion limit. Upgrade to continue creating 3D models."
                  }
                />
              </StudioErrorBoundary>
            )}
          </AnimatePresence>

          {/* Upgrade Celebration */}
          <UpgradeCelebration
            isVisible={showCelebration}
            onComplete={hideCelebration}
            planName={celebrationPlan}
          />
        </div>
      </StudioErrorBoundary>
    </SecurityEnforcedRoute>
  );
};

export default Studio;
