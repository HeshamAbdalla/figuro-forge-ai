
import { useState, useCallback } from "react";
import { useImageTo3D } from "@/hooks/useImageTo3D";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConversionProgress {
  status: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
  progress: number;
  percentage: number;
  message: string;
  taskId?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
}

export const useGallery3DGeneration = () => {
  const { toast } = useToast();
  const {
    isGenerating: isImageTo3DGenerating,
    progress: imageToThreeDProgress,
    generateModelFromImage,
    resetProgress: resetImageTo3DProgress
  } = useImageTo3D();

  const [progress, setProgress] = useState<ConversionProgress>({
    status: 'idle',
    progress: 0,
    percentage: 0,
    message: ''
  });

  // Map the imageToThreeD progress to gallery progress format
  const mappedProgress: ConversionProgress = {
    status: imageToThreeDProgress.status === 'processing' ? 'converting' :
           imageToThreeDProgress.status === 'SUCCEEDED' ? 'completed' :
           imageToThreeDProgress.status === 'error' ? 'error' : 'idle',
    progress: imageToThreeDProgress.progress,
    percentage: imageToThreeDProgress.progress,
    message: imageToThreeDProgress.status === 'processing' ? 'Converting image to 3D model...' :
             imageToThreeDProgress.status === 'SUCCEEDED' ? 'Conversion completed!' :
             imageToThreeDProgress.status === 'error' ? 'Conversion failed' : '',
    taskId: imageToThreeDProgress.taskId,
    modelUrl: imageToThreeDProgress.modelUrl,
    thumbnailUrl: imageToThreeDProgress.thumbnailUrl
  };

  const generate3DModel = useCallback(async (
    imageUrl: string,
    filename: string,
    config?: any,
    shouldUpdateExisting: boolean = true
  ) => {
    try {
      console.log('🔄 [GALLERY-3D] Starting 3D generation:', { imageUrl, filename, config, shouldUpdateExisting });
      
      // Enhanced authentication check
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Please log in to generate 3D models');
      }

      // Map config to ImageTo3DConfig format
      const imageToThreeDConfig = {
        artStyle: config?.art_style || 'realistic',
        aiModel: config?.ai_model || 'meshy-5',
        topology: config?.topology || 'quad',
        targetPolycount: config?.target_polycount || 20000,
        textureRichness: config?.texture_richness || 'high',
        moderation: config?.moderation !== undefined ? config.moderation : true,
        negativePrompt: config?.negative_prompt
      };

      console.log('📤 [GALLERY-3D] Calling generateModelFromImage with config:', imageToThreeDConfig);
      
      const result = await generateModelFromImage(imageUrl, filename, imageToThreeDConfig);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate 3D model');
      }

      console.log('✅ [GALLERY-3D] 3D generation started successfully');

      // If we need to create a new figurine record (for camera captures)
      if (!shouldUpdateExisting && result.taskId) {
        try {
          console.log('💾 [GALLERY-3D] Creating new figurine record for camera capture');
          
          const { error: figurineError } = await supabase
            .from('figurines')
            .insert({
              user_id: session.user.id,
              task_id: result.taskId,
              status: 'processing',
              image_url: imageUrl.startsWith('blob:') ? null : imageUrl,
              name: `Camera Capture ${new Date().toLocaleDateString()}`,
              prompt: 'Camera captured image converted to 3D',
              art_style: imageToThreeDConfig.artStyle,
              ai_model: imageToThreeDConfig.aiModel
            });

          if (figurineError) {
            console.error('⚠️ [GALLERY-3D] Failed to create figurine record:', figurineError);
          } else {
            console.log('✅ [GALLERY-3D] Figurine record created successfully');
          }
        } catch (dbError) {
          console.error('⚠️ [GALLERY-3D] Database error creating figurine:', dbError);
        }
      }

    } catch (error) {
      console.error('❌ [GALLERY-3D] 3D generation error:', error);
      
      let errorMessage = "Failed to generate 3D model";
      if (error instanceof Error) {
        if (error.message.includes('authentication') || error.message.includes('JWT')) {
          errorMessage = "Authentication expired. Please refresh the page and try again.";
        } else if (error.message.includes('limit reached')) {
          errorMessage = "You have reached your conversion limit. Please upgrade your plan to continue.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "3D Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  }, [generateModelFromImage, toast]);

  const resetProgress = useCallback(() => {
    resetImageTo3DProgress();
    setProgress({
      status: 'idle',
      progress: 0,
      percentage: 0,
      message: ''
    });
  }, [resetImageTo3DProgress]);

  return {
    isGenerating: isImageTo3DGenerating,
    progress: mappedProgress,
    generate3DModel,
    resetProgress
  };
};
