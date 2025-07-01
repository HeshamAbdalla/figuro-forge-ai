import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Eye, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import ModelViewer from "@/components/model-viewer";

interface OnDemand3DPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelUrl: string | null;
  modelName: string | null;
  onDownload?: () => void;
  onViewFull?: () => void;
}

const OnDemand3DPreviewModal: React.FC<OnDemand3DPreviewModalProps> = ({
  open,
  onOpenChange,
  modelUrl,
  modelName,
  onDownload,
  onViewFull
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset error state when modal opens with new model
  useEffect(() => {
    if (open && modelUrl) {
      setHasError(false);
      setErrorMessage("");
    }
  }, [open, modelUrl]);

  // Handle fullscreen toggle
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

  const handleClose = () => {
    onOpenChange(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  if (!modelUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`p-0 bg-gray-900/95 border border-white/10 overflow-hidden ${
          isFullscreen 
            ? "fixed inset-0 w-screen h-screen max-w-none rounded-none z-[100]" 
            : "sm:max-w-[95vw] sm:max-h-[95vh] w-full h-full max-w-6xl rounded-xl"
        }`}
      >
        <DialogHeader className="p-4 border-b border-white/10 bg-gray-900/90 backdrop-blur-sm">
          <DialogTitle className="flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-3 h-3 bg-figuro-accent rounded-full animate-pulse"></div>
              <span className="text-white text-lg font-semibold">
                3D Preview: {modelName || 'Model'}
              </span>
            </motion.div>
            
            <motion.div 
              className="flex gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {onDownload && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onDownload} 
                  className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  title="Download Model"
                >
                  <Download size={16} />
                </Button>
              )}
              
              {onViewFull && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onViewFull} 
                  className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  title="View Full Details"
                >
                  <Eye size={16} />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </Button>
              
              <DialogClose asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose} 
                  className="h-9 w-9 text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200"
                  title="Close"
                >
                  <X size={16} />
                </Button>
              </DialogClose>
            </motion.div>
          </DialogTitle>
        </DialogHeader>
        
        <div 
          className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${
            isFullscreen ? "h-[calc(100vh-80px)]" : "h-[80vh] min-h-[600px]"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <ModelViewer
              modelUrl={modelUrl}
              isLoading={false}
              variant="gallery"
              showControls={true}
              autoRotate={true}
              className="w-full h-full [&_.glass-panel]:bg-transparent [&_.glass-panel]:border-0 [&_h3]:hidden [&_.border-b]:hidden [&_.absolute.bottom-4.right-4]:hidden"
            />
          </motion.div>
        </div>
        
        <div className="p-4 border-t border-white/10 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Interactive 3D Preview</span>
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

export default OnDemand3DPreviewModal;
