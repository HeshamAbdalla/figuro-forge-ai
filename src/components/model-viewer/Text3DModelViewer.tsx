
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RotateCcw, EyeOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import EnhancedModelScene from './EnhancedModelScene';
import ModelViewerControls from './components/ModelViewerControls';
import ModelInfoPanel from './components/ModelInfoPanel';
import ModelViewerOverlay from './components/ModelViewerOverlay';
import { useModelViewerState } from './useModelViewerState';
import { useTextTo3DModelLoader } from '@/hooks/useTextTo3DModelLoader';
import { useModelViewerPerformance } from './hooks/useModelViewerPerformance';
import { TextTo3DModelInfo, BaseModelViewerProps } from './types/ModelViewerTypes';

interface Text3DModelViewerProps extends BaseModelViewerProps {
  modelInfo: TextTo3DModelInfo;
}

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

  // Performance monitoring for development
  const { metrics, shouldReduceQuality } = useModelViewerPerformance(
    process.env.NODE_ENV === 'development'
  );

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
        URL.revokeObjectURL(URL.createObjectURL(customModelBlob));
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

  // Adjust quality based on performance
  const canvasSettings = {
    shadows: !shouldReduceQuality,
    gl: {
      powerPreference: shouldReduceQuality ? "low-power" as const : "high-performance" as const,
      antialias: !shouldReduceQuality,
      alpha: true
    },
    dpr: shouldReduceQuality ? [0.5, 1] as [number, number] : [1, 2] as [number, number]
  };

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
      <ModelViewerControls
        showControls={showControls}
        modelType="text-to-3d"
        modelStatus={modelInfo.status}
        autoRotate={autoRotate}
        showEnvironment={showEnvironment}
        showModelInfo={showModelInfo}
        onAutoRotateToggle={() => setAutoRotate(!autoRotate)}
        onEnvironmentToggle={() => setShowEnvironment(!showEnvironment)}
        onModelInfoToggle={() => setShowModelInfo(!showModelInfo)}
        onResetCamera={resetCamera}
        onShare={handleShare}
        onUpload={triggerFileInputClick}
        onDownload={handleDownload}
      />

      <ModelInfoPanel 
        show={showModelInfo} 
        modelInfo={modelInfo} 
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".glb,.gltf"
        className="hidden"
        aria-label="Upload 3D model file"
      />

      <div className={cn("relative", heightClass)}>
        <Canvas {...canvasSettings}>
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow={!shouldReduceQuality}
            shadow-mapSize-width={shouldReduceQuality ? 512 : 2048}
            shadow-mapSize-height={shouldReduceQuality ? 512 : 2048}
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
              modelBlob={customModelBlob}
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
                resolution={shouldReduceQuality ? 128 : 256} 
              />
            </>
          )}
          
          <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} position={[0, -2, 0]} />
        </Canvas>
        
        <ModelViewerOverlay
          modelInfo={modelInfo}
          showControls={showControls}
          showEnvironment={showEnvironment}
          isLoading={isModelLoading}
          onEnvironmentToggle={() => setShowEnvironment(!showEnvironment)}
          onDownload={handleDownload}
        />
      </div>
    </motion.div>
  );
};

export default Text3DModelViewer;
