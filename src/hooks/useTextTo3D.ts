
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TextTo3DResult {
  success: boolean;
  taskId?: string;
  status?: string;
  error?: string;
}

export const useTextTo3D = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  const generateModel = async (
    prompt: string, 
    artStyle: string, 
    negativePrompt: string = ""
  ): Promise<TextTo3DResult> => {
    setIsGenerating(true);
    setCurrentTaskId(null);

    try {
      console.log("Starting text to 3D generation...");
      
      const { data, error } = await supabase.functions.invoke('text-to-3d', {
        body: {
          prompt,
          art_style: artStyle,
          negative_prompt: negativePrompt
        }
      });

      if (error) {
        console.error("Text to 3D generation error:", error);
        throw new Error(error.message || 'Failed to generate 3D model');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate 3D model');
      }

      console.log("Text to 3D generation started successfully:", data);
      
      setCurrentTaskId(data.taskId);
      
      toast({
        title: "3D Model Generation Started",
        description: "Your 3D model is being created. This may take a few minutes.",
      });

      return {
        success: true,
        taskId: data.taskId,
        status: data.status
      };

    } catch (error) {
      console.error("Error in text to 3D generation:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to generate 3D model";
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    currentTaskId,
    generateModel,
    setCurrentTaskId
  };
};
