import { useMemo, useCallback, useEffect, useRef } from "react";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useCameraProgress } from "@/hooks/useCameraProgress";
import { useEnhancedUpgradeModal } from "@/hooks/useEnhancedUpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import Header from "@/components/Header";
import StudioLayout from "@/components/studio/StudioLayout";
import StudioUpgradeHandler from "@/components/studio/StudioUpgradeHandler";
import { StudioErrorBoundary } from "@/components/studio/StudioErrorBoundary";
import { useStudioState } from "@/components/studio/hooks/useStudioState";
import { useStudioHandlers } from "@/components/studio/hooks/useStudioHandlers";

const Studio = () => {
  console.log('🎬 [STUDIO] Component rendering with security enforcement...');

  // Add debug refs to track renders and prevent infinite loops
  const renderCountRef = useRef(0);
  
  renderCountRef.current += 1;

  // Use EnhancedAuth for secure authentication
  const { user: authUser, isLoading: authLoading, session } = useEnhancedAuth();
  const isAuthenticated = !!session?.user;
  const { toast } = useToast();

  // Get upgrade modal functions - now properly memoized
  const { 
    showUpgradeModal,
    isUpgradeModalOpen,
    upgradeModalAction 
  } = useEnhancedUpgradeModal();

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
    handleGenerate: originalHandleGenerate,
  } = useImageGeneration();

  // Create a wrapper function that matches the expected signature
  const handleGenerate = useCallback(async (prompt: string, style: string): Promise<void> => {
    await originalHandleGenerate(prompt, style);
  }, [originalHandleGenerate]);

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

  // Determine which model URL to display
  const displayModelUrl = customModelUrl || textTo3DProgress.modelUrl || progress.modelUrl;

  // Add camera progress tracking
  const { cameraProgress, resetProgress: resetCameraProgress } = useCameraProgress(progress, displayModelUrl);

  // Now use properly memoized useStudioHandlers with stable references
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

  const handleCameraImageCapture = useCallback(async (imageBlob: Blob) => {
    // ... keep existing code (camera image capture logic)
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

  // Handle model upload with proper async signature
  const handleModelUpload = useCallback(async (figurineId: string, file: File) => {
    studioHandlers.handleModelUpload(file);
  }, [studioHandlers]);

  // Determine if ModelViewer should show loading
  const shouldModelViewerLoad = !isGenerating && !generationModalOpen && !isGeneratingTextTo3D && !!displayModelUrl;

  // FINAL FIX: Remove ALL handler functions from dependencies - use static values only
  const studioLayoutProps = useMemo(() => {
    const props = {
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
      // Use studioHandlers functions directly - they are now stable
      onGenerate: studioHandlers.onGenerate,
      handleOpenConfigModal: studioHandlers.handleOpenConfigModal,
      handleGenerate3DWithConfig: studioHandlers.handleGenerate3DWithConfig,
      handleQuickConvert: studioHandlers.handleQuickConvert,
      handleTextTo3D: studioHandlers.handleTextTo3D,
      handleOpenTextTo3DConfigModal: studioHandlers.handleOpenTextTo3DConfigModal,
      handleTextTo3DWithConfig: studioHandlers.handleTextTo3DWithConfig,
      handleModelUpload,
      handleSignOut: studioHandlers.handleSignOut,
      handleSignIn: studioHandlers.handleSignIn,
      handleCloseGenerationModal: studioHandlers.handleCloseGenerationModal,
      setCustomModelUrl,
      onCameraImageCapture: handleCameraImageCapture
    };

    // Detect rapid re-renders
    if (renderCountRef.current > 20) {
      console.warn('⚠️ [STUDIO] POTENTIAL INFINITE LOOP IN STUDIO COMPONENT', {
        renderCount: renderCountRef.current,
        upgradeModalState: { isUpgradeModalOpen, upgradeModalAction }
      });
    }

    return props;
  }, [
    // FINAL FIX: Only include primitive values and stable state setters - NO HANDLER FUNCTIONS
    activeTab,
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
    configModalOpen,
    textTo3DConfigModalOpen,
    textTo3DConfigPrompt,
    generationModalOpen,
    // State setters are stable
    setActiveTab,
    setUploadModalOpen,
    setConfigModalOpen,
    setTextTo3DConfigModalOpen,
    setGenerationModalOpen,
    setCustomModelUrl,
    // These are the only callback functions we include - they use useCallback with stable deps
    handleCameraImageCapture,
    handleModelUpload
    // Completely removed studioHandlers and all handler functions from dependencies
  ]);

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any URL objects to prevent memory leaks
      if (customModelUrl && customModelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(customModelUrl);
      }
    };
  }, [customModelUrl]);

  console.log('✅ [STUDIO] Rendering with secure auth state:', { isAuthenticated, hasUser: !!authUser });

  return (
    <SecurityEnforcedRoute requireVerification={true}>
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
              onGenerate={studioHandlers.onGenerate}
              handleOpenConfigModal={studioHandlers.handleOpenConfigModal}
              handleGenerate3DWithConfig={studioHandlers.handleGenerate3DWithConfig}
              handleQuickConvert={studioHandlers.handleQuickConvert}
              handleTextTo3D={studioHandlers.handleTextTo3D}
              handleOpenTextTo3DConfigModal={studioHandlers.handleOpenTextTo3DConfigModal}
              handleTextTo3DWithConfig={studioHandlers.handleTextTo3DWithConfig}
              handleModelUpload={handleModelUpload}
              handleSignOut={studioHandlers.handleSignOut}
              handleSignIn={studioHandlers.handleSignIn}
              handleCloseGenerationModal={studioHandlers.handleCloseGenerationModal}
              setCustomModelUrl={setCustomModelUrl}
              onCameraImageCapture={handleCameraImageCapture}
            />
          </div>
          
          {/* Upgraded modal handling with dedicated component */}
          <StudioUpgradeHandler />
        </div>
      </StudioErrorBoundary>
    </SecurityEnforcedRoute>
  );
};

export default Studio;
