
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelViewer from "@/components/ModelViewer";
import { FigurineGallery } from "@/components/figurine";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import UploadModelModal from "@/components/UploadModelModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VantaBackground from "@/components/VantaBackground";
import { motion } from "framer-motion";
import CompactStudioHeader from "@/components/studio/CompactStudioHeader";
import StudioConfigPanel from "@/components/studio/StudioConfigPanel";
import EnhancedPromptForm from "@/components/studio/EnhancedPromptForm";
import StreamlinedImagePreview from "@/components/studio/StreamlinedImagePreview";
import Generate3DConfigModal from "@/components/gallery/Generate3DConfigModal";
import Generate3DModal from "@/components/gallery/Generate3DModal";
import type { Generate3DConfig } from "@/components/gallery/types/conversion";

const Studio = () => {
  const [apiKey, setApiKey] = useState<string | "">("");
  const [showApiInput, setShowApiInput] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [customModelFile, setCustomModelFile] = useState<File | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [generationModalOpen, setGenerationModalOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("create");
  
  const {
    isGeneratingImage,
    generatedImage,
    handleGenerate,
    requiresApiKey,
  } = useImageGeneration();

  const {
    isGenerating,
    progress,
    generate3DModel,
    resetProgress
  } = useGallery3DGeneration();

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

  useEffect(() => {
    // Check if API key is stored in localStorage
    const savedApiKey = localStorage.getItem("tempHuggingFaceApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  useEffect(() => {
    // Show API input if requiresApiKey is true
    setShowApiInput(requiresApiKey);
  }, [requiresApiKey]);

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
      const result = await handleGenerate(prompt, style, apiKey);
      
      if (result.needsApiKey) {
        setShowApiInput(true);
        toast({
          title: "API Key Required",
          description: "Please enter your Hugging Face API key to continue",
        });
      } else if (!result.success) {
        toast({
          title: "Generation Failed",
          description: "Failed to generate image. Please try again.",
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

  // Determine which model URL to display - custom or generated from the 3D conversion
  const displayModelUrl = customModelUrl || progress.modelUrl;

  // Determine if ModelViewer should show loading - only when not converting AND there's a model to load
  const shouldModelViewerLoad = !isGenerating && !generationModalOpen && !!displayModelUrl;

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
                apiKey={apiKey}
                setApiKey={(key) => {
                  setApiKey(key);
                  localStorage.setItem("tempHuggingFaceApiKey", key);
                }}
                showApiInput={showApiInput}
                setShowApiInput={setShowApiInput}
                onUploadModel={() => setUploadModalOpen(true)}
                user={authUser}
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
              />
            </motion.div>
            
            <Tabs 
              defaultValue="create" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-80 mx-auto mb-6 bg-white/10 backdrop-blur-sm">
                <TabsTrigger value="create" className="data-[state=active]:text-white data-[state=active]:bg-figuro-accent">
                  Studio
                </TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:text-white data-[state=active]:bg-figuro-accent">
                  Gallery
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="mt-0">
                {!authUser ? (
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
                ) : (
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
                )}
              </TabsContent>

              <TabsContent value="gallery" className="mt-0">
                {authUser ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-6xl mx-auto"
                  >
                    <FigurineGallery />
                  </motion.div>
                ) : (
                  <div className="text-center py-16 glass-panel rounded-xl max-w-md mx-auto">
                    <h2 className="text-xl font-semibold text-gradient mb-3">Gallery Access</h2>
                    <p className="text-white/70 mb-4 text-sm">Sign in to view your collection</p>
                    <Button onClick={handleSignIn} className="bg-figuro-accent hover:bg-figuro-accent-hover">
                      Sign In / Sign Up
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
