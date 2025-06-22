
import { useCallback, useMemo, useRef, useEffect } from "react";
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
  handleGenerate: (prompt: string, style: string) => Promise<void>;
  generate3DModel: (imageUrl: string, fileName: string, config?: any, shouldUpdateExisting?: boolean) => Promise<void>;
  generateTextTo3DModel: (prompt: string, artStyle: string, negativePrompt?: string) => Promise<any>;
  generateTextTo3DModelWithConfig: (config: any) => Promise<any>;
  resetProgress: () => void;
  showUpgradeModal: (action: "image_generation" | "model_conversion" | "model_remesh") => void;
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

  // FIXED: Create truly stable references for each handler function
  const stableHandleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [navigate]);

  const stableHandleSignIn = useCallback(() => {
    navigate("/auth");
  }, [navigate]);

  const stableOnGenerate = useCallback(async (prompt: string, style: string) => {
    try {
      console.log('🎨 [STUDIO-HANDLERS] Image generation started');
      await handleGenerate(prompt, style);
    } catch (error: any) {
      console.log('❌ [STUDIO-HANDLERS] Image generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('👀 [STUDIO-HANDLERS] Triggering upgrade modal from image generation');
        showUpgradeModal("image_generation");
      } else {
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate image",
          variant: "destructive",
        });
      }
    }
  }, [handleGenerate, showUpgradeModal, toast]);

  const stableHandleOpenConfigModal = useCallback(() => {
    if (!generatedImage) {
      toast({
        title: "No Image",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }
    setConfigModalOpen(true);
  }, [generatedImage, setConfigModalOpen, toast]);

  const stableHandleGenerate3DWithConfig = useCallback(async (config: any) => {
    if (!generatedImage) {
      toast({
        title: "No Image",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🎯 [STUDIO-HANDLERS] 3D generation with config started');
      setConfigModalOpen(false);
      await generate3DModel(generatedImage, `generated-${Date.now()}.jpg`, config);
    } catch (error: any) {
      console.log('❌ [STUDIO-HANDLERS] 3D generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('👀 [STUDIO-HANDLERS] Triggering upgrade modal from 3D generation');
        showUpgradeModal("model_conversion");
      } else {
        toast({
          title: "3D Generation Failed",
          description: error.message || "Failed to generate 3D model",
          variant: "destructive",
        });
      }
    }
  }, [generatedImage, setConfigModalOpen, generate3DModel, showUpgradeModal, toast]);

  const stableHandleQuickConvert = useCallback(async () => {
    if (!generatedImage) {
      toast({
        title: "No Image",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('⚡ [STUDIO-HANDLERS] Quick convert started');
      await generate3DModel(generatedImage, `generated-${Date.now()}.jpg`);
    } catch (error: any) {
      console.log('❌ [STUDIO-HANDLERS] Quick convert failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('👀 [STUDIO-HANDLERS] Triggering upgrade modal from quick convert');
        showUpgradeModal("model_conversion");
      } else {
        toast({
          title: "Conversion Failed",
          description: error.message || "Failed to convert to 3D",
          variant: "destructive",
        });
      }
    }
  }, [generatedImage, generate3DModel, showUpgradeModal, toast]);

  const stableHandleTextTo3D = useCallback(async (prompt: string, artStyle: string, negativePrompt: string = "") => {
    try {
      console.log('📝 [STUDIO-HANDLERS] Text-to-3D generation started');
      return await generateTextTo3DModel(prompt, artStyle, negativePrompt);
    } catch (error: any) {
      console.log('❌ [STUDIO-HANDLERS] Text-to-3D failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('👀 [STUDIO-HANDLERS] Triggering upgrade modal from text-to-3D');
        showUpgradeModal("model_conversion");
      } else {
        toast({
          title: "Text-to-3D Failed",
          description: error.message || "Failed to generate 3D model from text",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [generateTextTo3DModel, showUpgradeModal, toast]);

  const stableHandleOpenTextTo3DConfigModal = useCallback((prompt: string) => {
    setTextTo3DConfigPrompt(prompt);
    setTextTo3DConfigModalOpen(true);
  }, [setTextTo3DConfigPrompt, setTextTo3DConfigModalOpen]);

  const stableHandleTextTo3DWithConfig = useCallback(async (config: any) => {
    try {
      console.log('⚙️ [STUDIO-HANDLERS] Text-to-3D with config started');
      setTextTo3DConfigModalOpen(false);
      return await generateTextTo3DModelWithConfig(config);
    } catch (error: any) {
      console.log('❌ [STUDIO-HANDLERS] Text-to-3D with config failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('👀 [STUDIO-HANDLERS] Triggering upgrade modal from text-to-3D config');
        showUpgradeModal("model_conversion");
      } else {
        toast({
          title: "Text-to-3D Failed",
          description: error.message || "Failed to generate 3D model",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [setTextTo3DConfigModalOpen, generateTextTo3DModelWithConfig, showUpgradeModal, toast]);

  const stableHandleModelUpload = useCallback((file: File) => {
    console.log('📁 [STUDIO-HANDLERS] Model upload started');
    const url = URL.createObjectURL(file);
    setCustomModelUrl(url);
    setCustomModelFile(file);
  }, [setCustomModelUrl, setCustomModelFile]);

  const stableHandleCloseGenerationModal = useCallback(() => {
    console.log('🔄 [STUDIO-HANDLERS] Closing generation modal and resetting progress');
    setGenerationModalOpen(false);
    resetProgress();
  }, [setGenerationModalOpen, resetProgress]);

  // Return a simple object with stable references - no useMemo needed
  return {
    handleSignOut: stableHandleSignOut,
    handleSignIn: stableHandleSignIn,
    onGenerate: stableOnGenerate,
    handleOpenConfigModal: stableHandleOpenConfigModal,
    handleGenerate3DWithConfig: stableHandleGenerate3DWithConfig,
    handleQuickConvert: stableHandleQuickConvert,
    handleTextTo3D: stableHandleTextTo3D,
    handleOpenTextTo3DConfigModal: stableHandleOpenTextTo3DConfigModal,
    handleTextTo3DWithConfig: stableHandleTextTo3DWithConfig,
    handleModelUpload: stableHandleModelUpload,
    handleCloseGenerationModal: stableHandleCloseGenerationModal,
  };
};
