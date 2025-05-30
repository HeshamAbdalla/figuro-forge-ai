
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseStudioHandlersProps {
  generatedImage: string | null;
  setCustomModelUrl: (url: string | null) => void;
  setCustomModelFile: (file: File | null) => void;
  setConfigModalOpen: (open: boolean) => void;
  setTextTo3DConfigModalOpen: (open: boolean) => void;
  setGenerationModalOpen: (open: boolean) => void;
  setTextTo3DConfigPrompt: (prompt: string) => void;
  handleGenerate: (prompt: string, style: string, apiKey?: string) => Promise<{ success: boolean; needsApiKey: boolean; needsUpgrade?: boolean; error?: string }>;
  generate3DModel: (imageUrl: string, filename: string, options?: any) => Promise<void>;
  generateTextTo3DModel: (prompt: string) => Promise<void>;
  generateTextTo3DModelWithConfig: (prompt: string, config: any) => Promise<void>;
  resetProgress: () => void;
  showUpgradeModal?: (actionType: "image_generation" | "model_conversion") => void;
}

export const useStudioHandlers = ({
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
}: UseStudioHandlersProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const onGenerate = async (prompt: string, style: string, apiKey?: string) => {
    const result = await handleGenerate(prompt, style, apiKey);
    
    // Handle upgrade needed scenario
    if (result.needsUpgrade && showUpgradeModal) {
      showUpgradeModal("image_generation");
    }
    
    return result;
  };

  const handleOpenConfigModal = () => {
    if (!generatedImage) {
      toast({
        title: "No image available",
        description: "Please generate an image first before converting to 3D",
        variant: "destructive",
      });
      return;
    }
    setConfigModalOpen(true);
  };

  const handleQuickConvert = async () => {
    if (!generatedImage) {
      toast({
        title: "No image available",
        description: "Please generate an image first before converting to 3D",
        variant: "destructive",
      });
      return;
    }

    try {
      await generate3DModel(generatedImage, "generated-image");
    } catch (error) {
      console.error("Quick convert error:", error);
      
      // Check if error is related to usage limits
      if (error instanceof Error && (
        error.message.includes('limit reached') || 
        error.message.includes('conversion limit')
      )) {
        if (showUpgradeModal) {
          showUpgradeModal("model_conversion");
        }
      }
    }
  };

  const handleGenerate3DWithConfig = async (config: any) => {
    if (!generatedImage) {
      toast({
        title: "No image available",
        description: "Please generate an image first before converting to 3D",
        variant: "destructive",
      });
      return;
    }

    try {
      await generate3DModel(generatedImage, "generated-image", config);
      setConfigModalOpen(false);
    } catch (error) {
      console.error("Generate 3D with config error:", error);
      
      // Check if error is related to usage limits
      if (error instanceof Error && (
        error.message.includes('limit reached') || 
        error.message.includes('conversion limit')
      )) {
        if (showUpgradeModal) {
          showUpgradeModal("model_conversion");
        }
      }
    }
  };

  const handleTextTo3D = async (prompt: string) => {
    try {
      await generateTextTo3DModel(prompt);
    } catch (error) {
      console.error("Text to 3D error:", error);
      
      // Check if error is related to usage limits
      if (error instanceof Error && (
        error.message.includes('limit reached') || 
        error.message.includes('conversion limit')
      )) {
        if (showUpgradeModal) {
          showUpgradeModal("model_conversion");
        }
      }
    }
  };

  const handleOpenTextTo3DConfigModal = (prompt: string) => {
    setTextTo3DConfigPrompt(prompt);
    setTextTo3DConfigModalOpen(true);
  };

  const handleTextTo3DWithConfig = async (prompt: string, config: any) => {
    try {
      await generateTextTo3DModelWithConfig(prompt, config);
      setTextTo3DConfigModalOpen(false);
    } catch (error) {
      console.error("Text to 3D with config error:", error);
      
      // Check if error is related to usage limits
      if (error instanceof Error && (
        error.message.includes('limit reached') || 
        error.message.includes('conversion limit')
      )) {
        if (showUpgradeModal) {
          showUpgradeModal("model_conversion");
        }
      }
    }
  };

  const handleModelUpload = (file: File) => {
    const modelUrl = URL.createObjectURL(file);
    setCustomModelUrl(modelUrl);
    setCustomModelFile(file);
    resetProgress();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSignIn = () => {
    navigate("/auth");
  };

  const handleCloseGenerationModal = () => {
    setGenerationModalOpen(false);
  };

  return {
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
  };
};
