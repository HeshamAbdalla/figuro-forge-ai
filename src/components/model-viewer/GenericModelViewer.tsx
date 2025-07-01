
import React, { useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import EnhancedModelScene from './EnhancedModelScene';
import { useModelViewerState } from './useModelViewerState';
import { UrlModelInfo, BaseModelViewerProps } from './types/ModelViewerTypes';

interface GenericModelViewerProps extends BaseModelViewerProps {
  modelInfo: UrlModelInfo;
  fillHeight?: boolean; // New prop to control height behavior
}

const GenericModelViewer: React.FC<GenericModelViewerProps> = ({
  modelInfo,
  isLoading = false,
  progress = 0,
  errorMessage = null,
  onCustomModelLoad,
  variant = 'standard',
  showControls = true,
  className,
  onModelError,
  fillHeight = false // Default to false for backward compatibility
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitControlsRef = useRef<any>(null);
  const [showEnvironment, setShowEnvironment] = useState(true);
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

  const currentModelError = errorMessage || modelError;
  const isCompact = variant === 'compact' || variant === 'gallery';
  
  // Determine height class based on fillHeight prop and variant
  const getHeightClass = () => {
    if (fillHeight) {
      return 'h-full';
    }
    return isCompact ? 'h-[300px]' : 'h-[500px]';
  };
  
  const heightClass = getHeightClass();

  // Don't render if no model URL and not loading
  if (!modelInfo.modelUrl && !customFile && !isLoading) {
    return null;
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-glow",
        fillHeight ? "h-full flex flex-col" : "",
        className
      )}
    >
      {/* Header */}
      {showControls && (
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10 flex-shrink-0">
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
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Generic Model
              </Badge>
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
                    onClick={resetCamera}
                    className="hover:bg-white/10"
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
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".glb,.gltf"
        className="hidden"
      />

      {/* 3D Scene */}
      <div className={cn(
        "relative",
        fillHeight ? "flex-1" : heightClass
      )}>
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
          
          {isLoading ? (
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#9b87f5" opacity={0.5} transparent />
            </mesh>
          ) : shouldShowError || currentModelError ? (
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#ef4444" opacity={0.5} transparent />
            </mesh>
          ) : (
            <EnhancedModelScene
              modelUrl={customModelBlob ? null : displayModelUrl}
              modelBlob={customModelBlob}
              autoRotate={autoRotate}
              showWireframe={false}
              onModelError={handleModelLoadError}
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
        
        {/* Overlay controls */}
        {displayModelUrl && showControls && !isLoading && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass-panel p-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-white/30 text-white/70">
                    {customFile?.name || modelInfo.fileName || 'Generic Model'}
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
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GenericModelViewer;
