
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useCameraProgress } from "@/hooks/useCameraProgress";
import { useEnhancedUpgradeModal } from "@/hooks/useEnhancedUpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import EnhancedUpgradeModal from "@/components/upgrade/EnhancedUpgradeModal";
import UpgradeCelebration from "@/components/upgrade/UpgradeCelebration";
import Header from "@/components/Header";
import StudioLayout from "@/components/studio/StudioLayout";
import UpgradeModal from "@/components/UpgradeModal";
import { StudioErrorBoundary } from "@/components/studio/StudioErrorBoundary";
import { useStudioState } from "@/components/studio/hooks/useStudioState";
import { useStudioHandlers } from "@/components/studio/hooks/useStudioHandlers";

const Studio = () => {
  console.log('🎬 [STUDIO] Component rendering...');

  // Use EnhancedAuth instead of useStudioAuth to prevent duplicate listeners
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

  // Determine which model URL to display - custom, text-to-3D generated, or image-to-3D converted
  const displayModelUrl = customModelUrl || textTo3DProgress.modelUrl || progress.modelUrl;

  // Add camera progress tracking - now displayModelUrl is declared
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

  // Create wrapper functions that match StudioLayout expectations
  const wrappedOnGenerate = async (prompt: string, style: string) => {
    await onGenerate(prompt, style);
  };

  const wrappedHandleTextTo3D = async (prompt: string, artStyle: string, negativePrompt: string = "") => {
    await handleTextTo3D(prompt, artStyle, negativePrompt);
  };

  const wrappedHandleTextTo3DWithConfig = async (config: any) => {
    await handleTextTo3DWithConfig(config);
  };

  const wrappedHandleModelUpload = async (figurineId: string, file: File) => {
    handleModelUpload(file);
  };

  // Enhanced camera image capture with better error handling and validation
  const handleCameraImageCapture = async (imageBlob: Blob) => {
    try {
      console.log('📸 [CAMERA] Image captured, starting enhanced processing...');
      
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
      
      console.log('📸 [CAMERA] Starting enhanced 3D conversion for captured image...');
      
      // Enhanced configuration for camera captures
      const cameraConfig = {
        art_style: 'realistic',
        ai_model: 'meshy-5',
        topology: 'quad',
        target_polycount: 20000,
        texture_richness: 'high',
        moderation: true
      };
      
      // FIXED: Pass shouldUpdateExisting as false to create NEW figurine records
      // This ensures camera captures are saved as new figurines in the gallery
      await generate3DModel(
        imageUrl,
        fileName,
        cameraConfig,
        false // shouldUpdateExisting: false to create new figurine records
      );
      
      console.log('✅ [CAMERA] Enhanced 3D conversion initiated successfully - will create new figurine');
      
    } catch (error) {
      console.error('❌ [CAMERA] Enhanced camera processing failed:', error);
      
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
  };

  // Determine if ModelViewer should show loading - only when not converting AND there's a model to load
  const shouldModelViewerLoad = !isGenerating && !generationModalOpen && !isGeneratingTextTo3D && !!displayModelUrl;

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-figuro-accent/30 border-t-figuro-accent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-figuro-accent rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ [STUDIO] Rendering with auth state:', { isAuthenticated, hasUser: !!authUser });

  return (
    <StudioErrorBoundary>
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
  );
};

export default Studio;
