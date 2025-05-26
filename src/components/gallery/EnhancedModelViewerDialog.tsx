
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Minimize2, RotateCcw, Download, Info } from "lucide-react";
import ModelViewer from "@/components/model-viewer";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader,
  DialogClose 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EnhancedModelViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelUrl: string | null;
  fileName?: string;
  onClose: () => void;
}

const EnhancedModelViewerDialog: React.FC<EnhancedModelViewerDialogProps> = ({
  open,
  onOpenChange,
  modelUrl,
  fileName,
  onClose
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [stableModelUrl, setStableModelUrl] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Stable URL management to prevent reloading
  useEffect(() => {
    if (modelUrl && modelUrl !== stableModelUrl) {
      console.log('EnhancedModelViewerDialog: Setting model URL:', modelUrl);
      
      const timer = setTimeout(() => {
        setStableModelUrl(modelUrl);
      }, 50);
      
      return () => clearTimeout(timer);
    }
    
    if (!open) {
      setStableModelUrl(null);
      setIsFullscreen(false);
      setIsInfoVisible(false);
    }
  }, [modelUrl, open, stableModelUrl]);

  // Handle dialog close with cleanup
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
      setIsFullscreen(false);
      setIsInfoVisible(false);
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

  // Reset camera function (placeholder for future implementation)
  const resetCamera = () => {
    // This would reset the camera position in the 3D viewer
    console.log('Reset camera position');
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        ref={dialogRef}
        className={cn(
          "p-0 border border-white/10 overflow-hidden transition-all duration-300",
          isFullscreen 
            ? "fixed inset-0 w-screen h-screen max-w-none rounded-none z-[100]" 
            : "sm:max-w-[90vw] sm:max-h-[90vh] w-full h-full max-w-4xl bg-gray-900/95 backdrop-blur-sm rounded-xl"
        )}
        style={{
          width: isFullscreen ? '100vw' : undefined,
          height: isFullscreen ? '100vh' : undefined,
          maxWidth: isFullscreen ? '100vw' : undefined,
          maxHeight: isFullscreen ? '100vh' : undefined,
        }}
      >
        {/* Enhanced Header */}
        <DialogHeader className="relative p-4 border-b border-white/10 bg-gray-900/90 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-white truncate max-w-[60%]">
              {modelName}
            </DialogTitle>
            
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
                onClick={resetCamera}
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                title="Reset Camera"
              >
                <RotateCcw size={16} />
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
              
              <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} 
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                  title="Close"
                >
                  <X size={16} />
                </Button>
              </DialogClose>
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
        </DialogHeader>

        {/* Model Viewer Content */}
        <div className={cn(
          "relative bg-gradient-to-br from-gray-900 to-gray-800",
          isFullscreen ? "h-[calc(100vh-80px)]" : "h-[70vh] min-h-[400px]"
        )}>
          {open && stableModelUrl && (
            <ModelViewer 
              modelUrl={stableModelUrl}
              isLoading={false}
            />
          )}
          
          {/* Loading State */}
          {!stableModelUrl && open && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Loading 3D model...</p>
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
              <span className="hidden sm:inline">Click and drag to rotate</span>
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

export default EnhancedModelViewerDialog;
