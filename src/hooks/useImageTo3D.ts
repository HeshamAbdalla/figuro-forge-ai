
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ImageTo3DResult {
  success: boolean;
  taskId?: string;
  status?: string;
  error?: string;
}

export interface ImageTo3DProgress {
  status: string;
  progress: number;
  modelUrl: string;
  taskId?: string;
  thumbnailUrl?: string;
  downloadStatus?: string;
}

export interface ImageTo3DConfig {
  artStyle?: string;
  aiModel?: string;
  topology?: string;
  targetPolycount?: number;
  textureRichness?: string;
  moderation?: boolean;
  negativePrompt?: string;
}

export const useImageTo3D = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ImageTo3DProgress>({
    status: '',
    progress: 0,
    modelUrl: '',
    downloadStatus: 'pending'
  });
  const { toast } = useToast();

  // Enhanced authentication helper with better session management
  const ensureValidSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ [IMAGE-TO-3D] Session error:', error);
        throw new Error('Authentication session error. Please refresh the page and try again.');
      }
      
      if (!session?.access_token) {
        throw new Error('No valid authentication session. Please sign in again.');
      }
      
      // Check if token is expired (add 5 minute buffer)
      if (session.expires_at && (Date.now() / 1000) > (session.expires_at - 300)) {
        console.log('🔄 [IMAGE-TO-3D] Token near expiry, refreshing...');
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session?.access_token) {
          throw new Error('Failed to refresh authentication. Please sign in again.');
        }
        
        return refreshData.session.access_token;
      }
      
      return session.access_token;
    } catch (error) {
      console.error('❌ [IMAGE-TO-3D] Auth validation failed:', error);
      throw error;
    }
  };

  // Enhanced input validation
  const validateImageTo3DInput = (imageUrl: string, config?: ImageTo3DConfig): string | null => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return 'Image URL is required and must be a string';
    }
    
    if (imageUrl.trim().length === 0) {
      return 'Image URL cannot be empty';
    }
    
    // Validate blob URLs or HTTP URLs
    if (!imageUrl.startsWith('blob:') && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
      return 'Invalid image URL format';
    }
    
    const validArtStyles = ['realistic', 'cartoon', 'low-poly', 'sculpture', 'pbr'];
    if (config?.artStyle && !validArtStyles.includes(config.artStyle)) {
      return 'Invalid art style selected';
    }
    
    if (config?.targetPolycount && (typeof config.targetPolycount !== 'number' || config.targetPolycount <= 0)) {
      return 'Target polycount must be a positive number';
    }
    
    return null;
  };

  // Enhanced status checking with better error handling and timeout management
  const checkStatus = useCallback(async (taskId: string): Promise<void> => {
    try {
      console.log('🔍 [IMAGE-TO-3D] Checking status for task:', taskId);
      
      // Ensure we have a valid session before making the request
      await ensureValidSession();
      
      // Create request body for status check
      const requestBody = { taskId };
      console.log('📤 [IMAGE-TO-3D] Status check request body:', requestBody);
      
      // Add timeout to the status check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const { data, error } = await supabase.functions.invoke('check-image-to-3d-status', {
        body: requestBody
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ [IMAGE-TO-3D] Status check error:', error);
        
        // Handle specific authentication errors
        if (error.message?.includes('authentication') || error.message?.includes('JWT')) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        }
        
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Status check failed');
      }

      console.log('📊 [IMAGE-TO-3D] Status update:', data);

      // Update progress with download status
      const newProgress: ImageTo3DProgress = {
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
          console.log('📥 [IMAGE-TO-3D] Model downloaded, saving to storage...');
          setTimeout(() => checkStatus(taskId), 3000);
          return;
        }
        
        // If download completed successfully
        if (data.downloadStatus === 'completed') {
          setIsGenerating(false);
          setProgress(prev => ({ ...prev, progress: 100 }));
          
          toast({
            title: "3D Model Generated",
            description: "Your image has been converted to 3D successfully!",
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
      console.error('❌ [IMAGE-TO-3D] Status polling error:', error);
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

  // Enhanced generation function with improved request handling
  const generateModelFromImage = async (
    imageUrl: string,
    filename: string,
    config?: ImageTo3DConfig
  ): Promise<ImageTo3DResult> => {
    console.log("🔄 [IMAGE-TO-3D] Starting image to 3D generation with config:", config);
    
    // Validate input before proceeding
    const validationError = validateImageTo3DInput(imageUrl, config);
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
      await ensureValidSession();
      
      // Create a clean, validated request body
      const requestBody: {
        imageUrl?: string;
        imageBase64?: string;
        config: any;
      } = {
        config: {
          art_style: config?.artStyle || 'realistic',
          ai_model: config?.aiModel || 'meshy-5',
          topology: config?.topology || 'quad',
          target_polycount: config?.targetPolycount || 20000,
          texture_richness: config?.textureRichness || 'high',
          moderation: config?.moderation !== undefined ? config.moderation : true,
          negative_prompt: config?.negativePrompt
        }
      };

      // Handle different image URL types
      if (imageUrl.startsWith('blob:')) {
        // Convert blob to base64
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Validate blob size and type
          if (blob.size > 10 * 1024 * 1024) {
            throw new Error('Image file is too large (max 10MB)');
          }
          
          if (!blob.type.startsWith('image/')) {
            throw new Error('File must be an image');
          }
          
          const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(blob);
          });
          
          requestBody.imageBase64 = base64String;
          console.log('📤 [IMAGE-TO-3D] Using base64 image data');
        } catch (blobError) {
          throw new Error(`Failed to process image: ${blobError instanceof Error ? blobError.message : 'Unknown error'}`);
        }
      } else {
        requestBody.imageUrl = imageUrl;
        console.log('📤 [IMAGE-TO-3D] Using image URL');
      }

      console.log("📤 [IMAGE-TO-3D] Sending validated request");
      
      // Call the convert-to-3d edge function
      const { data, error } = await supabase.functions.invoke('convert-to-3d', {
        body: requestBody
      });

      console.log("📊 [IMAGE-TO-3D] Edge function response - data:", data, "error:", error);

      if (error) {
        console.error("❌ [IMAGE-TO-3D] Generation error:", error);
        
        // Handle specific authentication errors
        if (error.message?.includes('authentication') || error.message?.includes('JWT')) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        } else if (error.message?.includes('Invalid user session')) {
          throw new Error('Invalid user session. Please sign out and sign in again.');
        } else if (error.message?.includes('limit reached')) {
          throw new Error('You have reached your 3D conversion limit. Please upgrade your plan to continue.');
        }
        
        throw new Error(error.message || 'Failed to generate 3D model');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to generate 3D model');
      }

      console.log("✅ [IMAGE-TO-3D] Generation started successfully:", data);
      
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
        title: "3D Model Conversion Started",
        description: "Your image is being converted to 3D. This may take a few minutes.",
      });

      // Start polling for status
      setTimeout(() => checkStatus(taskId), 2000);

      return {
        success: true,
        taskId: taskId,
        status: data.status
      };

    } catch (error) {
      console.error("❌ [IMAGE-TO-3D] Error in image to 3D generation:", error);
      
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
        } else if (error.message.includes('limit reached')) {
          errorMessage = "You have reached your conversion limit. Please upgrade your plan to continue.";
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
    generateModelFromImage,
    resetProgress,
    setCurrentTaskId
  };
};
