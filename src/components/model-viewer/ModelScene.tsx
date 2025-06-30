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
  // Stable source management with better change detection
  const [stableSource, setStableSource] = useState<string | null>(modelUrl);
  const [stableBlob, setStableBlob] = useState<Blob | null>(modelBlob || null);
  const [loadKey, setLoadKey] = useState<string>(`load-${Date.now()}`);
  const orbitControlsRef = useRef<any>(null);
  
  // Track previous values to prevent unnecessary updates
  const previousUrlRef = useRef<string | null>(modelUrl);
  const previousBlobRef = useRef<Blob | null>(modelBlob || null);
  
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
  
  // Improved URL change detection and stabilization
  useEffect(() => {
    const hasUrlChanged = modelUrl !== previousUrlRef.current;
    const hasBlobChanged = modelBlob !== previousBlobRef.current;
    
    if (hasUrlChanged || hasBlobChanged) {
      console.log("ModelScene: Source changed", { 
        oldUrl: previousUrlRef.current, 
        newUrl: modelUrl,
        hasBlobChanged 
      });
      
      // Update refs
      previousUrlRef.current = modelUrl;
      previousBlobRef.current = modelBlob || null;
      
      // Generate new load key to force re-render
      setLoadKey(`load-${Date.now()}`);
      
      // Debounced update to prevent rapid changes
      const timer = setTimeout(() => {
        if (modelBlob) {
          setStableBlob(modelBlob);
          setStableSource(null); // Clear URL when using blob
        } else {
          setStableSource(modelUrl);
          setStableBlob(null); // Clear blob when using URL
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [modelUrl, modelBlob]);

  const handleModelError = (error: any) => {
    console.error("ModelScene: Error in 3D model:", error);
    onModelError(error);
  };

  // Dynamic canvas settings based on performance and fullscreen mode
  const canvasSettings = {
    shadows: !isPreview && !shouldReduceQuality,
    gl: {
      powerPreference: (isPreview || shouldReduceQuality) ? "low-power" as const : "high-performance" as const,
      antialias: !isPreview && !shouldReduceQuality && !isFullscreen,
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
      max: shouldReduceQuality ? 0.7 : (isFullscreen ? 0.9 : 1),
      debounce: isFullscreen ? 100 : 200
    }
  };

  const lightIntensity = isPreview || shouldReduceQuality ? 0.5 : (isFullscreen ? 0.8 : 1);
  const shadowMapSize = (isPreview || shouldReduceQuality) ? 512 : (isFullscreen ? 1024 : 2048);

  // Create the main 3D scene content as a memoized component to prevent Canvas issues
  const SceneContent = React.useMemo(() => (
    <>
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
    </>
  ), [
    lightIntensity, 
    shadowMapSize, 
    isFullscreen, 
    isPreview, 
    shouldReduceQuality, 
    stableSource, 
    stableBlob, 
    autoRotate, 
    handleModelError
  ]);

  return (
    <div className="relative w-full h-full">
      <Canvas key={loadKey} {...canvasSettings}>
        {SceneContent}
      </Canvas>
      
      {/* Performance overlay moved outside Canvas and only shown in development */}
      {enablePerformanceMonitoring && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded font-mono pointer-events-none z-10">
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
    </div>
  );
});

ModelScene.displayName = "ModelScene";

export default ModelScene;
