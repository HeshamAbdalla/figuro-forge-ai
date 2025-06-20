
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useCameraProgress } from "@/hooks/useCameraProgress";
import { useEnhancedUpgradeModal } from "@/hooks/useEnhancedUpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import EnhancedUpgradeModal from "@/components/upgrade/EnhancedUpgradeModal";
import UpgradeCelebration from "@/components/upgrade/UpgradeCelebration";
import Header from "@/components/Header";
import StudioLayout from "@/components/studio/StudioLayout";
import UpgradeModal from "@/components/UpgradeModal";
import { StudioErrorBoundary } from "@/components/studio/StudioErrorBoundary";
import { useStudioState } from "@/components/studio/hooks/useStudioState";
import { useStudioHandlers } from "@/components/studio/hooks/useStudioHandlers";
import { ProductionMonitor } from "@/components/production/ProductionMonitor";
import DevelopmentDebugPanel from "@/components/debug/DevelopmentDebugPanel";
import { logger } from "@/utils/logLevelManager";
import { useCallback, useMemo } from "react";

const Studio = () => {
  // Reduced logging - only log component mount, not every render
  logger.debug('Studio component mounted', 'studio');

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

  // Use enhanced upgrade modal functionality
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

  // Memoize computed values to prevent unnecessary re-renders
  const displayModelUrl = useMemo(() => {
    return customModelUrl || textTo3DProgress.modelUrl || progress.modelUrl;
  }, [customModelUrl, textTo3DProgress.modelUrl, progress.modelUrl]);

  // Add camera progress tracking
  const { cameraProgress, resetProgress: resetCameraProgress } = useCameraProgress(progress, displayModelUrl);

  const {
    onGenerate,
    handleOpenConfigModal,
    handleQuickConvert,
    handleGenerate3DWithConfig,
    handleTextTo3D,
    handleOpenTextTo3DConfigModal,
    handleTextTo3DWithConfig,
    handleModelUpload,
    handleSignOut,
    handleSignIn,
    handleCloseGenerationModal
  } = useStudioHandlers({
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

  // Memoize wrapper functions to prevent re-creation on every render
  const wrappedOnGenerate = useCallback(async (prompt: string, style: string) => {
    await onGenerate(prompt, style);
  }, [onGenerate]);

  const wrappedHandleTextTo3D = useCallback(async (prompt: string, artStyle: string, negativePrompt: string = "") => {
    await handleTextTo3D(prompt, artStyle, negativePrompt);
  }, [handleTextTo3D]);

  const wrappedHandleTextTo3DWithConfig = useCallback(async (config: any) => {
    await handleTextTo3DWithConfig(config);
  }, [handleTextTo3DWithConfig]);

  const wrappedHandleModelUpload = useCallback(async (figurineId: string, file: File) => {
    handleModelUpload(file);
  }, [handleModelUpload]);

  // Enhanced camera image capture with security validation
  const handleCameraImageCapture = useCallback(async (imageBlob: Blob) => {
    try {
      logger.debug('Camera image captured, starting processing', 'camera');
      
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
      
      logger.info('Image validation passed', 'camera', {
        size: imageBlob.size,
        type: imageBlob.type
      });
      
      // Reset any previous camera progress
      resetCameraProgress();
      
      // Convert blob to URL for display and processing
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Generate a filename for the captured image
      const fileName = `camera-capture-${Date.now()}.jpg`;
      
      logger.debug('Starting 3D conversion for captured image', 'camera');
      
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
      
      logger.info('3D conversion initiated successfully', 'camera');
      
    } catch (error) {
      logger.error('Camera processing failed', 'camera', error);
      
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

  // Memoize computed values
  const shouldModelViewerLoad = useMemo(() => {
    return !isGenerating && !generationModalOpen && !isGeneratingTextTo3D && !!displayModelUrl;
  }, [isGenerating, generationModalOpen, isGeneratingTextTo3D, displayModelUrl]);

  logger.debug('Studio rendering with auth state', 'studio', { 
    isAuthenticated, 
    hasUser: !!authUser 
  });

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <StudioErrorBoundary>
        {/* Production monitoring - only shows errors in production */}
        <ProductionMonitor 
          enableErrorReporting={true}
          enablePerformanceTracking={false}
        />
        
        {/* Development debug panel - only shows in development */}
        <DevelopmentDebugPanel visible={process.env.NODE_ENV === 'development'} />
        
        <div className="min-h-screen bg-figuro-dark">
          <Header />
          <div className="pt-20">
            <StudioLayout
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              authUser={authUser}
              generatedImage={generatedImage}
              isGeneratingImage={isGeneratingImage}
              isGenerating={isGenerating}
              isGeneratingTextTo3D={isGeneratingTextTo3D}
              currentTaskId={currentTaskId}
              progress={progress}
              textTo3DProgress={textTo3DProgress}
              displayModelUrl={displayModelUrl}
              shouldModelViewerLoad={shouldModelViewerLoad}
              uploadModalOpen={uploadModalOpen}
              setUploadModalOpen={setUploadModalOpen}
              configModalOpen={configModalOpen}
              setConfigModalOpen={setConfigModalOpen}
              textTo3DConfigModalOpen={textTo3DConfigModalOpen}
              setTextTo3DConfigModalOpen={setTextTo3DConfigModalOpen}
              textTo3DConfigPrompt={textTo3DConfigPrompt}
              generationModalOpen={generationModalOpen}
              setGenerationModalOpen={setGenerationModalOpen}
              onGenerate={wrappedOnGenerate}
              handleOpenConfigModal={handleOpenConfigModal}
              handleGenerate3DWithConfig={handleGenerate3DWithConfig}
              handleQuickConvert={handleQuickConvert}
              handleTextTo3D={wrappedHandleTextTo3D}
              handleOpenTextTo3DConfigModal={handleOpenTextTo3DConfigModal}
              handleTextTo3DWithConfig={wrappedHandleTextTo3DWithConfig}
              handleModelUpload={wrappedHandleModelUpload}
              handleSignOut={handleSignOut}
              handleSignIn={handleSignIn}
              handleCloseGenerationModal={handleCloseGenerationModal}
              setCustomModelUrl={setCustomModelUrl}
              onCameraImageCapture={handleCameraImageCapture}
            />
          </div>
          
          {/* Enhanced Upgrade Modal */}
          {isUpgradeModalOpen && upgradeModalAction && (
            <StudioErrorBoundary>
              <EnhancedUpgradeModal
                isOpen={isUpgradeModalOpen}
                onOpenChange={hideUpgradeModal}
                actionType={upgradeModalAction}
                title="Upgrade Required"
                description={
                  upgradeModalAction === "image_generation"
                    ? "You've reached your daily image generation limit."
                    : "You've reached your monthly 3D conversion limit."
                }
              />
            </StudioErrorBoundary>
          )}

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
