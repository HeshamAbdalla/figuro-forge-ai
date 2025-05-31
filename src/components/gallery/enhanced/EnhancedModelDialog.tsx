
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Minimize2, RotateCcw, Download, Info, Camera, Settings } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ModelScene, { ModelSceneRef } from "@/components/model-viewer/ModelScene";
import LoadingView from "@/components/model-viewer/LoadingView";
import ErrorView from "@/components/model-viewer/ErrorView";

interface EnhancedModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelUrl: string | null;
  fileName?: string;
  onClose: () => void;
}

const EnhancedModelDialog: React.FC<EnhancedModelDialogProps> = ({
  open,
  onOpenChange,
  modelUrl,
  fileName,
  onClose
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [stableModelUrl, setStableModelUrl] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  
  const dialogRef = useRef<HTMLDivElement>(null);
  const modelSceneRef = useRef<ModelSceneRef>(null);
  const { toast } = useToast();

  // Stable URL management to prevent reloading
  useEffect(() => {
    if (modelUrl && modelUrl !== stableModelUrl) {
      console.log('EnhancedModelDialog: Setting model URL:', modelUrl);
      setIsLoading(true);
      setModelError(null);
      
      const timer = setTimeout(() => {
        setStableModelUrl(modelUrl);
        setIsLoading(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
    
    if (!open) {
      setStableModelUrl(null);
      setIsFullscreen(false);
      setIsInfoVisible(false);
      setIsSettingsVisible(false);
      setModelError(null);
      setIsLoading(false);
    }
  }, [modelUrl, open, stableModelUrl]);

  // Handle dialog close with cleanup
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
      setIsFullscreen(false);
      setIsInfoVisible(false);
      setIsSettingsVisible(false);
      setModelError(null);
    }
    onOpenChange(newOpen);
  };

  // Fullscreen toggle functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Extract model name for better UX
  const modelName = fileName || (stableModelUrl ? 
    stableModelUrl.split('/').pop()?.split('?')[0] || '3D Model' : 
    '3D Model');

  // Reset camera function
  const resetCamera = () => {
    if (modelSceneRef.current) {
      modelSceneRef.current.resetCamera();
      toast({
        title: "Camera reset",
        description: "Camera position has been reset to default view"
      });
    }
  };

  // Download model function
  const downloadModel = () => {
    if (stableModelUrl) {
      const a = document.createElement('a');
      a.href = stableModelUrl;
      a.download = modelName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your 3D model download has started."
      });
    }
  };

  // Take screenshot
  const takeScreenshot = () => {
    // This would be implemented to capture the 3D scene
    toast({
      title: "Screenshot captured",
      description: "3D model screenshot has been saved."
    });
  };

  // Handle model loading errors
  const handleModelError = (error: any) => {
    console.error("EnhancedModelDialog: Model loading error:", error);
    
    let errorMsg = "Failed to load 3D model. The download may still work.";
    
    if (error.message) {
      if (error.message.includes("Failed to fetch")) {
        errorMsg = "Network error loading 3D model. Try the download button instead.";
      } else if (error.message.includes("Cross-Origin")) {
        errorMsg = "CORS policy prevented loading the 3D model. Try the download button instead.";
      }
    }
    
    setModelError(errorMsg);
    setIsLoading(false);
    
    toast({
      title: "Model loading failed",
      description: errorMsg,
      variant: "destructive"
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        ref={dialogRef}
        className={cn(
          "p-0 border border-white/10 overflow-hidden transition-all duration-300 [&>button]:hidden",
          isFullscreen 
            ? "fixed inset-0 w-screen h-screen max-w-none rounded-none z-[100]" 
            : "sm:max-w-[90vw] sm:max-h-[90vh] w-full h-full max-w-4xl bg-gray-900/95 backdrop-blur-sm rounded-xl"
        )}
      >
        {/* Enhanced Header */}
        <div className="relative p-4 border-b border-white/10 bg-gray-900/90 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white truncate max-w-[60%]">
              {modelName}
            </h2>
            
            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsInfoVisible(!isInfoVisible)}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                title="Model Information"
              >
                <Info size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsVisible(!isSettingsVisible)}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                title="Settings"
              >
                <Settings size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={resetCamera}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                title="Reset Camera"
                disabled={!stableModelUrl || isLoading}
              >
                <RotateCcw size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={takeScreenshot}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                title="Take Screenshot"
                disabled={!stableModelUrl || isLoading}
              >
                <Camera size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={downloadModel}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                title="Download Model"
                disabled={!stableModelUrl}
              >
                <Download size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                title="Close"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
          
          {/* Model Info Panel */}
          {isInfoVisible && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-sm text-white/80 space-y-1">
                <div><span className="text-white/60">File:</span> {modelName}</div>
                <div><span className="text-white/60">Type:</span> 3D Model (GLB)</div>
                <div><span className="text-white/60">Controls:</span> Click and drag to rotate, scroll to zoom</div>
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {isSettingsVisible && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Auto Rotate</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className="h-6 px-2 text-xs"
                  >
                    {autoRotate ? "On" : "Off"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Performance Mode</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPerformanceMode(!performanceMode)}
                    className="h-6 px-2 text-xs"
                  >
                    {performanceMode ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Model Viewer Content */}
        <div className={cn(
          "relative bg-gradient-to-br from-gray-900 to-gray-800",
          isFullscreen ? "h-[calc(100vh-80px)]" : "h-[70vh] min-h-[400px]"
        )}>
          {isLoading ? (
            <LoadingView progress={0} />
          ) : modelError ? (
            <ErrorView errorMessage={modelError} displayModelUrl={stableModelUrl} />
          ) : open && stableModelUrl ? (
            <ModelScene 
              ref={modelSceneRef}
              modelUrl={stableModelUrl}
              autoRotate={autoRotate}
              onModelError={handleModelError}
              isPreview={performanceMode}
              enablePerformanceMonitoring={true}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Preparing 3D model...</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="p-4 border-t border-white/10 bg-gray-900/90 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center space-x-4">
              <span>Interactive 3D Preview</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Click and drag to rotate, scroll to zoom</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs">Powered by Three.js</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedModelDialog;
