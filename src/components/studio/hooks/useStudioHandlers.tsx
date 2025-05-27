import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import type { Generate3DConfig } from "@/components/gallery/types/conversion";

interface UseStudioHandlersProps {
  generatedImage: string | null;
  setCustomModelUrl: (url: string | null) => void;
  setCustomModelFile: (file: File | null) => void;
  setConfigModalOpen: (open: boolean) => void;
  setGenerationModalOpen: (open: boolean) => void;
  setTextTo3DProgress: (progress: { status: string; progress: number; modelUrl: string }) => void;
  handleGenerate: (prompt: string, style: string, apiKey: string) => Promise<any>;
  generate3DModel: (image: string, fileName: string, config: Generate3DConfig, shouldUpdateExisting?: boolean) => Promise<void>;
  generateTextTo3DModel: (prompt: string, artStyle: string, negativePrompt: string) => Promise<any>;
  resetProgress: () => void;
}

export const useStudioHandlers = ({
  generatedImage,
  setCustomModelUrl,
  setCustomModelFile,
  setConfigModalOpen,
  setGenerationModalOpen,
  setTextTo3DProgress,
  handleGenerate,
  generate3DModel,
  generateTextTo3DModel,
  resetProgress
}: UseStudioHandlersProps) => {
  const { toast } = useToast();
  const { user: authUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { canPerformAction, consumeAction } = useSubscription();

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
    
    // Start the 3D generation process with shouldUpdateExisting = true for studio
    await generate3DModel(generatedImage, fileName, config, true);
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

    // The generateTextTo3DModel function now handles its own progress tracking
    await generateTextTo3DModel(prompt, artStyle, negativePrompt);
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
    setGenerationModalOpen(false);
    resetProgress();
  };

  return {
    onGenerate,
    handleOpenConfigModal,
    handleGenerate3DWithConfig,
    handleTextTo3D,
    handleModelUpload,
    handleSignOut,
    handleSignIn,
    handleCloseGenerationModal
  };
};
