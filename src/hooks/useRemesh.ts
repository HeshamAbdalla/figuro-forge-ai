
import { useState, useCallback } from "react";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface RemeshSettings {
  targetPolycount?: number;
  topologyType?: 'quad' | 'triangle';
  preserveUVs?: boolean;
  preserveNormals?: boolean;
}

export interface RemeshProgress {
  taskId: string | null;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  remeshedModelUrl?: string;
  originalModelUrl?: string;
}

export const useRemesh = () => {
  const { user } = useEnhancedAuth();
  const [isRemeshing, setIsRemeshing] = useState(false);
  const [progress, setProgress] = useState<RemeshProgress>({
    taskId: null,
    status: 'idle',
    progress: 0,
    message: '',
  });

  const startRemesh = useCallback(async (modelUrl: string, settings: RemeshSettings = {}) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the remeshing feature.",
        variant: "destructive",
      });
      return null;
    }

    if (!modelUrl) {
      toast({
        title: "Invalid Model",
        description: "Please provide a valid model URL to remesh.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsRemeshing(true);
      setProgress({
        taskId: null,
        status: 'processing',
        progress: 10,
        message: 'Starting remesh process...',
      });

      console.log('🔄 [REMESH] Starting remesh for model:', modelUrl);
      console.log('🔄 [REMESH] Settings:', settings);

      const { data, error } = await supabase.functions.invoke('remesh-model', {
        body: {
          modelUrl,
          settings: {
            targetPolycount: settings.targetPolycount || 1000,
            topologyType: settings.topologyType || 'triangle',
            preserveUVs: settings.preserveUVs !== false,
            preserveNormals: settings.preserveNormals !== false,
          },
        },
      });

      if (error) {
        console.error('❌ [REMESH] Error starting remesh:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to start remesh process');
      }

      const taskId = data.taskId;
      console.log('✅ [REMESH] Remesh started with task ID:', taskId);

      setProgress({
        taskId,
        status: 'processing',
        progress: 20,
        message: 'Remesh process initiated...',
        originalModelUrl: modelUrl,
      });

      // Start polling for status
      pollRemeshStatus(taskId);

      toast({
        title: "Remesh Started",
        description: "Your model is being remeshed. This may take a few minutes.",
      });

      return taskId;
    } catch (error) {
      console.error('❌ [REMESH] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start remesh process';
      
      setProgress({
        taskId: null,
        status: 'failed',
        progress: 0,
        message: errorMessage,
      });

      toast({
        title: "Remesh Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setIsRemeshing(false);
      return null;
    }
  }, [user]);

  const pollRemeshStatus = useCallback(async (taskId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      try {
        attempts++;
        console.log(`🔍 [REMESH] Checking status (${attempts}/${maxAttempts}) for task:`, taskId);

        const { data, error } = await supabase.functions.invoke('check-remesh-status', {
          body: {},
          method: 'GET',
        });

        if (error) {
          throw error;
        }

        const { status, progress: apiProgress, remeshedModelUrl } = data;
        console.log('📊 [REMESH] Status update:', { status, progress: apiProgress, remeshedModelUrl });

        setProgress(prev => ({
          ...prev,
          status: status as RemeshProgress['status'],
          progress: apiProgress || 0,
          message: status === 'completed' ? 'Remesh completed successfully!' : 'Processing remesh...',
          remeshedModelUrl,
        }));

        if (status === 'completed' && remeshedModelUrl) {
          console.log('✅ [REMESH] Remesh completed successfully');
          setIsRemeshing(false);
          
          toast({
            title: "Remesh Completed",
            description: "Your model has been successfully remeshed!",
          });
          return;
        }

        if (status === 'failed') {
          throw new Error('Remesh process failed');
        }

        if (status === 'processing' && attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
          return;
        }

        if (attempts >= maxAttempts) {
          throw new Error('Remesh timeout - please try again');
        }

      } catch (error) {
        console.error('❌ [REMESH] Status check error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Status check failed';
        
        setProgress(prev => ({
          ...prev,
          status: 'failed',
          message: errorMessage,
        }));

        setIsRemeshing(false);
        
        toast({
          title: "Remesh Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    await checkStatus();
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      taskId: null,
      status: 'idle',
      progress: 0,
      message: '',
    });
    setIsRemeshing(false);
  }, []);

  return {
    isRemeshing,
    progress,
    startRemesh,
    resetProgress,
  };
};
