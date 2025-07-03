
import { useState, useCallback } from "react";
import { generateImage, cleanupImageUrl, type GenerationProgress } from "@/services/generationService";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useEnhancedUpgradeModal } from "@/hooks/useEnhancedUpgradeModal";

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  imageBlob?: Blob;
  error?: string;
  modelUsed?: string;
  retryAttempts?: number;
}

export const useImageGeneration = () => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const { toast } = useToast();
  
  const { canPerformAction, consumeAction } = useSubscription();
  const { showUpgradeModal } = useEnhancedUpgradeModal();

  const handleGenerate = useCallback(async (prompt: string, style: string): Promise<void> => {
    console.log("🎨 [IMAGE-GENERATION] Starting image generation");
    
    // Check if user can perform image generation
    if (!canPerformAction('image_generation')) {
      console.log("❌ [IMAGE-GENERATION] User has reached image generation limit");
      showUpgradeModal('image_generation');
      throw new Error("You've reached your daily limit for image generations. Please upgrade to continue.");
    }
    
    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please provide a prompt for image generation.",
        variant: "destructive",
      });
      throw new Error("Prompt is required");
    }

    if (prompt.length > 1000) {
      toast({
        title: "Prompt Too Long",
        description: "Please keep your prompt under 1000 characters.",
        variant: "destructive",
      });
      throw new Error("Prompt is too long");
    }

    setIsGeneratingImage(true);
    setGenerationProgress({ stage: 'validating', progress: 0, message: 'Preparing generation...' });
    
    // Clean up previous image
    if (generatedImage) {
      cleanupImageUrl(generatedImage);
      setGeneratedImage(null);
    }

    try {
      console.log("📤 [IMAGE-GENERATION] Calling generation service...");
      
      const result = await generateImage(
        prompt, 
        style, 
        "", // API key not needed for edge function
        0,  // Initial retry count
        (progress) => {
          setGenerationProgress(progress);
          console.log("📊 [IMAGE-GENERATION] Progress update:", progress);
        }
      );

      console.log("📊 [IMAGE-GENERATION] Generation result:", result);

      // Check if generation was successful
      if (!result.blob || !result.url || result.error) {
        throw new Error(result.error || 'Failed to generate image');
      }

      // Consume image generation credit AFTER successful generation
      console.log("💳 [IMAGE-GENERATION] Consuming image generation credit...");
      const consumptionResult = await consumeAction('image_generation');
      if (!consumptionResult) {
        console.warn("⚠️ [IMAGE-GENERATION] Failed to consume credit, but generation was successful");
      } else {
        console.log("✅ [IMAGE-GENERATION] Successfully consumed image generation credit");
      }

      // Set the generated image
      setGeneratedImage(result.url);
      setGenerationProgress({ 
        stage: 'completed', 
        progress: 100, 
        message: `Image generated successfully!${result.modelUsed ? ` (Model: ${result.modelUsed})` : ''}`,
        modelUsed: result.modelUsed
      });

      toast({
        title: "Image Generated",
        description: "Your image has been created successfully!",
      });

      console.log("✅ [IMAGE-GENERATION] Image generation completed successfully");

    } catch (error) {
      console.error("❌ [IMAGE-GENERATION] Error during image generation:", error);
      
      setGenerationProgress({ 
        stage: 'error', 
        progress: 0, 
        message: error instanceof Error ? error.message : 'Generation failed'
      });
      
      let errorMessage = "Failed to generate image";
      if (error instanceof Error) {
        if (error.message.includes('limit') || error.message.includes('quota')) {
          errorMessage = "You've reached your generation limit. Please upgrade to continue.";
        } else if (error.message.includes('authentication') || error.message.includes('JWT')) {
          errorMessage = "Authentication expired. Please refresh the page and try again.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Request timeout. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      // Only show toast for non-limit errors (limit errors show upgrade modal)
      if (!errorMessage.includes('limit') && !errorMessage.includes('quota')) {
        toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setIsGeneratingImage(false);
      // Clear progress after a delay
      setTimeout(() => setGenerationProgress(null), 3000);
    }
  }, [generatedImage, toast, canPerformAction, consumeAction, showUpgradeModal]);

  const resetGeneration = useCallback(() => {
    if (generatedImage) {
      cleanupImageUrl(generatedImage);
      setGeneratedImage(null);
    }
    setGenerationProgress(null);
    setIsGeneratingImage(false);
  }, [generatedImage]);

  return {
    isGeneratingImage,
    generatedImage,
    generationProgress,
    handleGenerate,
    resetGeneration
  };
};
