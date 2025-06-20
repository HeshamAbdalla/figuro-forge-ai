
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
import { sharedResourcePool } from "../gallery/performance/SharedResourcePool";

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

  // Initialize performance monitoring (development only)
  useEffect(() => {
    if (enablePerformanceMonitoring && process.env.NODE_ENV === 'development') {
      const handlePerformanceUpdate = (stats: PerformanceStats) => {
        setPerformanceStats(stats);
        
        // Log performance warnings in development only
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
    if (modelUrl !== currentSourceRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log("ModelScene: URL source changed to", modelUrl);
      }
      
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
  
  // Separate effect for blob changes
  useEffect(() => {
    if (modelBlob && modelBlob !== currentSourceRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log("ModelScene: Blob source changed");
      }
      
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
    if (process.env.NODE_ENV === 'development') {
      console.error("ModelScene: Error in 3D model:", error);
    }
    onModelError(error);
  };

  // Optimized Canvas settings with shared resources
  const canvasSettings = {
    shadows: !isPreview,
    gl: {
      powerPreference: isPreview ? "low-power" as const : "high-performance" as const,
      antialias: !isPreview,
      alpha: true,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: isPreview
    },
    dpr: isPreview ? [0.5, 1] as [number, number] : [1, 2] as [number, number],
    frameloop: (autoRotate ? "always" : "demand") as "always" | "demand" | "never",
    performance: {
      min: isPreview ? 0.2 : 0.5,
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
          far={isPreview ? 100 : 1000}
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
          enableDamping={!isPreview}
          dampingFactor={0.05}
          maxDistance={isPreview ? 50 : 100}
          minDistance={1}
        />
        <Environment 
          preset="sunset" 
          resolution={isPreview ? 64 : 256}
        />
      </Canvas>
      
      {/* Performance Stats Display (Development Mode Only) */}
      {enablePerformanceMonitoring && performanceStats && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded font-mono">
          <div>FPS: {performanceStats.fps.toFixed(1)}</div>
          <div>Render: {performanceStats.renderTime.toFixed(1)}ms</div>
          <div>Memory: {performanceStats.memoryUsage.toFixed(1)}MB</div>
          <div>Contexts: {webGLContextTracker.getActiveContextCount()}</div>
          <div>Pool: {JSON.stringify(sharedResourcePool.getStats())}</div>
        </div>
      )}
    </>
  );
});

ModelScene.displayName = "ModelScene";

export default ModelScene;
