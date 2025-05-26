
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { handleObjectUrl } from "./utils/modelUtils";

export const useModelViewerState = (
  modelUrl: string | null,
  onCustomModelLoad?: (url: string, file: File) => void
) => {
  const [modelError, setModelError] = useState<string | null>(null);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const [customModelBlob, setCustomModelBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customObjectUrlRef = useRef<string | null>(null);
  const originalUrlRef = useRef<string | null>(modelUrl);
  const { toast } = useToast();

  // Determine which URL to use for the 3D model - custom uploaded model takes priority
  const displayModelUrl = customModelUrl || modelUrl;

  // Determine if we should show an error message
  const shouldShowError = (modelError) && 
    ((!modelUrl && !customModelUrl) || modelError);

  // Reset error state when modelUrl changes
  useState(() => {
    if (modelUrl) {
      setModelError(null);
      originalUrlRef.current = modelUrl;
      // Reset custom model when a new model is provided
      if (customObjectUrlRef.current) {
        handleObjectUrl(null, customObjectUrlRef.current);
        customObjectUrlRef.current = null;
      }
      setCustomModelUrl(null);
      setCustomFile(null);
      setCustomModelBlob(null);
    }
  });

  const triggerFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is a GLB format
    if (!file.name.toLowerCase().endsWith('.glb')) {
      toast({
        title: "Invalid file format",
        description: "Please select a GLB file",
        variant: "destructive",
      });
      return;
    }

    console.log("Selected file:", file.name, "size:", file.size);
    setCustomFile(file);
    
    // Create blob URL for the file using proper URL management
    const objectUrl = handleObjectUrl(file, customObjectUrlRef.current);
    customObjectUrlRef.current = objectUrl;
    console.log("Created blob URL:", objectUrl);
    setCustomModelUrl(objectUrl);
    setCustomModelBlob(file);
    setModelError(null);
    
    toast({
      title: "Custom model loaded",
      description: `${file.name} has been loaded successfully`,
    });
    
    // Call the callback if provided
    if (onCustomModelLoad && objectUrl) {
      onCustomModelLoad(objectUrl, file);
    }
  }, [toast, onCustomModelLoad]);

  const handleDownload = useCallback(() => {
    const downloadUrl = customModelUrl || originalUrlRef.current;
    if (!downloadUrl) return;
    
    try {
      // If custom file exists, download it directly
      if (customFile) {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = customFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // For generated models, use the original URL for downloads
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `figurine-model-${new Date().getTime()}.glb`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      toast({
        title: "Download started",
        description: "Your 3D model download has started."
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the model. Try again or check console for details.",
        variant: "destructive"
      });
    }
  }, [customModelUrl, customFile, toast]);

  const handleModelError = useCallback((error: any) => {
    console.error("Error loading 3D model:", error);
    
    let errorMsg = "Failed to load 3D model. The download may still work.";
    
    // Check for specific CORS or network errors
    if (error.message) {
      if (error.message.includes("Failed to fetch")) {
        errorMsg = "Network error loading 3D model. The model URL might be restricted by CORS policy. Try the download button instead.";
      } else if (error.message.includes("Cross-Origin")) {
        errorMsg = "CORS policy prevented loading the 3D model. Try the download button instead.";
      }
    }
    
    setModelError(errorMsg);
  }, []);

  return {
    modelError,
    customFile,
    fileInputRef,
    displayModelUrl,
    customModelBlob,
    shouldShowError,
    handleFileChange,
    triggerFileInputClick,
    handleDownload,
    handleModelError
  };
};
