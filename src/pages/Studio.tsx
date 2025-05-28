
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useAuth } from "@/components/auth/AuthProvider";
import StudioLayout from "@/components/studio/StudioLayout";
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
    tabs: ['image-to-3d', 'text-to-3d', 'gallery']
  });

  const { user: authUser } = useAuth();

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
    resetProgress
  });

  // Determine which model URL to display - custom, text-to-3D generated, or image-to-3D converted
  const displayModelUrl = customModelUrl || textTo3DProgress.modelUrl || progress.modelUrl;

  // Determine if ModelViewer should show loading - only when not converting AND there's a model to load
  const shouldModelViewerLoad = !isGenerating && !generationModalOpen && !isGeneratingTextTo3D && !!displayModelUrl;

  return (
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
      onGenerate={onGenerate}
      handleOpenConfigModal={handleOpenConfigModal}
      handleGenerate3DWithConfig={handleGenerate3DWithConfig}
      handleQuickConvert={handleQuickConvert}
      handleTextTo3D={handleTextTo3D}
      handleOpenTextTo3DConfigModal={handleOpenTextTo3DConfigModal}
      handleTextTo3DWithConfig={handleTextTo3DWithConfig}
      handleModelUpload={handleModelUpload}
      handleSignOut={handleSignOut}
      handleSignIn={handleSignIn}
      handleCloseGenerationModal={handleCloseGenerationModal}
      setCustomModelUrl={setCustomModelUrl}
    />
  );
};

export default Studio;
