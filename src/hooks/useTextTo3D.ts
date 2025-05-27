
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TextTo3DConfig } from "@/components/studio/types/textTo3DConfig";

export interface TextTo3DResult {
  success: boolean;
  taskId?: string;
  status?: string;
  error?: string;
}

export interface TextTo3DProgress {
  status: string;
  progress: number;
  modelUrl: string;
  taskId?: string;
  thumbnailUrl?: string;
}

export const useTextTo3D = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TextTo3DProgress>({
    status: '',
    progress: 0,
    modelUrl: ''
  });
  const { toast } = useToast();

  const checkStatus = useCallback(async (taskId: string): Promise<void> => {
    try {
      console.log('🔍 [TEXT-TO-3D] Checking status for task:', taskId);
      
      const { data, error } = await supabase.functions.invoke('check-text-to-3d-status', {
        body: { taskId }
      });

      if (error) {
        console.error('❌ [TEXT-TO-3D] Status check error:', error);
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Status check failed');
      }

      console.log('📊 [TEXT-TO-3D] Status update:', data);

      // Update progress
      const newProgress: TextTo3DProgress = {
        status: data.status,
        progress: data.progress || 0,
        modelUrl: data.modelUrl || '',
        taskId: taskId,
        thumbnailUrl: data.thumbnailUrl
      };

      setProgress(newProgress);

      // Check if completed
      if (data.status === 'SUCCEEDED' || data.status === 'completed') {
        setIsGenerating(false);
        setProgress(prev => ({ ...prev, progress: 100 }));
        
        toast({
          title: "3D Model Generated",
          description: "Your text-to-3D model has been created successfully!",
        });
        return;
      }

      // Check if failed
      if (data.status === 'FAILED' || data.status === 'failed') {
        setIsGenerating(false);
        throw new Error('3D model generation failed');
      }

      // Continue polling if still in progress
      if (data.status === 'IN_PROGRESS' || data.status === 'PENDING' || data.status === 'processing') {
        setTimeout(() => checkStatus(taskId), 5000);
      }

    } catch (error) {
      console.error('❌ [TEXT-TO-3D] Status polling error:', error);
      setIsGenerating(false);
      setProgress(prev => ({ 
        ...prev, 
        status: 'error', 
        progress: 0 
      }));
      
      toast({
        title: "Status Check Failed",
        description: error instanceof Error ? error.message : "Failed to check generation status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const generateModel = async (
    prompt: string, 
    artStyle: string, 
    negativePrompt: string = ""
  ): Promise<TextTo3DResult> => {
    return generateModelWithConfig({
      prompt,
      artStyle,
      negativePrompt,
      mode: "preview"
    });
  };

  const generateModelWithConfig = async (config: TextTo3DConfig): Promise<TextTo3DResult> => {
    setIsGenerating(true);
    setCurrentTaskId(null);
    setProgress({
      status: 'starting',
      progress: 0,
      modelUrl: ''
    });

    try {
      console.log("🔄 [TEXT-TO-3D] Starting text to 3D generation with config:", config);
      
      const { data, error } = await supabase.functions.invoke('text-to-3d', {
        body: config
      });

      if (error) {
        console.error("❌ [TEXT-TO-3D] Generation error:", error);
        throw new Error(error.message || 'Failed to generate 3D model');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate 3D model');
      }

      console.log("✅ [TEXT-TO-3D] Generation started successfully:", data);
      
      const taskId = data.taskId;
      setCurrentTaskId(taskId);
      setProgress({
        status: 'processing',
        progress: 10,
        modelUrl: '',
        taskId: taskId
      });
      
      toast({
        title: "3D Model Generation Started",
        description: "Your 3D model is being created. This may take a few minutes.",
      });

      // Start polling for status
      setTimeout(() => checkStatus(taskId), 2000);

      return {
        success: true,
        taskId: taskId,
        status: data.status
      };

    } catch (error) {
      console.error("❌ [TEXT-TO-3D] Error in text to 3D generation:", error);
      
      setIsGenerating(false);
      setProgress({
        status: 'error',
        progress: 0,
        modelUrl: ''
      });
      
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
    }
  };

  const resetProgress = useCallback(() => {
    setProgress({
      status: '',
      progress: 0,
      modelUrl: ''
    });
    setCurrentTaskId(null);
    setIsGenerating(false);
  }, []);

  return {
    isGenerating,
    currentTaskId,
    progress,
    generateModel,
    generateModelWithConfig,
    resetProgress,
    setCurrentTaskId
  };
};
