
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

  const generate3DModel = async (imageUrl: string, fileName: string, config?: Generate3DConfig) => {
    try {
      setIsGenerating(true);
      updateProgress({
        status: 'converting',
        progress: 10,
        message: 'Checking usage limits...'
      });

      console.log('🔄 [GALLERY] Starting 3D conversion for:', fileName, 'with config:', config);

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
          setIsGenerating(false); // Set to false only on success
          toast({
            title: "3D Model Generated",
            description: "Your 3D model has been created and saved to the gallery",
            variant: "default"
          });
        },
        onError: (error: string) => {
          console.error('❌ [GALLERY] 3D conversion failed:', error);
          setIsGenerating(false); // Set to false only on error
          updateProgress({
            status: 'error',
            progress: 0,
            message: error
          });
          
          // Show upgrade prompt for limit-related errors
          if (error.includes('limit') || error.includes('upgrade')) {
            toast({
              title: "3D Conversion Limit Reached",
              description: error,
              variant: "destructive"
            });
          } else {
            toast({
              title: "3D Generation Failed",
              description: error,
              variant: "destructive"
            });
          }
        }
      };

      // Start conversion with user config or defaults
      const taskId = await startConversion(
        imageUrl,
        config || defaultConfig,
        conversionCallbacks
      );

      // Poll for completion
      await pollConversionStatus(taskId, fileName, imageUrl, conversionCallbacks);

      // Refresh subscription data after successful conversion
      setTimeout(() => {
        checkSubscription();
      }, 1000);

    } catch (error) {
      console.error('❌ [GALLERY] 3D generation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate 3D model';
      
      // Set isGenerating to false on catch block error
      setIsGenerating(false);
      
      updateProgress({
        status: 'error',
        progress: 0,
        message: errorMessage
      });
      
      // Show upgrade prompt for limit-related errors
      if (errorMessage.includes('limit') || errorMessage.includes('upgrade')) {
        toast({
          title: "3D Conversion Limit Reached",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "3D Generation Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
    // Removed the finally block that was setting isGenerating to false
  };

  return {
    isGenerating,
    progress,
    generate3DModel,
    resetProgress
  };
};
