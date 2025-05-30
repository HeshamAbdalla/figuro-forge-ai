import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";
import DummyBox from "./DummyBox";
import ErrorBoundary from "./ErrorBoundary";
import Model3D from "./Model3D";
import { globalPerformanceMonitor, PerformanceStats } from "./utils/performanceMonitor";
import { webGLContextTracker } from "./utils/resourceManager";

interface ModelSceneProps {
  modelUrl: string | null;
  modelBlob?: Blob | null;
  autoRotate: boolean;
  onModelError: (error: any) => void;
  isPreview?: boolean;
  enablePerformanceMonitoring?: boolean;
}

export interface ModelSceneRef {
  resetCamera: () => void;
  getPerformanceStats: () => PerformanceStats;
}

const ModelScene = forwardRef<ModelSceneRef, ModelSceneProps>(({ 
  modelUrl, 
  modelBlob, 
  autoRotate, 
  onModelError, 
  isPreview = false,
  enablePerformanceMonitoring = false
}, ref) => {
  // Track the current model source to prevent unnecessary re-renders
  const currentSourceRef = useRef<string | Blob | null>(null);
  const [stableSource, setStableSource] = useState<string | null>(modelUrl);
  const [stableBlob, setStableBlob] = useState<Blob | null>(modelBlob || null);
  const [loadKey, setLoadKey] = useState<string>(`load-${Date.now()}`);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const orbitControlsRef = useRef<any>(null);
  
  // Expose reset camera functionality and performance stats
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.reset();
      }
    },
    getPerformanceStats: () => {
      return globalPerformanceMonitor.getStats();
    }
  }));

  // Initialize performance monitoring
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      const handlePerformanceUpdate = (stats: PerformanceStats) => {
        setPerformanceStats(stats);
        
        // Log performance warnings
        if (stats.fps < 30) {
          console.warn(`Low FPS detected: ${stats.fps.toFixed(1)}`);
        }
        if (stats.renderTime > 16) {
          console.warn(`High render time: ${stats.renderTime.toFixed(1)}ms`);
        }
        if (stats.memoryUsage > 100) {
          console.warn(`High memory usage: ${stats.memoryUsage.toFixed(1)}MB`);
        }
      };

      globalPerformanceMonitor.addCallback(handlePerformanceUpdate);
      globalPerformanceMonitor.start();

      return () => {
        globalPerformanceMonitor.removeCallback(handlePerformanceUpdate);
        globalPerformanceMonitor.stop();
      };
    }
  }, [enablePerformanceMonitoring]);
  
  // Stabilize the source to prevent rapid changes
  useEffect(() => {
    // Only update if there's been a significant change in modelUrl
    // and it's different from what we're currently tracking
    if (modelUrl !== currentSourceRef.current) {
      console.log("ModelScene: URL source changed to", modelUrl);
      
      // Clear any previous timeouts
      const current = currentSourceRef.current;
      currentSourceRef.current = modelUrl;
      
      // If this is a completely new URL (not just undefined → undefined)
      if (modelUrl || (current !== null && modelUrl !== current)) {
        // Generate new load key to force proper re-mounting
        setLoadKey(`load-${Date.now()}`);
        
        // Small delay to ensure stable updates and prevent thrashing
        const timer = setTimeout(() => {
          setStableSource(modelUrl);
          // Clear blob when URL changes
          if (modelUrl) setStableBlob(null);
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [modelUrl]);
  
  // Separate effect for blob changes to prevent dependencies conflicts
  useEffect(() => {
    // Only update if the blob itself has changed and is not null
    if (modelBlob && modelBlob !== currentSourceRef.current) {
      console.log("ModelScene: Blob source changed");
      
      // Generate new load key to force proper re-mounting
      setLoadKey(`load-${Date.now()}`);
      currentSourceRef.current = modelBlob;
      
      // Small delay to ensure stable updates
      const timer = setTimeout(() => {
        setStableBlob(modelBlob);
        // Clear URL when blob changes
        if (modelBlob) setStableSource(null);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [modelBlob]);

  // Handler for errors in the 3D model
  const handleModelError = (error: any) => {
    console.error("ModelScene: Error in 3D model:", error);
    onModelError(error);
  };

  // Optimized Canvas settings for performance
  const canvasSettings = {
    shadows: !isPreview, // Disable shadows for previews
    gl: {
      powerPreference: isPreview ? "low-power" as const : "high-performance" as const,
      antialias: !isPreview,
      alpha: true,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: isPreview
    },
    dpr: isPreview ? [0.5, 1] as [number, number] : [1, 2] as [number, number], // Properly typed tuples
    frameloop: (autoRotate ? "always" : "demand") as "always" | "demand" | "never", // Fix frameloop typing
    performance: {
      min: isPreview ? 0.2 : 0.5, // Lower performance threshold for previews
      max: 1,
      debounce: 200
    }
  };

  return (
    <>
      <Canvas key={loadKey} {...canvasSettings}>
        <ambientLight intensity={isPreview ? 0.3 : 0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={isPreview ? 0.5 : 1}
          castShadow={!isPreview}
          shadow-mapSize-width={isPreview ? 512 : 1024}
          shadow-mapSize-height={isPreview ? 512 : 1024}
        />
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 5]}
          near={0.1}
          far={isPreview ? 100 : 1000} // Shorter far plane for previews
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
          autoRotateSpeed={isPreview ? 1 : 2}
          enablePan={!isPreview}
          enableZoom={true}
          enableRotate={true}
          enableDamping={!isPreview} // Disable damping for previews (better performance)
          dampingFactor={0.05}
          maxDistance={isPreview ? 50 : 100}
          minDistance={1}
        />
        <Environment 
          preset="sunset" 
          resolution={isPreview ? 64 : 256} // Lower resolution for previews
        />
      </Canvas>
      
      {/* Performance Stats Display (Development Mode) */}
      {enablePerformanceMonitoring && performanceStats && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded font-mono">
          <div>FPS: {performanceStats.fps.toFixed(1)}</div>
          <div>Render: {performanceStats.renderTime.toFixed(1)}ms</div>
          <div>Memory: {performanceStats.memoryUsage.toFixed(1)}MB</div>
          <div>Contexts: {webGLContextTracker.getActiveContextCount()}</div>
        </div>
      )}
    </>
  );
});

ModelScene.displayName = "ModelScene";

export default ModelScene;
