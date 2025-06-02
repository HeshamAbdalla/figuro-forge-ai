
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  ContactShadows,
  Html,
  useProgress
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
  Minimize,
  Eye,
  EyeOff,
  Share,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import EnhancedModelScene from "./EnhancedModelScene";
import { useModelViewerState } from "./useModelViewerState";

interface EnhancedModelViewerProps {
  modelUrl: string | null;
  isLoading: boolean;
  progress?: number;
  errorMessage?: string | null;
  onCustomModelLoad?: (url: string, file: File) => void;
  variant?: "standard" | "compact" | "gallery";
  showControls?: boolean;
  autoRotate?: boolean;
  className?: string;
}

// Enhanced loading component with glass morphism
const EnhancedLoadingView = ({ progress = 0 }: { progress: number }) => {
  const { progress: dreiProgress } = useProgress();
  const displayProgress = Math.max(progress, dreiProgress);

  return (
    <Html center>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 rounded-full"></div>
            <motion.div 
              className="absolute inset-0 w-16 h-16 border-4 border-t-figuro-accent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="text-center">
            <p className="text-white font-medium mb-2">Loading Model</p>
            <Progress 
              value={displayProgress} 
              className="w-32 h-2 bg-white/20" 
            />
            <p className="text-white/70 text-sm mt-2">{Math.round(displayProgress)}%</p>
          </div>
        </div>
      </motion.div>
    </Html>
  );
};

// Enhanced error view with retry functionality
const EnhancedErrorView = ({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry?: () => void; 
}) => (
  <Html center>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-red-500/10 border border-red-500/20 max-w-sm text-center"
    >
      <div className="text-red-400 mb-4">
        <EyeOff className="w-8 h-8 mx-auto mb-2" />
        <p className="font-medium">Failed to Load Model</p>
        <p className="text-sm text-red-300 mt-1">{error}</p>
      </div>
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="border-red-400/50 text-red-400 hover:bg-red-400/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </motion.div>
  </Html>
);

const EnhancedModelViewer: React.FC<EnhancedModelViewerProps> = ({
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
  const [showEnvironment, setShowEnvironment] = useState(true);
  const [cameraPosition, setCameraPosition] = useState([0, 0, 5]);
  const orbitControlsRef = useRef<any>(null);
  const { toast } = useToast();

  const {
    autoRotate,
    setAutoRotate,
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
      setCameraPosition([0, 0, 5]);
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
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".glb,.gltf"
        className="hidden"
      />

      {/* Enhanced 3D Scene */}
      <div className={cn("relative", heightClass, isFullscreen && "h-full")}>
        <Canvas
          shadows
          gl={{
            powerPreference: "high-performance",
            antialias: true,
            alpha: true,
            depth: true,
            stencil: false,
            preserveDrawingBuffer: false
          }}
          dpr={[1, 2]}
          camera={{ position: cameraPosition as [number, number, number], fov: 45 }}
        >
          {/* Enhanced lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4f46e5" />
          
          <PerspectiveCamera makeDefault position={cameraPosition as [number, number, number]} />
          
          {/* Model Scene */}
          {isLoading ? (
            <EnhancedLoadingView progress={progress} />
          ) : shouldShowError ? (
            <EnhancedErrorView 
              error={errorMessage || modelError || "Failed to load model"}
              onRetry={() => window.location.reload()}
            />
          ) : (
            <EnhancedModelScene
              modelUrl={customModelBlob ? null : displayModelUrl}
              modelBlob={customModelBlob}
              autoRotate={autoRotate}
              showWireframe={showWireframe}
              onModelError={handleModelError}
            />
          )}
          
          {/* Enhanced controls */}
          <OrbitControls
            ref={orbitControlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enableDamping={true}
            dampingFactor={0.05}
            maxDistance={50}
            minDistance={1}
          />
          
          {/* Enhanced environment and effects */}
          {showEnvironment && (
            <>
              <Environment preset="sunset" />
              <ContactShadows 
                opacity={0.4} 
                scale={10} 
                blur={1} 
                far={10} 
                resolution={256} 
              />
            </>
          )}
          
          {/* Floating grid for reference */}
          <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} position={[0, -2, 0]} />
        </Canvas>
        
        {/* Overlay controls */}
        <AnimatePresence>
          {displayModelUrl && showControls && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className="glass-panel p-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-white/30 text-white/70">
                      {customFile?.name || "Generated Model"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEnvironment(!showEnvironment)}
                      className="hover:bg-white/10 text-white/70"
                    >
                      {showEnvironment ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      onClick={handleDownload}
                      size="sm"
                      className="bg-figuro-accent hover:bg-figuro-accent-hover text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EnhancedModelViewer;
