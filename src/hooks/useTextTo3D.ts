
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
  downloadStatus?: string;
}

export const useTextTo3D = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TextTo3DProgress>({
    status: '',
    progress: 0,
    modelUrl: '',
    downloadStatus: 'pending'
  });
  const { toast } = useToast();

  // Enhanced authentication helper
  const ensureValidSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ [TEXT-TO-3D] Session error:', error);
        throw new Error('Authentication session error. Please refresh the page and try again.');
      }
      
      if (!session?.access_token) {
        throw new Error('No valid authentication session. Please sign in again.');
      }
      
      // Check if token is expired (add 5 minute buffer)
      if (session.expires_at && (Date.now() / 1000) > (session.expires_at - 300)) {
        console.log('🔄 [TEXT-TO-3D] Token near expiry, refreshing...');
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session?.access_token) {
          throw new Error('Failed to refresh authentication. Please sign in again.');
        }
        
        return refreshData.session.access_token;
      }
      
      return session.access_token;
    } catch (error) {
      console.error('❌ [TEXT-TO-3D] Auth validation failed:', error);
      throw error;
    }
  };

  // Enhanced input validation
  const validateTextTo3DInput = (config: TextTo3DConfig): string | null => {
    if (!config.prompt || typeof config.prompt !== 'string') {
      return 'Prompt is required';
    }
    
    if (config.prompt.trim().length === 0) {
      return 'Prompt cannot be empty';
    }
    
    if (config.prompt.length > 1000) {
      return 'Prompt is too long. Maximum 1000 characters allowed.';
    }
    
    const validArtStyles = ['realistic', 'cartoon', 'low-poly', 'sculpture', 'pbr'];
    if (config.artStyle && !validArtStyles.includes(config.artStyle)) {
      return 'Invalid art style selected';
    }
    
    const validModes = ['preview', 'refine'];
    if (config.mode && !validModes.includes(config.mode)) {
      return 'Invalid generation mode selected';
    }
    
    if (config.targetPolycount && (typeof config.targetPolycount !== 'number' || config.targetPolycount <= 0)) {
      return 'Target polycount must be a positive number';
    }
    
    return null;
  };

  const checkStatus = useCallback(async (taskId: string): Promise<void> => {
    try {
      console.log('🔍 [TEXT-TO-3D] Checking status for task:', taskId);
      
      // Ensure we have a valid session before making the request
      await ensureValidSession();
      
      // Add timeout to the status check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const { data, error } = await supabase.functions.invoke('check-text-to-3d-status', {
        body: { taskId },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ [TEXT-TO-3D] Status check error:', error);
        
        // Handle specific authentication errors
        if (error.message?.includes('authentication') || error.message?.includes('JWT')) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        }
        
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Status check failed');
      }

      console.log('📊 [TEXT-TO-3D] Status update:', data);

      // Update progress with download status
      const newProgress: TextTo3DProgress = {
        status: data.status,
        progress: data.progress || 0,
        modelUrl: data.modelUrl || '',
        taskId: taskId,
        thumbnailUrl: data.thumbnailUrl,
        downloadStatus: data.downloadStatus || 'pending'
      };

      setProgress(newProgress);

      // Check if completed and downloaded
      if (data.status === 'SUCCEEDED' || data.status === 'completed') {
        // If download is still in progress, continue polling
        if (data.downloadStatus === 'downloading') {
          console.log('📥 [TEXT-TO-3D] Model downloaded, saving to storage...');
          setTimeout(() => checkStatus(taskId), 3000);
          return;
        }
        
        // If download completed successfully
        if (data.downloadStatus === 'completed') {
          setIsGenerating(false);
          setProgress(prev => ({ ...prev, progress: 100 }));
          
          toast({
            title: "3D Model Generated",
            description: "Your text-to-3D model has been created and saved successfully!",
          });
          return;
        }
        
        // If download failed but we have the original URL
        if (data.downloadStatus === 'failed' && data.modelUrl) {
          setIsGenerating(false);
          setProgress(prev => ({ ...prev, progress: 100 }));
          
          toast({
            title: "3D Model Generated",
            description: "Your 3D model is ready, but saving to storage failed. You can still view it.",
            variant: "destructive",
          });
          return;
        }
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
        progress: 0,
        downloadStatus: 'failed'
      }));
      
      let errorMessage = "Failed to check generation status";
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timeout. Please try again.";
        } else if (error.message.includes('authentication') || error.message.includes('JWT')) {
          errorMessage = "Authentication expired. Please refresh the page and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Status Check Failed",
        description: errorMessage,
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
    console.log("🔄 [TEXT-TO-3D] Starting text to 3D generation with config:", config);
    
    // Validate input before proceeding
    const validationError = validateTextTo3DInput(config);
    if (validationError) {
      toast({
        title: "Invalid Input",
        description: validationError,
        variant: "destructive",
      });
      return {
        success: false,
        error: validationError
      };
    }

    setIsGenerating(true);
    setCurrentTaskId(null);
    setProgress({
      status: 'starting',
      progress: 0,
      modelUrl: '',
      downloadStatus: 'pending'
    });

    try {
      // Ensure we have a valid session before making the request
      const accessToken = await ensureValidSession();
      
      // Create a clean request body
      const requestBody = {
        prompt: config.prompt.trim(),
        artStyle: config.artStyle || 'realistic',
        negativePrompt: config.negativePrompt || '',
        mode: config.mode || 'preview',
        ...(config.targetPolycount && { targetPolycount: config.targetPolycount }),
        ...(config.topologyType && { topologyType: config.topologyType }),
        ...(config.texture !== undefined && { texture: config.texture }),
        ...(config.seedValue !== undefined && { seedValue: config.seedValue })
      };

      console.log("📤 [TEXT-TO-3D] Sending request body:", requestBody);
      
      // Add timeout to the generation request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const { data, error } = await supabase.functions.invoke('text-to-3d', {
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error("❌ [TEXT-TO-3D] Generation error:", error);
        
        // Handle specific authentication errors
        if (error.message?.includes('authentication') || error.message?.includes('JWT')) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        } else if (error.message?.includes('Invalid user session')) {
          throw new Error('Invalid user session. Please sign out and sign in again.');
        } else if (error.message?.includes('JSON')) {
          throw new Error('Request format error. Please try again.');
        }
        
        throw new Error(error.message || 'Failed to generate 3D model');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to generate 3D model');
      }

      console.log("✅ [TEXT-TO-3D] Generation started successfully:", data);
      
      const taskId = data.taskId;
      if (!taskId) {
        throw new Error('No task ID received from generation service');
      }
      
      setCurrentTaskId(taskId);
      setProgress({
        status: 'processing',
        progress: 10,
        modelUrl: '',
        taskId: taskId,
        downloadStatus: 'pending'
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
        modelUrl: '',
        downloadStatus: 'failed'
      });
      
      let errorMessage = "Failed to generate 3D model";
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timeout. Please try again.";
        } else if (error.message.includes('authentication') || error.message.includes('JWT')) {
          errorMessage = "Authentication expired. Please refresh the page and try again.";
        } else if (error.message.includes('Invalid user session')) {
          errorMessage = "Invalid user session. Please sign out and sign in again.";
        } else {
          errorMessage = error.message;
        }
      }
      
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
      modelUrl: '',
      downloadStatus: 'pending'
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
