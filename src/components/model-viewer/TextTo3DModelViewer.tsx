
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Maximize, 
  Eye,
  EyeOff,
  Share,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTextTo3DModelLoader } from "@/hooks/useTextTo3DModelLoader";
import ModelScene from "./ModelScene";
import LoadingView from "./LoadingView";
import ErrorView from "./ErrorView";
import type { TextTo3DModelInfo } from "@/utils/textTo3DModelUtils";
import type { ModelViewerBaseProps } from "./types";

interface TextTo3DModelViewerProps extends ModelViewerBaseProps {
  modelInfo: TextTo3DModelInfo | null;
}

const TextTo3DModelViewer: React.FC<TextTo3DModelViewerProps> = ({
  modelInfo,
  isLoading: externalLoading,
  progress: externalProgress = 0,
  errorMessage: externalError = null,
  onCustomModelLoad,
  variant = "standard",
  showControls = true,
  autoRotate: initialAutoRotate = true,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [showWireframe, setShowWireframe] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  console.log('🎯 [TEXT-TO-3D-MODEL-VIEWER] Rendering with modelInfo:', modelInfo);

  // Use the specialized text-to-3D model loader
  const {
    loading: modelLoading,
    model,
    error: modelError,
    loadModel,
    clearModel,
    progress: modelProgress
  } = useTextTo3DModelLoader({
    modelInfo,
    autoLoad: true,
    onError: (error) => {
      console.error('❌ [TEXT-TO-3D-MODEL-VIEWER] Model loading error:', error);
      toast({
        title: "Model Loading Failed",
        description: error?.message || "Failed to load 3D model",
        variant: "destructive"
      });
    }
  });

  // Determine final loading state and progress
  const isLoading = externalLoading || modelLoading;
  const progress = Math.max(externalProgress, modelProgress);
  const errorMessage = externalError || modelError;

  // Initialize autoRotate from props
  useEffect(() => {
    setAutoRotate(initialAutoRotate);
  }, [initialAutoRotate]);

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

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.glb')) {
      toast({
        title: "Invalid file format",
        description: "Please select a GLB file",
        variant: "destructive",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    
    if (onCustomModelLoad) {
      onCustomModelLoad(objectUrl, file);
    }
    
    toast({
      title: "Custom model loaded",
      description: `${file.name} has been loaded successfully`,
    });
  };

  // Handle download
  const handleDownload = () => {
    const downloadUrl = modelInfo?.localModelUrl || modelInfo?.modelUrl;
    if (!downloadUrl) return;
    
    const fileName = `text-to-3d-model-${modelInfo?.taskId?.substring(0, 8) || 'unknown'}.glb`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your 3D model download has started."
    });
  };

  // Handle sharing
  const handleShare = async () => {
    const shareUrl = modelInfo?.localModelUrl || modelInfo?.modelUrl;
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
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
  if (!modelInfo && !isLoading) {
    return null;
  }

  const isCompact = variant === "compact" || variant === "gallery";
  const heightClass = isCompact ? "h-[300px]" : "h-[500px]";
  const hasModel = !!model;
  const hasError = !!errorMessage && !isLoading;

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
                  Text-to-3D Model
                </h3>
                <Badge className="bg-figuro-accent/20 text-figuro-accent border-figuro-accent/30">
                  AI Generated
                </Badge>
                {modelInfo?.taskId && (
                  <Badge variant="outline" className="text-xs">
                    {modelInfo.taskId.substring(0, 8)}...
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {hasModel && (
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
                  </>
                )}
                
                <Separator orientation="vertical" className="h-6 bg-white/20" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
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
        ) : hasError ? (
          <ErrorView 
            errorMessage={errorMessage} 
            displayModelUrl={modelInfo?.modelUrl || null}
          />
        ) : hasModel ? (
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-5, -5, -5]} intensity={0.4} />
            
            <primitive 
              object={model} 
              scale={[1.5, 1.5, 1.5]}
            />
            
            <OrbitControls 
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              enablePan={false}
              maxDistance={10}
              minDistance={2}
            />
            
            <Environment preset="studio" />
          </Canvas>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/70">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No model available</p>
            </div>
          </div>
        )}

        {/* Download Button */}
        {hasModel && !isLoading && (modelInfo?.modelUrl || modelInfo?.localModelUrl) && (
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
        onChange={handleFileUpload}
        accept=".glb"
        className="hidden"
      />
    </motion.div>
  );
};

export default TextTo3DModelViewer;
