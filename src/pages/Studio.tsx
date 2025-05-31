
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import Header from "@/components/Header";
import StudioLayout from "@/components/studio/StudioLayout";
import UpgradeModal from "@/components/UpgradeModal";
import { useStudioState } from "@/components/studio/hooks/useStudioState";
import { useStudioHandlers } from "@/components/studio/hooks/useStudioHandlers";

const Studio = () => {
  const {
    user,
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
    tabs: ['image-to-3d', 'text-to-3d', 'web-icons', 'gallery']
  });

  const { user: authUser } = useEnhancedAuth();

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

  // Determine which model URL to display - custom, text-to-3D generated, or image-to-3D converted
  const displayModelUrl = customModelUrl || textTo3DProgress.modelUrl || progress.modelUrl;

  // Determine if ModelViewer should show loading - only when not converting AND there's a model to load
  const shouldModelViewerLoad = !isGenerating && !generationModalOpen && !isGeneratingTextTo3D && !!displayModelUrl;

  return (
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
        />
      </div>
      
      {/* Upgrade Modal */}
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
    </div>
  );
};

export default Studio;
