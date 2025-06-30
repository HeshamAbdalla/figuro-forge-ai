
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense } from "react";
import Model3D from "./Model3D";
import DummyBox from "./DummyBox";
import ErrorBoundary from "./ErrorBoundary";

interface SimpleModelSceneProps {
  modelUrl: string | null;
  autoRotate?: boolean;
  onModelError: (error: any) => void;
}

export interface SimpleModelSceneRef {
  resetCamera: () => void;
}

const SimpleModelScene = forwardRef<SimpleModelSceneRef, SimpleModelSceneProps>(({ 
  modelUrl, 
  autoRotate = true,
  onModelError
}, ref) => {
  const orbitControlsRef = useRef<any>(null);
  const [loadKey, setLoadKey] = useState<string>(`load-${Date.now()}`);

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.reset();
      }
    }
  }));

  // Update load key when URL changes to force re-render
  useEffect(() => {
    if (modelUrl) {
      setLoadKey(`load-${Date.now()}`);
    }
  }, [modelUrl]);

  const handleModelError = (error: any) => {
    console.error("SimpleModelScene: Error in 3D model:", error);
    onModelError(error);
  };

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <p className="text-white/70">No model to display</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        key={loadKey}
        shadows={false}
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          alpha: true,
          depth: true,
          stencil: false,
          preserveDrawingBuffer: false
        }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <color attach="background" args={['#1a1a1a']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow={false}
        />
        
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 5]}
          near={0.1}
          far={1000}
        />
        
        <Suspense fallback={<DummyBox />}>
          <ErrorBoundary 
            fallback={<DummyBox />} 
            onError={handleModelError}
          >
            <Model3D 
              modelSource={modelUrl} 
              onError={handleModelError}
              isPreview={false}
            />
          </ErrorBoundary>
        </Suspense>
        
        <OrbitControls 
          ref={orbitControlsRef}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          maxDistance={100}
          minDistance={1}
        />
        
        <Environment preset="sunset" resolution={256} />
      </Canvas>
    </div>
  );
});

SimpleModelScene.displayName = "SimpleModelScene";

export default SimpleModelScene;
