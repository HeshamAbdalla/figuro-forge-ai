
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { useConversionProgress } from './hooks/useConversionProgress';
import { startConversion } from './services/conversionService';
import { pollConversionStatus } from './services/statusPollingService';
import { Generate3DConfig, ConversionProgress } from './types/conversion';

export type { Generate3DConfig, ConversionProgress };

export const useGallery3DGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { progress, updateProgress, resetProgress } = useConversionProgress();
  const { toast } = useToast();
  const { canPerformAction, checkSubscription, consumeAction } = useSubscription();

  const generate3DModel = async (
    imageUrl: string, 
    fileName: string, 
    config?: Generate3DConfig,
    shouldUpdateExisting: boolean = false // New parameter to control behavior
  ) => {
    try {
      setIsGenerating(true);
      updateProgress({
        status: 'converting',
        progress: 10,
        message: 'Checking usage limits...'
      });

      console.log('🔄 [GALLERY] Starting 3D conversion for:', fileName, 'with config:', config, 'shouldUpdateExisting:', shouldUpdateExisting);

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Please log in to generate 3D models');
      }

      // Check if user can perform model conversion
      if (!canPerformAction('model_conversion')) {
        throw new Error('You have reached your 3D model conversion limit. Please upgrade your plan to continue.');
      }

      // Consume usage before conversion
      const consumed = await consumeAction("model_conversion");
      if (!consumed) {
        throw new Error('You have reached your 3D model conversion limit. Please upgrade your plan to continue.');
      }

      const defaultConfig: Generate3DConfig = {
        art_style: 'realistic',
        ai_model: 'meshy-5',
        topology: 'quad',
        target_polycount: 20000,
        texture_richness: 'high',
        moderation: true
      };

      const conversionCallbacks = {
        onProgressUpdate: updateProgress,
        onSuccess: (modelUrl: string, thumbnailUrl?: string) => {
          console.log('✅ [GALLERY] 3D conversion completed successfully');
          setIsGenerating(false);
          toast({
            title: "3D Model Generated",
            description: shouldUpdateExisting 
              ? "Your 3D model has been added to the existing figurine"
              : "Your 3D model has been created and saved to the gallery",
            variant: "default"
          });
        },
        onError: (error: string) => {
          console.error('❌ [GALLERY] 3D conversion failed:', error);
          setIsGenerating(false);
          updateProgress({
            status: 'error',
            progress: 0,
            message: error
          });
          
          // Provide user-friendly error messages
          let userMessage = error;
          let toastTitle = "3D Generation Failed";
          
          if (error.includes('limit') || error.includes('upgrade')) {
            toastTitle = "3D Conversion Limit Reached";
          } else if (error.includes('image format') || error.includes('Invalid image')) {
            userMessage = "The image format is not supported. Please try with a different image or format.";
          } else if (error.includes('rate limit')) {
            userMessage = "Service is temporarily busy. Please try again in a few minutes.";
          } else if (error.includes('authentication')) {
            userMessage = "Authentication error. Please try signing in again.";
          }
          
          toast({
            title: toastTitle,
            description: userMessage,
            variant: "destructive"
          });
        }
      };

      // Start conversion with user config or defaults
      const taskId = await startConversion(
        imageUrl,
        config || defaultConfig,
        conversionCallbacks
      );

      // Poll for completion with the shouldUpdateExisting flag
      await pollConversionStatus(taskId, fileName, imageUrl, conversionCallbacks, shouldUpdateExisting);

      // Refresh subscription data after successful conversion
      setTimeout(() => {
        checkSubscription();
      }, 1000);

    } catch (error) {
      console.error('❌ [GALLERY] 3D generation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate 3D model';
      
      setIsGenerating(false);
      
      updateProgress({
        status: 'error',
        progress: 0,
        message: errorMessage
      });
      
      // Provide user-friendly error messages
      let userMessage = errorMessage;
      let toastTitle = "3D Generation Failed";
      
      if (errorMessage.includes('limit') || errorMessage.includes('upgrade')) {
        toastTitle = "3D Conversion Limit Reached";
      } else if (errorMessage.includes('image format') || errorMessage.includes('Invalid image')) {
        userMessage = "The image format is not supported. Please try with a different image or format.";
      } else if (errorMessage.includes('rate limit')) {
        userMessage = "Service is temporarily busy. Please try again in a few minutes.";
      } else if (errorMessage.includes('authentication')) {
        userMessage = "Authentication error. Please try signing in again.";
      } else if (errorMessage.includes('Failed to convert image to base64')) {
        userMessage = "Unable to process the image. Please try generating a new image or using a different format.";
      }
      
      toast({
        title: toastTitle,
        description: userMessage,
        variant: "destructive"
      });
    }
  };

  return {
    isGenerating,
    progress,
    generate3DModel,
    resetProgress
  };
};
