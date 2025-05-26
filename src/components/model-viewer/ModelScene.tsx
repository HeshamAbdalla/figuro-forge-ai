
import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";
import DummyBox from "./DummyBox";
import ErrorBoundary from "./ErrorBoundary";
import Model3D from "./Model3D";

interface ModelSceneProps {
  modelUrl: string | null;
  modelBlob?: Blob | null;
  autoRotate?: boolean; // Keep for backward compatibility but default to false
  onModelError: (error: any) => void;
  isPreview?: boolean;
}

const ModelScene = ({ 
  modelUrl, 
  modelBlob, 
  autoRotate = false, // Default to false - no auto-rotation
  onModelError, 
  isPreview = false 
}: ModelSceneProps) => {
  // Track the current model source to prevent unnecessary re-renders
  const currentSourceRef = useRef<string | Blob | null>(null);
  const [stableSource, setStableSource] = useState<string | null>(modelUrl);
  const [stableBlob, setStableBlob] = useState<Blob | null>(modelBlob || null);
  const [loadKey, setLoadKey] = useState<string>(`load-${Date.now()}`);
  
  // Stabilize the source to prevent rapid changes
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

  return (
    <Canvas shadows key={loadKey}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      
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
        autoRotate={false} // Always disabled for better presentation
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
      <Environment preset="sunset" />
    </Canvas>
  );
};

export default ModelScene;
