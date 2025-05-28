
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
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
  generate3DModel: (imageUrl: string, fileName: string, config?: any) => Promise<void>;
  generateTextTo3DModel: (prompt: string, artStyle: string, negativePrompt?: string) => Promise<TextTo3DResult>;
  generateTextTo3DModelWithConfig: (config: TextTo3DConfig) => Promise<TextTo3DResult>;
  resetProgress: () => void;
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
  resetProgress
}: UseStudioHandlersProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const onGenerate = async (prompt: string, style: string) => {
    try {
      const result = await handleGenerate(prompt, style);
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpenConfigModal = () => {
    if (!generatedImage) {
      toast({
        title: "No image to convert",
        description: "Please generate an image first",
        variant: "destructive"
      });
      return;
    }
    setConfigModalOpen(true);
  };

  const handleQuickConvert = async () => {
    if (!generatedImage) {
      toast({
        title: "No image to convert",
        description: "Please generate an image first",
        variant: "destructive"
      });
      return;
    }

    try {
      await generate3DModel(generatedImage, 'generated-image.png');
    } catch (error) {
      console.error('Failed to convert to 3D:', error);
    }
  };

  const handleGenerate3DWithConfig = async (config: any) => {
    if (!generatedImage) {
      toast({
        title: "No image to convert",
        description: "Please generate an image first",
        variant: "destructive"
      });
      return;
    }

    try {
      setConfigModalOpen(false);
      await generate3DModel(generatedImage, 'generated-image.png', config);
    } catch (error) {
      console.error('Failed to convert to 3D with config:', error);
    }
  };

  const handleTextTo3D = async (prompt: string, artStyle: string, negativePrompt: string) => {
    try {
      const result = await generateTextTo3DModel(prompt, artStyle, negativePrompt);
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate 3D model from text');
      }
    } catch (error) {
      console.error('Failed to generate text-to-3D:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate 3D model from text. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpenTextTo3DConfigModal = (prompt: string) => {
    setTextTo3DConfigPrompt(prompt);
    setTextTo3DConfigModalOpen(true);
  };

  const handleTextTo3DWithConfig = async (config: any) => {
    try {
      setTextTo3DConfigModalOpen(false);
      const result = await generateTextTo3DModelWithConfig(config);
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate 3D model with config');
      }
    } catch (error) {
      console.error('Failed to generate text-to-3D with config:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate 3D model with config. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleModelUpload = async (figurineId: string, file: File) => {
    try {
      const objectUrl = URL.createObjectURL(file);
      setCustomModelUrl(objectUrl);
      setCustomModelFile(file);
      
      toast({
        title: "Model uploaded",
        description: "Your 3D model has been loaded successfully",
      });
    } catch (error) {
      console.error('Failed to upload model:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload model. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleCloseGenerationModal = () => {
    setGenerationModalOpen(false);
    resetProgress();
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
