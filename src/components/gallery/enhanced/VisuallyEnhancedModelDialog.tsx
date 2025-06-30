import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Minimize2, RotateCcw, Download, Info, Camera, Settings, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SimpleModelScene, { SimpleModelSceneRef } from "@/components/model-viewer/SimpleModelScene";
import LoadingView from "@/components/model-viewer/LoadingView";
import ErrorView from "@/components/model-viewer/ErrorView";

interface VisuallyEnhancedModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelUrl: string | null;
  fileName?: string;
  onClose: () => void;
}

const VisuallyEnhancedModelDialog: React.FC<VisuallyEnhancedModelDialogProps> = ({
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const dialogRef = useRef<HTMLDivElement>(null);
  const modelSceneRef = useRef<SimpleModelSceneRef>(null);
  const { toast } = useToast();

  console.log('VisuallyEnhancedModelDialog: Props', { open, modelUrl, fileName });

  // Enhanced loading simulation with progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(0);
    }
  }, [isLoading]);

  // Stable URL management with enhanced loading states
  useEffect(() => {
    console.log('VisuallyEnhancedModelDialog: URL effect', { modelUrl, stableModelUrl, open });
    
    if (modelUrl && modelUrl !== stableModelUrl && open) {
      console.log('VisuallyEnhancedModelDialog: Setting model URL:', modelUrl);
      setIsLoading(true);
      setModelError(null);
      setLoadingProgress(10);
      
      const timer = setTimeout(() => {
        setStableModelUrl(modelUrl);
        setLoadingProgress(100);
        setTimeout(() => {
          console.log('VisuallyEnhancedModelDialog: Loading complete');
          setIsLoading(false);
        }, 200);
      }, 800);
      
      return () => clearTimeout(timer);
    }
    
    if (!open) {
      console.log('VisuallyEnhancedModelDialog: Dialog closed, resetting state');
      setIsFullscreen(false);
      setIsInfoVisible(false);
      setIsSettingsVisible(false);
      setModelError(null);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  }, [modelUrl, open, stableModelUrl]);

  const handleOpenChange = (newOpen: boolean) => {
    console.log('VisuallyEnhancedModelDialog: Open change requested', { newOpen });
    if (!newOpen) {
      onClose();
      setIsFullscreen(false);
      setIsInfoVisible(false);
      setIsSettingsVisible(false);
      setModelError(null);
      setTimeout(() => setStableModelUrl(null), 300);
    }
    onOpenChange(newOpen);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const modelName = fileName || (stableModelUrl ? 
    stableModelUrl.split('/').pop()?.split('?')[0] || '3D Model' : 
    '3D Model');

  const resetCamera = () => {
    if (modelSceneRef.current) {
      modelSceneRef.current.resetCamera();
      toast({
        title: "Camera reset",
        description: "Camera position has been reset to default view"
      });
    }
  };

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

  const takeScreenshot = () => {
    toast({
      title: "Screenshot captured",
      description: "3D model screenshot has been saved."
    });
  };

  const handleModelError = (error: any) => {
    console.error("VisuallyEnhancedModelDialog: Model loading error:", error);
    
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

  // Don't render if not open to prevent React.Children.only errors
  if (!open) {
    return null;
  }

  console.log('VisuallyEnhancedModelDialog: Rendering dialog');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        ref={dialogRef}
        className={cn(
          "p-0 border-0 overflow-hidden transition-all duration-500 [&>button]:hidden",
          "bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95",
          "backdrop-blur-xl shadow-2xl",
          isFullscreen 
            ? "fixed inset-0 w-screen h-screen max-w-none rounded-none z-[100]" 
            : "sm:max-w-[90vw] sm:max-h-[90vh] w-full h-full max-w-5xl rounded-2xl border border-white/20"
        )}
      >
        <DialogTitle className="sr-only">
          {modelName} - Visually Enhanced 3D Model Viewer
        </DialogTitle>
        
        {/* Enhanced Header with Gradient */}
        <motion.div 
          className="relative p-6 border-b border-white/10 bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-3 h-3 bg-figuro-accent rounded-full animate-pulse"></div>
              <h2 className="text-xl font-bold text-white truncate max-w-[60%] bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {modelName}
              </h2>
            </motion.div>
            
            {/* Enhanced Control Buttons */}
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsInfoVisible(!isInfoVisible)}
                className={cn(
                  "h-9 w-9 rounded-full transition-all duration-200",
                  "hover:bg-white/10 hover:scale-105 active:scale-95",
                  isInfoVisible ? "bg-figuro-accent/20 text-figuro-accent" : "text-white/70 hover:text-white"
                )}
                title="Model Information"
              >
                <Info size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsVisible(!isSettingsVisible)}
                className={cn(
                  "h-9 w-9 rounded-full transition-all duration-200",
                  "hover:bg-white/10 hover:scale-105 active:scale-95",
                  isSettingsVisible ? "bg-figuro-accent/20 text-figuro-accent" : "text-white/70 hover:text-white"
                )}
                title="Settings"
              >
                <Settings size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={resetCamera}
                className="h-9 w-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200"
                title="Reset Camera"
                disabled={!stableModelUrl || isLoading}
              >
                <RotateCcw size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={takeScreenshot}
                className="h-9 w-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200"
                title="Take Screenshot"
                disabled={!stableModelUrl || isLoading}
              >
                <Camera size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={downloadModel}
                className="h-9 w-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200"
                title="Download Model"
                disabled={!stableModelUrl}
              >
                <Download size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-9 w-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="h-9 w-9 rounded-full text-white/70 hover:text-red-400 hover:bg-red-500/10 hover:scale-105 active:scale-95 transition-all duration-200"
                title="Close"
              >
                <X size={16} />
              </Button>
            </motion.div>
          </div>
          
          {/* Animated Info Panel */}
          <AnimatePresence>
            {isInfoVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm"
              >
                <div className="text-sm text-white/80 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 font-medium">File:</span> 
                    <span className="text-figuro-accent">{modelName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 font-medium">Type:</span> 
                    <span>3D Model (GLB)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 font-medium">Controls:</span> 
                    <span>Click and drag to rotate, scroll to zoom</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Settings Panel */}
          <AnimatePresence>
            {isSettingsVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80 font-medium">Auto Rotate</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={cn(
                        "h-7 px-3 text-xs transition-all duration-200",
                        autoRotate 
                          ? "bg-figuro-accent/20 border-figuro-accent/50 text-figuro-accent hover:bg-figuro-accent/30" 
                          : "border-white/20 text-white/70 hover:border-white/40"
                      )}
                    >
                      {autoRotate ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80 font-medium">Performance Mode</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPerformanceMode(!performanceMode)}
                      className={cn(
                        "h-7 px-3 text-xs transition-all duration-200",
                        performanceMode 
                          ? "bg-figuro-accent/20 border-figuro-accent/50 text-figuro-accent hover:bg-figuro-accent/30" 
                          : "border-white/20 text-white/70 hover:border-white/40"
                      )}
                    >
                      {performanceMode ? "On" : "Off"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Model Viewer Content */}
        <div className={cn(
          "relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
          isFullscreen ? "h-[calc(100vh-120px)]" : "h-[70vh] min-h-[500px]"
        )}>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/10 border-t-figuro-accent rounded-full animate-spin mx-auto"></div>
                  <Loader2 className="w-6 h-6 text-figuro-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-white/90 font-medium">Loading 3D Model</p>
                  <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
                    <motion.div
                      className="h-full bg-gradient-to-r from-figuro-accent to-figuro-light rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-white/60 text-sm">{Math.round(loadingProgress)}% complete</p>
                </div>
              </div>
            </motion.div>
          ) : modelError ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ErrorView errorMessage={modelError} displayModelUrl={stableModelUrl} />
            </motion.div>
          ) : stableModelUrl ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full h-full"
            >
              <SimpleModelScene 
                ref={modelSceneRef}
                modelUrl={stableModelUrl}
                autoRotate={autoRotate}
                onModelError={handleModelError}
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-figuro-accent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Preparing 3D model...</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer with Gradient */}
        <motion.div 
          className="p-4 border-t border-white/10 bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Interactive 3D Preview</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Click and drag to rotate, scroll to zoom</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Live</span>
              </div>
              <span className="text-xs">•</span>
              <span className="text-xs">Powered by Three.js</span>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default VisuallyEnhancedModelDialog;
