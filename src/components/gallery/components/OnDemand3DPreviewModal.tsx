
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Eye } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Center } from "@react-three/drei";
import { ErrorBoundary } from "@/components/model-viewer/ErrorBoundary";
import { useOptimizedModelLoader } from "@/components/model-viewer/hooks/useOptimizedModelLoader";
import { enhancedResourcePool } from "../performance/EnhancedResourcePool";
import { webGLContextTracker } from "@/components/model-viewer/utils/resourceManager";
import LoadingSpinner from "@/components/model-viewer/LoadingSpinner";
import * as THREE from "three";

interface OnDemand3DPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelUrl: string | null;
  modelName: string | null;
  onDownload?: () => void;
  onViewFull?: () => void;
}

const Model3DContent: React.FC<{ 
  modelUrl: string; 
  modelId: string;
  onError: (error: any) => void;
}> = ({ modelUrl, modelId, onError }) => {
  const { loading, model, error } = useOptimizedModelLoader({
    modelSource: modelUrl,
    visible: true,
    modelId: modelId,
    priority: 0, // High priority for on-demand loading
    onError: onError
  });

  if (loading) {
    return (
      <mesh>
        <primitive object={enhancedResourcePool.getSharedGeometry('box')} />
        <primitive object={enhancedResourcePool.getOrCreateMaterial({ type: 'basic', color: '#666666' })} />
      </mesh>
    );
  }

  if (error || !model) {
    return (
      <mesh>
        <primitive object={enhancedResourcePool.getSharedGeometry('box')} />
        <primitive object={enhancedResourcePool.getOrCreateMaterial({ type: 'basic', color: '#ff4444' })} />
      </mesh>
    );
  }

  return (
    <Center>
      <primitive object={model} scale={1.5} />
    </Center>
  );
};

const OnDemand3DPreviewModal: React.FC<OnDemand3DPreviewModalProps> = ({
  open,
  onOpenChange,
  modelUrl,
  modelName,
  onDownload,
  onViewFull
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Generate stable model ID
  const modelId = React.useMemo(() => {
    if (!modelUrl) return '';
    try {
      const url = new URL(modelUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1]?.split('.')[0] || 'unknown';
      return `on-demand-${filename}-${url.hostname.replace(/\./g, '-')}`;
    } catch (e) {
      return `on-demand-${modelName?.replace(/\W/g, '') || 'model'}-${Date.now()}`;
    }
  }, [modelUrl, modelName]);

  const handleError = (error: any) => {
    console.error('OnDemand3DPreviewModal error:', error);
    setHasError(true);
    setErrorMessage(error.message || 'Failed to load 3D model');
  };

  const handleClose = () => {
    onOpenChange(false);
    // Clean up resources when closing
    setTimeout(() => {
      enhancedResourcePool.clear();
      webGLContextTracker.releaseContext();
    }, 100);
  };

  // Reset error state when modal opens with new model
  useEffect(() => {
    if (open && modelUrl) {
      setHasError(false);
      setErrorMessage("");
    }
  }, [open, modelUrl]);

  if (!modelUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] p-0 bg-gray-900/95 border border-white/10">
        <DialogHeader className="p-4 border-b border-white/10">
          <DialogTitle className="flex justify-between items-center">
            <span className="text-white">3D Preview: {modelName || 'Model'}</span>
            <div className="flex gap-2">
              {onDownload && (
                <Button variant="ghost" size="icon" onClick={onDownload} className="h-8 w-8">
                  <Download size={16} />
                </Button>
              )}
              {onViewFull && (
                <Button variant="ghost" size="icon" onClick={onViewFull} className="h-8 w-8">
                  <Eye size={16} />
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                  <X size={16} />
                </Button>
              </DialogClose>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative">
          {hasError ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white/60">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <X size={32} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Failed to Load Model</h3>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <ErrorBoundary fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white/60">
                  <h3 className="text-lg font-semibold mb-2">Preview Error</h3>
                  <p className="text-sm">Unable to display 3D model</p>
                </div>
              </div>
            } onError={handleError}>
              <Canvas
                gl={{
                  powerPreference: "default",
                  antialias: true,
                  alpha: true,
                  depth: true,
                  stencil: false,
                  preserveDrawingBuffer: false
                }}
                dpr={[1, 2]}
                camera={{ position: [0, 0, 5], fov: 60 }}
                onCreated={({ gl }) => {
                  webGLContextTracker.registerContext();
                  
                  gl.domElement.addEventListener('webglcontextlost', (event) => {
                    event.preventDefault();
                    handleError(new Error('WebGL context lost'));
                  });
                }}
              >
                <color attach="background" args={['#1a1a1a']} />
                
                {/* Enhanced lighting for better model visibility */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.2} />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} />
                
                <React.Suspense fallback={<LoadingSpinner />}>
                  <Model3DContent
                    modelUrl={modelUrl}
                    modelId={modelId}
                    onError={handleError}
                  />
                </React.Suspense>
                
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  dampingFactor={0.1}
                  rotateSpeed={1.0}
                  zoomSpeed={1.0}
                  panSpeed={0.8}
                />
                
                <Environment preset="city" />
              </Canvas>
            </ErrorBoundary>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10 bg-gray-800/50">
          <p className="text-xs text-white/50 text-center">
            Use mouse to rotate, scroll to zoom, right-click and drag to pan
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnDemand3DPreviewModal;
