
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelViewer from "@/components/ModelViewer";
import { FigurineGallery } from "@/components/figurine";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import UploadModelModal from "@/components/UploadModelModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import VantaBackground from "@/components/VantaBackground";
import { motion } from "framer-motion";
import CompactStudioHeader from "@/components/studio/CompactStudioHeader";
import StudioConfigPanel from "@/components/studio/StudioConfigPanel";
import EnhancedPromptForm from "@/components/studio/EnhancedPromptForm";
import StreamlinedImagePreview from "@/components/studio/StreamlinedImagePreview";
import TextTo3DForm from "@/components/studio/TextTo3DForm";
import TextTo3DProgress from "@/components/studio/TextTo3DProgress";
import EnhancedStudioTabs from "@/components/studio/EnhancedStudioTabs";
import Generate3DConfigModal from "@/components/gallery/Generate3DConfigModal";
import Generate3DModal from "@/components/gallery/Generate3DModal";
import type { Generate3DConfig } from "@/components/gallery/types/conversion";

const Studio = () => {
  const [user, setUser] = useState<any>(null);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [customModelFile, setCustomModelFile] = useState<File | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [generationModalOpen, setGenerationModalOpen] = useState(false);
  const [textTo3DProgress, setTextTo3DProgress] = useState({ status: '', progress: 0, modelUrl: '' });
  const { toast } = useToast();
  
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
    generateModel: generateTextTo3DModel,
    setCurrentTaskId
  } = useTextTo3D();

  const { activeTab, setActiveTab } = useTabNavigation({
    defaultTab: 'image-to-3d',
    tabs: ['image-to-3d', 'text-to-3d', 'gallery']
  });

  const { user: authUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { canPerformAction, consumeAction } = useSubscription();

  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
        }
      );
      
      return () => subscription.unsubscribe();
    };
    
    checkUser();
  }, []);

  // Watch for generation modal state changes
  useEffect(() => {
    const shouldShowGenerationModal = isGenerating || progress.status === 'converting' || progress.status === 'downloading';
    setGenerationModalOpen(shouldShowGenerationModal);
  }, [isGenerating, progress.status]);

  // Enhanced generation function with authentication check
  const onGenerate = async (prompt: string, style: string) => {
    // Reset custom model when generating a new image
    setCustomModelUrl(null);
    setCustomModelFile(null);
    
    // REQUIRE authentication for figurine creation
    if (!authUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate and save figurines",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    const canGenerate = canPerformAction("image_generation");
    if (!canGenerate) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your daily image generation limit",
        variant: "destructive",
      });
      return;
    }
    
    // Consume usage before generation
    const consumed = await consumeAction("image_generation");
    if (!consumed) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your daily image generation limit",
        variant: "destructive",
      });
      return;
    }
    
    // Call the handleGenerate function with improved error handling
    try {
      const result = await handleGenerate(prompt, style, ""); // No API key needed anymore
      
      if (!result.success) {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in image generation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Handler to open the config modal
  const handleOpenConfigModal = () => {
    if (!generatedImage) {
      toast({
        title: "No image to convert",
        description: "Please generate an image first before converting to 3D",
        variant: "destructive",
      });
      return;
    }

    if (!authUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to convert models",
      });
      navigate("/auth");
      return;
    }

    const canConvert = canPerformAction("model_conversion");
    if (!canConvert) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your monthly model conversion limit",
        variant: "destructive",
      });
      return;
    }

    setConfigModalOpen(true);
  };

  // Handler to generate 3D model with config
  const handleGenerate3DWithConfig = async (config: Generate3DConfig) => {
    if (!generatedImage) {
      toast({
        title: "No image to convert",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }

    setConfigModalOpen(false);
    
    // Consume usage before conversion
    const consumed = await consumeAction("model_conversion");
    if (!consumed) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your monthly model conversion limit",
        variant: "destructive",
      });
      return;
    }

    // Generate a filename for the conversion
    const fileName = `studio-conversion-${Date.now()}.png`;
    
    // Start the 3D generation process
    await generate3DModel(generatedImage, fileName, config);
  };

  // Handler for Text to 3D generation
  const handleTextTo3D = async (prompt: string, artStyle: string, negativePrompt: string) => {
    if (!authUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate 3D models",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const result = await generateTextTo3DModel(prompt, artStyle, negativePrompt);
    
    if (result.success && result.taskId) {
      // Start polling for progress (this would be implemented similarly to the existing 3D conversion)
      setTextTo3DProgress({ status: 'processing', progress: 10, modelUrl: '' });
      // TODO: Implement polling mechanism for text to 3D progress
    }
  };

  // Handle model upload from modal
  const handleModelUpload = (url: string, file: File) => {
    setCustomModelUrl(url);
    setCustomModelFile(file);
    toast({
      title: "Model uploaded",
      description: `${file.name} has been loaded successfully`,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  const handleSignIn = () => {
    navigate("/auth");
  };

  const handleCloseGenerationModal = () => {
    if (progress.status !== 'converting' && progress.status !== 'downloading') {
      setGenerationModalOpen(false);
      resetProgress();
    }
  };

  // Determine which model URL to display - custom, text-to-3D generated, or image-to-3D converted
  const displayModelUrl = customModelUrl || textTo3DProgress.modelUrl || progress.modelUrl;

  // Determine if ModelViewer should show loading - only when not converting AND there's a model to load
  const shouldModelViewerLoad = !isGenerating && !generationModalOpen && !isGeneratingTextTo3D && !!displayModelUrl;

  const renderTabContent = () => {
    if (!authUser) {
      return (
        <motion.div 
          className="text-center py-16 glass-panel rounded-xl max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gradient mb-3">Authentication Required</h2>
          <p className="text-white/70 mb-4 text-sm">Sign in to start creating figurines</p>
          <Button onClick={handleSignIn} className="bg-figuro-accent hover:bg-figuro-accent-hover">
            Sign In / Sign Up
          </Button>
        </motion.div>
      );
    }

    switch (activeTab) {
      case 'image-to-3d':
        return (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <EnhancedPromptForm 
                onGenerate={onGenerate} 
                isGenerating={isGeneratingImage}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <StreamlinedImagePreview 
                imageSrc={generatedImage} 
                isLoading={isGeneratingImage}
                onConvertTo3D={handleOpenConfigModal}
                isConverting={isGenerating}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ModelViewer 
                modelUrl={displayModelUrl} 
                isLoading={shouldModelViewerLoad && !displayModelUrl}
                errorMessage={progress.status === 'error' ? progress.message : undefined}
                onCustomModelLoad={(url) => setCustomModelUrl(url)}
              />
            </motion.div>
          </motion.div>
        );

      case 'text-to-3d':
        return (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <TextTo3DForm 
                onGenerate={handleTextTo3D}
                isGenerating={isGeneratingTextTo3D}
              />
              {currentTaskId && (
                <TextTo3DProgress
                  taskId={currentTaskId}
                  status={textTo3DProgress.status}
                  progress={textTo3DProgress.progress}
                  modelUrl={textTo3DProgress.modelUrl}
                  onViewModel={() => {/* TODO: implement view model */}}
                  onDownload={() => {/* TODO: implement download */}}
                />
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ModelViewer 
                modelUrl={displayModelUrl} 
                isLoading={shouldModelViewerLoad && !displayModelUrl}
                errorMessage={progress.status === 'error' ? progress.message : undefined}
                onCustomModelLoad={(url) => setCustomModelUrl(url)}
              />
            </motion.div>
          </motion.div>
        );

      case 'gallery':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <FigurineGallery />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-figuro-dark overflow-hidden relative">
      <VantaBackground>
        <Header />
        
        <section className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <CompactStudioHeader />
            
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StudioConfigPanel
                onUploadModel={() => setUploadModalOpen(true)}
                user={authUser}
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
              />
            </motion.div>
            
            <EnhancedStudioTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            {renderTabContent()}
          </div>
        </section>
        
        <Footer />
      </VantaBackground>

      {/* Upload Model Modal */}
      <UploadModelModal 
        isOpen={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onModelUpload={handleModelUpload}
      />

      {/* 3D Configuration Modal */}
      <Generate3DConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        onGenerate={handleGenerate3DWithConfig}
        imageUrl={generatedImage || ""}
        imageName="Studio Generated Image"
      />

      {/* 3D Generation Progress Modal */}
      <Generate3DModal
        open={generationModalOpen}
        onOpenChange={setGenerationModalOpen}
        progress={progress}
        onClose={handleCloseGenerationModal}
      />
    </div>
  );
};

export default Studio;
