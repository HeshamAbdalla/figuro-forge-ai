
import { useState, useCallback, useRef, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ModelInfo, ModelLoadingState, isTextTo3DModelInfo } from './types/ModelViewerTypes';

interface UseEnhancedModelViewerStateProps {
  modelInfo: ModelInfo | null;
  onCustomModelLoad?: (url: string, file: File) => void;
  onModelError?: (error: any) => void;
}

export const useEnhancedModelViewerState = ({
  modelInfo,
  onCustomModelLoad,
  onModelError
}: UseEnhancedModelViewerStateProps) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showEnvironment, setShowEnvironment] = useState(true);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customModelBlob, setCustomModelBlob] = useState<Blob | null>(null);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customObjectUrlRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Determine display model URL based on model info type
  const displayModelUrl = useMemo(() => {
    if (customModelUrl) return customModelUrl;
    return modelInfo?.modelUrl || null;
  }, [customModelUrl, modelInfo?.modelUrl]);

  // Handle file upload
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      toast({
        title: "Invalid file format",
        description: "Please select a GLB or GLTF file",
        variant: "destructive",
      });
      return;
    }

    console.log("Selected file:", file.name, "size:", file.size);
    setCustomFile(file);
    setCustomModelBlob(file);
    
    // Clean up previous URL
    if (customObjectUrlRef.current) {
      URL.revokeObjectURL(customObjectUrlRef.current);
    }
    
    // Create new URL
    const objectUrl = URL.createObjectURL(file);
    customObjectUrlRef.current = objectUrl;
    setCustomModelUrl(objectUrl);
    setModelError(null);
    
    toast({
      title: "Custom model loaded",
      description: `${file.name} has been loaded successfully`,
    });
    
    if (onCustomModelLoad) {
      onCustomModelLoad(objectUrl, file);
    }
  }, [toast, onCustomModelLoad]);

  const triggerFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Enhanced download handler
  const handleDownload = useCallback(() => {
    const downloadUrl = customModelUrl || displayModelUrl;
    if (!downloadUrl) return;
    
    try {
      let fileName = 'model.glb';
      
      if (customFile) {
        fileName = customFile.name;
      } else if (isTextTo3DModelInfo(modelInfo)) {
        fileName = `text-to-3d-${modelInfo.taskId}.glb`;
      } else if (modelInfo) {
        fileName = `model-${Date.now()}.glb`;
      }
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your 3D model download has started."
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the model. Please try again.",
        variant: "destructive"
      });
    }
  }, [customModelUrl, displayModelUrl, customFile, modelInfo, toast]);

  const handleModelError = useCallback((error: any) => {
    console.error("Model loading error:", error);
    
    let errorMsg = "Failed to load 3D model.";
    
    if (error?.message) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network error")) {
        errorMsg = "Network error loading 3D model. The model URL might be restricted by CORS policy.";
      } else if (error.message.includes("Cross-Origin") || error.message.includes("CORS")) {
        errorMsg = "CORS policy prevented loading the 3D model.";
      } else if (error.message.includes("expired")) {
        errorMsg = "Model URL has expired. Please regenerate the model.";
      } else if (error.message.includes("not found") || error.message.includes("404")) {
        errorMsg = "Model file not found. Please check if the model exists.";
      }
    }
    
    setModelError(errorMsg);
    
    if (onModelError) {
      onModelError(error);
    }
  }, [onModelError]);

  // Enhanced sharing for text-to-3D models
  const handleShare = useCallback(async () => {
    if (!displayModelUrl) return;
    
    try {
      let shareData: any = {
        url: displayModelUrl
      };
      
      if (isTextTo3DModelInfo(modelInfo)) {
        shareData.title = `AI Generated 3D Model: ${modelInfo.prompt || 'Generated Model'}`;
        shareData.text = `Check out this AI-generated 3D model: "${modelInfo.prompt}"`;
      } else {
        shareData.title = "3D Model";
        shareData.text = "Check out this 3D model";
      }
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(displayModelUrl);
        toast({
          title: "Link Copied",
          description: "Model URL copied to clipboard"
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not share model",
        variant: "destructive"
      });
    }
  }, [displayModelUrl, modelInfo, toast]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (customObjectUrlRef.current) {
      URL.revokeObjectURL(customObjectUrlRef.current);
      customObjectUrlRef.current = null;
    }
  }, []);

  return {
    // State
    autoRotate,
    setAutoRotate,
    showWireframe,
    setShowWireframe,
    showEnvironment,
    setShowEnvironment,
    customFile,
    customModelBlob,
    customModelUrl,
    modelError,
    displayModelUrl,
    
    // Refs
    fileInputRef,
    
    // Actions
    handleFileChange,
    triggerFileInputClick,
    handleDownload,
    handleModelError,
    handleShare,
    cleanup,
    
    // Computed
    shouldShowError: !!modelError,
    hasCustomModel: !!customFile,
    modelTypeInfo: modelInfo ? {
      type: modelInfo.type,
      isTextTo3D: isTextTo3DModelInfo(modelInfo),
      taskId: isTextTo3DModelInfo(modelInfo) ? modelInfo.taskId : undefined,
      prompt: isTextTo3DModelInfo(modelInfo) ? modelInfo.prompt : undefined
    } : null
  };
};
