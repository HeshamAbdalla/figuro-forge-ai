
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import Header from "@/components/Header";
import StudioLayout from "@/components/studio/StudioLayout";
import UpgradeModal from "@/components/UpgradeModal";
import { StudioErrorBoundary } from "@/components/studio/StudioErrorBoundary";
import { useStudioAuth } from "@/components/studio/hooks/useStudioAuth";
import { useStudioState } from "@/components/studio/hooks/useStudioState";
import { useStudioHandlers } from "@/components/studio/hooks/useStudioHandlers";

const Studio = () => {
  console.log('🎬 [STUDIO] Component rendering...');

  // Use simplified auth for Studio
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useStudioAuth();

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

  // Add upgrade modal functionality
  const {
    isUpgradeModalOpen,
    upgradeModalAction,
    showUpgradeModal,
    hideUpgradeModal
  } = useUpgradeModal();

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

  // Handle camera image capture
  const handleCameraImageCapture = async (imageBlob: Blob) => {
    try {
      console.log('📸 [CAMERA] Image captured, converting to URL...');
      
      // Convert blob to URL for display
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Update the generated image state to show the captured image
      // This reuses the existing image-to-3D workflow
      if (handleGenerate) {
        // For camera captures, we'll store the blob and URL
        // and trigger the 3D conversion process
        
        // Create a temporary way to store the captured image
        // In a real implementation, you might want to save this to storage first
        console.log('📸 [CAMERA] Starting 3D conversion for captured image...');
        
        // Generate a filename for the captured image
        const fileName = `camera-capture-${Date.now()}.jpg`;
        
        // Trigger the conversion using the existing 3D generation system with correct parameters
        await generate3DModel(
          imageUrl,
          fileName,
          {
            art_style: 'realistic',
            ai_model: 'meshy-5',
            topology: 'quad',
            target_polycount: 20000,
            texture_richness: 'high',
            moderation: true
          }
        );
      }
      
      // Switch to a tab where the user can see the conversion progress
      setActiveTab('image-to-3d');
      
    } catch (error) {
      console.error('❌ [CAMERA] Failed to process captured image:', error);
    }
  };

  // Determine which model URL to display - custom, text-to-3D generated, or image-to-3D converted
  const displayModelUrl = customModelUrl || textTo3DProgress.modelUrl || progress.modelUrl;

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
        
        {/* Upgrade Modal with error boundary */}
        {isUpgradeModalOpen && (
          <StudioErrorBoundary>
            <UpgradeModal
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
      </div>
    </StudioErrorBoundary>
  );
};

export default Studio;
