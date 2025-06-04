
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  Environment,
  Html
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Maximize, 
  Eye,
  Share,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ModelScene from "./ModelScene";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";
import { useModelViewerState } from "./useModelViewerState";
import type { ModelViewerBaseProps } from "./types";

interface StandardModelViewerProps extends ModelViewerBaseProps {
  modelUrl: string | null;
}

const StandardModelViewer: React.FC<StandardModelViewerProps> = ({
  modelUrl,
  isLoading,
  progress = 0,
  errorMessage = null,
  onCustomModelLoad,
  variant = "standard",
  showControls = true,
  autoRotate: initialAutoRotate = true,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const orbitControlsRef = useRef<any>(null);
  const { toast } = useToast();

  const {
    autoRotate,
    setAutoRotate,
    modelError,
    customFile,
    fileInputRef,
    displayModelUrl,
    shouldShowError,
    handleFileChange,
    triggerFileInputClick,
    handleDownload,
    handleModelError
  } = useModelViewerState(modelUrl, onCustomModelLoad);

  // Initialize autoRotate from props
  useEffect(() => {
    setAutoRotate(initialAutoRotate);
  }, [initialAutoRotate, setAutoRotate]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle camera reset
  const resetCamera = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
      toast({
        title: "Camera Reset",
        description: "View has been reset to default position"
      });
    }
  };

  // Handle sharing
  const handleShare = async () => {
    if (!displayModelUrl) return;
    
    try {
      await navigator.clipboard.writeText(displayModelUrl);
      toast({
        title: "Link Copied",
        description: "Model URL copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  // Skip rendering if there's nothing to display
  if (!modelUrl && !customFile && !isLoading) {
    return null;
  }

  const isCompact = variant === "compact" || variant === "gallery";
  const heightClass = isCompact ? "h-[300px]" : "h-[500px]";

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-glow",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Enhanced Header */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gradient">
                  3D Model Preview
                </h3>
                {customFile && (
                  <Badge className="bg-figuro-accent/20 text-figuro-accent border-figuro-accent/30">
                    Custom Upload
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {displayModelUrl && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAutoRotate(!autoRotate)}
                      className="hover:bg-white/10"
                    >
                      <RotateCcw className={cn(
                        "w-4 h-4",
                        autoRotate && "animate-spin"
                      )} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWireframe(!showWireframe)}
                      className="hover:bg-white/10"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="hover:bg-white/10"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetCamera}
                      className="hover:bg-white/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </>
                )}
                
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={triggerFileInputClick}
                  className="hover:bg-white/10"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="hover:bg-white/10"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Display Area */}
      <div className={cn("relative bg-gradient-to-br from-gray-900 to-gray-800", heightClass)}>
        {isLoading ? (
          <LoadingView progress={progress} />
        ) : shouldShowError ? (
          <ErrorView 
            errorMessage={errorMessage || modelError} 
            displayModelUrl={displayModelUrl}
          />
        ) : displayModelUrl ? (
          <ModelScene 
            modelUrl={displayModelUrl}
            autoRotate={autoRotate}
            onModelError={handleModelError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/70">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No model available</p>
            </div>
          </div>
        )}

        {/* Download Button */}
        {displayModelUrl && !isLoading && !shouldShowError && (
          <div className="absolute bottom-4 right-4">
            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-figuro-accent hover:bg-figuro-accent/80 text-white shadow-lg"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".glb"
        className="hidden"
      />
    </motion.div>
  );
};

export default StandardModelViewer;
