
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { GenerateResult } from "@/hooks/useImageGeneration";
import type { TextTo3DResult } from "@/hooks/useTextTo3D";
import type { TextTo3DConfig } from "@/components/studio/types/textTo3DConfig";

interface UseStudioHandlersProps {
  generatedImage: string | null;
  setCustomModelUrl: (url: string | null) => void;
  setCustomModelFile: (file: File | null) => void;
  setConfigModalOpen: (open: boolean) => void;
  setTextTo3DConfigModalOpen: (open: boolean) => void;
  setGenerationModalOpen: (open: boolean) => void;
  setTextTo3DConfigPrompt: (prompt: string) => void;
  handleGenerate: (prompt: string, style: string, apiKey?: string, preGeneratedImageUrl?: string) => Promise<GenerateResult>;
  generate3DModel: (imageUrl: string, filename: string, options?: any) => Promise<void>;
  generateTextTo3DModel: (prompt: string, artStyle: string, negativePrompt?: string) => Promise<TextTo3DResult>;
  generateTextTo3DModelWithConfig: (config: TextTo3DConfig) => Promise<TextTo3DResult>;
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

  const handleTextTo3D = async (prompt: string, artStyle: string, negativePrompt?: string) => {
    try {
      const result = await generateTextTo3DModel(prompt, artStyle, negativePrompt);
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate 3D model from text');
      }
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

  const handleTextTo3DWithConfig = async (config: TextTo3DConfig) => {
    try {
      const result = await generateTextTo3DModelWithConfig(config);
      setTextTo3DConfigModalOpen(false);
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate 3D model with config');
      }
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
