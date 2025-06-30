
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "./LoadingSpinner";
import DummyBox from "./DummyBox";
import ErrorBoundary from "./ErrorBoundary";
import Model3D from "./Model3D";
import { useModelViewerPerformance } from "./hooks/useModelViewerPerformance";
import { webGLContextTracker } from "./utils/resourceManager";

interface ModelSceneProps {
  modelUrl: string | null;
  modelBlob?: Blob | null;
  autoRotate: boolean;
  onModelError: (error: any) => void;
  isPreview?: boolean;
  enablePerformanceMonitoring?: boolean;
  isFullscreen?: boolean;
}

export interface ModelSceneRef {
  resetCamera: () => void;
  getPerformanceMetrics: () => any;
}

const ModelScene = forwardRef<ModelSceneRef, ModelSceneProps>(({ 
  modelUrl, 
  modelBlob, 
  autoRotate, 
  onModelError, 
  isPreview = false,
  enablePerformanceMonitoring = false,
  isFullscreen = false
}, ref) => {
  const currentSourceRef = useRef<string | Blob | null>(null);
  const [stableSource, setStableSource] = useState<string | null>(modelUrl);
  const [stableBlob, setStableBlob] = useState<Blob | null>(modelBlob || null);
  const [loadKey, setLoadKey] = useState<string>(`load-${Date.now()}`);
  const orbitControlsRef = useRef<any>(null);
  
  // Performance monitoring
  const { 
    metrics, 
    shouldReduceQuality,
    isPerformanceOptimal 
  } = useModelViewerPerformance(enablePerformanceMonitoring);

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.reset();
      }
    },
    getPerformanceMetrics: () => metrics
  }));
  
  // Stabilize URL changes
  useEffect(() => {
    if (modelUrl !== currentSourceRef.current) {
      console.log("ModelScene: URL source changed to", modelUrl);
      
      const current = currentSourceRef.current;
      currentSourceRef.current = modelUrl;
      
      if (modelUrl || (current !== null && modelUrl !== current)) {
        setLoadKey(`load-${Date.now()}`);
        
        const timer = setTimeout(() => {
          setStableSource(modelUrl);
          if (modelUrl) setStableBlob(null);
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [modelUrl]);
  
  // Stabilize blob changes
  useEffect(() => {
    if (modelBlob && modelBlob !== currentSourceRef.current) {
      console.log("ModelScene: Blob source changed");
      
      setLoadKey(`load-${Date.now()}`);
      currentSourceRef.current = modelBlob;
      
      const timer = setTimeout(() => {
        setStableBlob(modelBlob);
        if (modelBlob) setStableSource(null);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [modelBlob]);

  const handleModelError = (error: any) => {
    console.error("ModelScene: Error in 3D model:", error);
    onModelError(error);
  };

  // Dynamic canvas settings based on performance and fullscreen mode
  const canvasSettings = {
    shadows: !isPreview && !shouldReduceQuality,
    gl: {
      powerPreference: (isPreview || shouldReduceQuality) ? "low-power" as const : "high-performance" as const,
      antialias: !isPreview && !shouldReduceQuality && !isFullscreen, // Reduce antialiasing in fullscreen for better performance
      alpha: true,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: isPreview || shouldReduceQuality
    },
    dpr: (isPreview || shouldReduceQuality) ? [0.5, 1] as [number, number] : (isFullscreen ? [1, 1.5] as [number, number] : [1, 2] as [number, number]),
    frameloop: (autoRotate ? "always" : "demand") as "always" | "demand" | "never",
    performance: {
      min: (isPreview || shouldReduceQuality) ? 0.2 : 0.5,
      max: shouldReduceQuality ? 0.7 : (isFullscreen ? 0.9 : 1), // Slightly reduce max performance in fullscreen
      debounce: isFullscreen ? 100 : 200 // Faster debounce in fullscreen
    }
  };

  const lightIntensity = isPreview || shouldReduceQuality ? 0.5 : (isFullscreen ? 0.8 : 1);
  const shadowMapSize = (isPreview || shouldReduceQuality) ? 512 : (isFullscreen ? 1024 : 2048);

  return (
    <>
      <Canvas key={loadKey} {...canvasSettings}>
        <ambientLight intensity={lightIntensity * 0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={lightIntensity}
          castShadow={!isPreview && !shouldReduceQuality}
          shadow-mapSize-width={shadowMapSize}
          shadow-mapSize-height={shadowMapSize}
        />
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, isFullscreen ? 4 : 5]}
          near={0.1}
          far={isPreview ? 100 : (isFullscreen ? 1500 : 1000)}
        />
        
        <Suspense fallback={<LoadingSpinner />}>
          {(stableSource || stableBlob) ? (
            <ErrorBoundary 
              fallback={<DummyBox />} 
              onError={handleModelError}
            >
              <Model3D 
                modelSource={stableSource} 
                modelBlob={stableBlob}
                onError={handleModelError}
                isPreview={isPreview}
              />
            </ErrorBoundary>
          ) : (
            <DummyBox />
          )}
        </Suspense>
        
        <OrbitControls 
          ref={orbitControlsRef}
          autoRotate={autoRotate}
          autoRotateSpeed={isPreview ? 1 : (isFullscreen ? 1.5 : 2)}
          enablePan={!isPreview}
          enableZoom={true}
          enableRotate={true}
          enableDamping={!isPreview && !shouldReduceQuality}
          dampingFactor={isFullscreen ? 0.03 : 0.05}
          maxDistance={isPreview ? 50 : (isFullscreen ? 150 : 100)}
          minDistance={isFullscreen ? 0.5 : 1}
        />
        <Environment 
          preset="sunset" 
          resolution={isPreview || shouldReduceQuality ? 64 : (isFullscreen ? 128 : 256)}
        />
      </Canvas>
      
      {/* Performance overlay for development */}
      {enablePerformanceMonitoring && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded font-mono">
          <div>FPS: {metrics.fps.toFixed(1)}</div>
          <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
          <div>Contexts: {metrics.webglContexts}</div>
          <div>Mode: {isFullscreen ? 'FULLSCREEN' : 'NORMAL'}</div>
          <div className={cn(
            "mt-1 px-1 rounded text-xs",
            isPerformanceOptimal ? "bg-green-600" : "bg-red-600"
          )}>
            {isPerformanceOptimal ? "OPTIMAL" : "DEGRADED"}
          </div>
        </div>
      )}
    </>
  );
});

ModelScene.displayName = "ModelScene";

export default ModelScene;
