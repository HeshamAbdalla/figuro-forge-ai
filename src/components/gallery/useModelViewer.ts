
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { modelQueueManager } from "../model-viewer/utils/modelQueueManager";
import { webGLContextTracker } from "../model-viewer/utils/resourceManager";

// Maximum number of model viewers that can be open at once - reduced for stability
const MAX_ACTIVE_VIEWERS = 1;

export const useModelViewer = () => {
  const [viewingModel, setViewingModel] = useState<string | null>(null);
  const [viewingFileName, setViewingFileName] = useState<string | undefined>(undefined);
  const [modelViewerOpen, setModelViewerOpen] = useState(false);
  const { toast } = useToast();
  
  // Keep track of active model viewers to limit resource usage
  const activeViewersRef = useRef<number>(0);

  // Configure the queue manager when component mounts
  useEffect(() => {
    // Set concurrent loading limit to 2 for timeline optimizations
    modelQueueManager.setMaxConcurrent(2);
    
    return () => {
      // Reset active viewers count when component unmounts
      if (activeViewersRef.current > 0) {
        console.log("Cleaning up model viewer resources on unmount");
        activeViewersRef.current = 0;
        
        // Reset queue manager to clean up resources
        modelQueueManager.reset();
        webGLContextTracker.reset();
      }
    };
  }, []);

  // Handle closing model viewer and cleaning up resources
  const onCloseModelViewer = () => {
    setModelViewerOpen(false);
    setViewingModel(null); // Clear the model URL to prevent reloading
    setViewingFileName(undefined);
    
    activeViewersRef.current = Math.max(0, activeViewersRef.current - 1);
    webGLContextTracker.releaseContext();
    
    // Force garbage collection and cleanup
    setTimeout(() => {
      console.log("Model viewer resources released");
      // Force a small UI refresh to clear any stale resources
      setViewingModel(null);
      setViewingFileName(undefined);
    }, 800);
  };

  // Clean URLs from cache-busting parameters
  const cleanModelUrl = (url: string): string => {
    try {
      const parsedUrl = new URL(url);
      // Remove cache-busting parameters
      ['t', 'cb', 'cache'].forEach(param => {
        if (parsedUrl.searchParams.has(param)) {
          parsedUrl.searchParams.delete(param);
        }
      });
      return parsedUrl.toString();
    } catch (e) {
      // If URL parsing fails, return the original
      console.warn("Failed to parse model URL:", e);
      return url;
    }
  };

  // Handle opening enhanced model viewer with file name support
  const onViewModel = (modelUrl: string, fileName?: string) => {
    // First make sure the URL is valid
    if (!modelUrl || typeof modelUrl !== 'string') {
      toast({
        title: "Invalid model",
        description: "The model URL is invalid or missing.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if we're already at the maximum number of active viewers
    if (activeViewersRef.current >= MAX_ACTIVE_VIEWERS) {
      toast({
        title: "Viewer already open",
        description: "Please close the current model viewer before opening another one.",
        variant: "default",
      });
      return;
    }
    
    // Check if we're nearing WebGL context limits
    if (webGLContextTracker.isNearingLimit()) {
      toast({
        title: "Resource limit warning",
        description: "Browser is nearing WebGL context limit. Performance may be affected.",
        variant: "default",
      });
    }
    
    // Clean the URL to prevent reloading and resource issues
    const cleanedUrl = cleanModelUrl(modelUrl);
    console.log("Opening enhanced model viewer with URL:", cleanedUrl, "fileName:", fileName);
    
    // First close any existing viewer to clean up resources
    if (modelViewerOpen) {
      onCloseModelViewer();
      
      // Increased timeout to ensure cleanup before opening new model
      setTimeout(() => {
        setViewingModel(cleanedUrl);
        setViewingFileName(fileName);
        setModelViewerOpen(true);
        activeViewersRef.current += 1;
        webGLContextTracker.registerContext();
      }, 800);
    } else {
      setViewingModel(cleanedUrl);
      setViewingFileName(fileName);
      setModelViewerOpen(true);
      activeViewersRef.current += 1;
      webGLContextTracker.registerContext();
    }
  };
  
  return {
    viewingModel,
    viewingFileName,
    modelViewerOpen,
    setModelViewerOpen,
    onViewModel,
    onCloseModelViewer
  };
};
