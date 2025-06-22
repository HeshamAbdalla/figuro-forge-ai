
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Share,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import EnhancedModelScene from './EnhancedModelScene';
import { useModelViewerState } from './useModelViewerState';
import { useTextTo3DModelLoader } from '@/hooks/useTextTo3DModelLoader';
import { TextTo3DModelInfo, BaseModelViewerProps } from './types/ModelViewerTypes';

interface Text3DModelViewerProps extends BaseModelViewerProps {
  modelInfo: TextTo3DModelInfo;
}

// Enhanced loading component for text-to-3D
const Text3DLoadingView = React.memo(({ progress = 0, modelInfo }: { progress: number; modelInfo: TextTo3DModelInfo }) => {
  return (
    <Html center>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium mb-2">
              {modelInfo.status === 'processing' ? 'Generating 3D Model' : 'Loading Model'}
            </p>
            <Progress 
              value={progress} 
              className="w-40 h-2 bg-white/20" 
            />
            <p className="text-white/70 text-sm mt-2">{Math.round(progress)}%</p>
            {modelInfo.prompt && (
              <p className="text-blue-300 text-xs mt-2 max-w-[200px] truncate">
                "{modelInfo.prompt}"
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Html>
  );
});

Text3DLoadingView.displayName = 'Text3DLoadingView';

const Text3DModelViewer: React.FC<Text3DModelViewerProps> = ({
  modelInfo,
  isLoading = false,
  progress = 0,
  errorMessage = null,
  onCustomModelLoad,
  variant = 'standard',
  showControls = true,
  className,
  onModelError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitControlsRef = useRef<any>(null);
  const [showEnvironment, setShowEnvironment] = useState(true);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const { toast } = useToast();

  // Use specialized text-to-3D loader
  const {
    loading: textTo3DLoading,
    model: textTo3DModel,
    error: textTo3DError,
    loadModel: loadTextTo3DModel,
    progress: textTo3DProgress
  } = useTextTo3DModelLoader(modelInfo);

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
    handleModelError: handleModelErrorState
  } = useModelViewerState(modelInfo.modelUrl, onCustomModelLoad);

  const handleModelLoadError = useCallback((error: any) => {
    handleModelErrorState(error);
    onModelError?.(error);
  }, [handleModelErrorState, onModelError]);

  const resetCamera = useCallback(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
      toast({
        title: "Camera Reset",
        description: "View has been reset to default position"
      });
    }
  }, [toast]);

  const handleShare = useCallback(async () => {
    try {
      const shareData = {
        title: `3D Model: ${modelInfo.prompt || 'Generated Model'}`,
        text: `Check out this AI-generated 3D model: "${modelInfo.prompt}"`,
        url: modelInfo.modelUrl
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(modelInfo.modelUrl);
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
  }, [modelInfo, toast]);

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      if (customModelBlob) {
        URL.revokeObjectURL(customModelBlob);
      }
    };
  }, [customModelBlob]);

  // Determine loading and error states
  const isModelLoading = isLoading || textTo3DLoading;
  const modelLoadingProgress = Math.max(progress, textTo3DProgress);
  const currentModelError = errorMessage || textTo3DError || modelError;
  const shouldShowModelError = shouldShowError || !!textTo3DError;

  const isCompact = variant === 'compact' || variant === 'gallery';
  const heightClass = isCompact ? 'h-[300px]' : 'h-[500px]';

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass-panel rounded-2xl overflow-hidden border border-blue-500/20 shadow-glow",
        className
      )}
    >
      {/* Enhanced Header for Text-to-3D */}
      {showControls && (
        <div className="p-4 border-b border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-gradient">
                  AI Generated 3D
                </h3>
              </div>
              
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Text-to-3D
              </Badge>
              
              {modelInfo.status && (
                <Badge 
                  className={cn(
                    "border",
                    modelInfo.status === 'completed' && "bg-green-500/20 text-green-400 border-green-500/30",
                    modelInfo.status === 'processing' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                    modelInfo.status === 'failed' && "bg-red-500/20 text-red-400 border-red-500/30"
                  )}
                >
                  {modelInfo.status}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {modelInfo.modelUrl && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModelInfo(!showModelInfo)}
                    className="hover:bg-white/10"
                    aria-label="Toggle model information"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className="hover:bg-white/10"
                    aria-label={autoRotate ? "Stop auto rotation" : "Start auto rotation"}
                  >
                    <RotateCcw className={cn(
                      "w-4 h-4",
                      autoRotate && "animate-spin"
                    )} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="hover:bg-white/10"
                    aria-label="Share model"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetCamera}
                    className="hover:bg-white/10"
                    aria-label="Reset camera position"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={triggerFileInputClick}
                className="hover:bg-white/10"
                aria-label="Upload custom model"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Model Info Panel */}
          <AnimatePresence>
            {showModelInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="text-sm text-white/80 space-y-2">
                  {modelInfo.prompt && (
                    <div><span className="text-blue-400 font-medium">Prompt:</span> {modelInfo.prompt}</div>
                  )}
                  {modelInfo.artStyle && (
                    <div><span className="text-blue-400 font-medium">Style:</span> {modelInfo.artStyle}</div>
                  )}
                  {modelInfo.metadata?.polycount && (
                    <div><span className="text-blue-400 font-medium">Polygons:</span> {modelInfo.metadata.polycount.toLocaleString()}</div>
                  )}
                  <div><span className="text-blue-400 font-medium">Task ID:</span> {modelInfo.taskId}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".glb,.gltf"
        className="hidden"
        aria-label="Upload 3D model file"
      />

      {/* Enhanced 3D Scene for Text-to-3D */}
      <div className={cn("relative", heightClass)}>
        <Canvas
          shadows
          gl={{
            powerPreference: "high-performance",
            antialias: true,
            alpha: true
          }}
          dpr={[1, 2]}
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4f46e5" />
          
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          {isModelLoading ? (
            <Text3DLoadingView progress={modelLoadingProgress} modelInfo={modelInfo} />
          ) : shouldShowModelError ? (
            <Html center>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-red-500/10 border border-red-500/20 max-w-sm text-center"
              >
                <div className="text-red-400 mb-4">
                  <EyeOff className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Failed to Load 3D Model</p>
                  <p className="text-sm text-red-300 mt-1">{currentModelError}</p>
                </div>
                <Button 
                  onClick={loadTextTo3DModel}
                  variant="outline"
                  size="sm"
                  className="border-red-400/50 text-red-400 hover:bg-red-400/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </motion.div>
            </Html>
          ) : (
            <EnhancedModelScene
              modelUrl={customModelBlob ? null : displayModelUrl}
              modelBlob={customModelBlob ? URL.createObjectURL(customModelBlob) : null}
              autoRotate={autoRotate}
              showWireframe={false}
              onModelError={handleModelLoadError}
              preloadedModel={textTo3DModel}
            />
          )}
          
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
          
          <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} position={[0, -2, 0]} />
        </Canvas>
        
        {/* Enhanced overlay controls for Text-to-3D */}
        {displayModelUrl && showControls && !isModelLoading && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass-panel p-3 rounded-xl backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                    {modelInfo.prompt?.substring(0, 30) || 'AI Generated'}
                    {(modelInfo.prompt?.length || 0) > 30 && '...'}
                  </Badge>
                  {modelInfo.progress !== undefined && modelInfo.progress < 100 && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {modelInfo.progress}%
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEnvironment(!showEnvironment)}
                    className="hover:bg-white/10 text-white/70"
                    aria-label={showEnvironment ? "Hide environment" : "Show environment"}
                  >
                    {showEnvironment ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    aria-label="Download 3D model"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Text3DModelViewer;
