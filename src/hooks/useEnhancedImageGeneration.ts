
import { useState, useCallback, useRef } from 'react';
import { generateImage, cleanupImageUrl, validateImageForDisplay } from '@/services/generationService';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedUpgradeModal } from '@/hooks/useEnhancedUpgradeModal';

interface GenerationState {
  isGenerating: boolean;
  generatedImage: string | null;
  generatedBlob: Blob | null;
  error: string | null;
  retryCount: number;
  lastPrompt: string | null;
  lastStyle: string | null;
}

interface UseEnhancedImageGenerationReturn {
  isGenerating: boolean;
  generatedImage: string | null;
  generatedBlob: Blob | null;
  error: string | null;
  retryCount: number;
  generateImage: (prompt: string, style: string) => Promise<void>;
  retryGeneration: () => Promise<void>;
  clearImage: () => void;
  clearError: () => void;
}

export const useEnhancedImageGeneration = (): UseEnhancedImageGenerationReturn => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    generatedImage: null,
    generatedBlob: null,
    error: null,
    retryCount: 0,
    lastPrompt: null,
    lastStyle: null,
  });

  const { toast } = useToast();
  const { showUpgradeModal } = useEnhancedUpgradeModal();
  
  // Use ref to track cleanup to prevent memory leaks
  const cleanupRef = useRef<string | null>(null);

  const handleGeneration = useCallback(async (prompt: string, style: string, isRetry = false) => {
    console.log(`🎨 [IMAGE-GENERATION-HOOK] ${isRetry ? 'Retrying' : 'Starting'} generation:`, {
      prompt: prompt.substring(0, 50) + '...',
      style,
      isRetry,
      retryCount: state.retryCount
    });

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      ...(isRetry ? {} : { retryCount: 0 }),
      lastPrompt: prompt,
      lastStyle: style,
    }));

    try {
      const result = await generateImage(prompt, style);
      
      console.log('📊 [IMAGE-GENERATION-HOOK] Generation result:', {
        success: !!result.blob,
        blobSize: result.blob?.size,
        hasUrl: !!result.url,
        error: result.error,
        method: result.method,
        retryAttempt: result.retryAttempt
      });

      if (result.error) {
        // Handle specific error types
        if (result.error.includes('limit reached') || result.error.includes('upgrade')) {
          console.log('📈 [IMAGE-GENERATION-HOOK] Usage limit reached, showing upgrade modal');
          showUpgradeModal('image_generation');
        }

        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: result.error || 'Generation failed',
          retryCount: prev.retryCount + (isRetry ? 1 : 0)
        }));

        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive",
        });

        return;
      }

      // Validate image before setting state
      if (!validateImageForDisplay(result.blob, result.url)) {
        const errorMsg = 'Generated image is invalid or corrupted';
        console.error('❌ [IMAGE-GENERATION-HOOK]', errorMsg);
        
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: errorMsg,
          retryCount: prev.retryCount + (isRetry ? 1 : 0)
        }));

        toast({
          title: "Generation Failed",
          description: errorMsg,
          variant: "destructive",
        });

        return;
      }

      // Clean up previous image URL to prevent memory leaks
      if (cleanupRef.current) {
        cleanupImageUrl(cleanupRef.current);
      }
      cleanupRef.current = result.url;

      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedImage: result.url,
        generatedBlob: result.blob,
        error: null,
        retryCount: 0 // Reset retry count on success
      }));

      toast({
        title: "Image Generated!",
        description: "Your figurine image has been created successfully.",
      });

      console.log('✅ [IMAGE-GENERATION-HOOK] Generation successful');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred';
      console.error('❌ [IMAGE-GENERATION-HOOK] Generation error:', error);

      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
        retryCount: prev.retryCount + (isRetry ? 1 : 0)
      }));

      toast({
        title: "Generation Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast, showUpgradeModal, state.retryCount]);

  const generateImageWrapper = useCallback(async (prompt: string, style: string) => {
    await handleGeneration(prompt, style, false);
  }, [handleGeneration]);

  const retryGeneration = useCallback(async () => {
    if (!state.lastPrompt || !state.lastStyle) {
      console.warn('⚠️ [IMAGE-GENERATION-HOOK] No previous generation to retry');
      toast({
        title: "Nothing to Retry",
        description: "No previous generation found to retry.",
        variant: "destructive",
      });
      return;
    }

    console.log('🔄 [IMAGE-GENERATION-HOOK] Retrying previous generation');
    await handleGeneration(state.lastPrompt, state.lastStyle, true);
  }, [state.lastPrompt, state.lastStyle, handleGeneration, toast]);

  const clearImage = useCallback(() => {
    console.log('🧹 [IMAGE-GENERATION-HOOK] Clearing generated image');
    
    // Clean up blob URL
    if (cleanupRef.current) {
      cleanupImageUrl(cleanupRef.current);
      cleanupRef.current = null;
    }

    setState(prev => ({
      ...prev,
      generatedImage: null,
      generatedBlob: null,
      error: null,
      retryCount: 0
    }));
  }, []);

  const clearError = useCallback(() => {
    console.log('❌ [IMAGE-GENERATION-HOOK] Clearing error');
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    isGenerating: state.isGenerating,
    generatedImage: state.generatedImage,
    generatedBlob: state.generatedBlob,
    error: state.error,
    retryCount: state.retryCount,
    generateImage: generateImageWrapper,
    retryGeneration,
    clearImage,
    clearError,
  };
};
