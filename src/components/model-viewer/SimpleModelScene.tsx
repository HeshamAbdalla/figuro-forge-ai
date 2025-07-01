
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense } from "react";
import Model3D from "./Model3D";
import DummyBox from "./DummyBox";
import ErrorBoundary from "./ErrorBoundary";
import { smartWebGLManager } from "./context/SmartWebGLManager";

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
  const [contextAvailable, setContextAvailable] = useState(false);
  const [isWaitingForContext, setIsWaitingForContext] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate model ID for context management
  const modelId = `simple-scene-${Date.now()}`;

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

  // Request WebGL context when component mounts
  useEffect(() => {
    if (!modelUrl) return;

    setIsWaitingForContext(true);
    
    const requestContext = async () => {
      try {
        const granted = await smartWebGLManager.requestContext(
          modelId,
          0.8, // High priority for full viewer
          () => {
            console.log(`[SimpleModelScene] Context granted for ${modelId}`);
            setContextAvailable(true);
            setIsWaitingForContext(false);
          },
          () => {
            console.log(`[SimpleModelScene] Context cleanup for ${modelId}`);
            setContextAvailable(false);
          }
        );

        if (!granted) {
          console.log(`[SimpleModelScene] Context request queued for ${modelId}`);
          // Will be handled by callback when context becomes available
        }
      } catch (error) {
        console.error(`[SimpleModelScene] Context request failed for ${modelId}:`, error);
        setIsWaitingForContext(false);
        onModelError(error);
      }
    };

    requestContext();

    return () => {
      smartWebGLManager.releaseContext(modelId);
    };
  }, [modelUrl, modelId, onModelError]);

  const handleModelError = (error: any) => {
    console.error("SimpleModelScene: Error in 3D model:", error);
    onModelError(error);
  };

  const handleContextLoss = () => {
    console.warn("SimpleModelScene: WebGL context lost");
    setContextAvailable(false);
    smartWebGLManager.releaseContext(modelId);
    onModelError(new Error("WebGL context lost"));
  };

  const handleContextRestore = () => {
    console.log("SimpleModelScene: WebGL context restored");
    setContextAvailable(true);
  };

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <p className="text-white/70">No model to display</p>
      </div>
    );
  }

  if (isWaitingForContext) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-figuro-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-white/70">Waiting for WebGL context...</p>
        </div>
      </div>
    );
  }

  if (!contextAvailable) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-yellow-400 text-xl">⏳</span>
          </div>
          <p className="text-yellow-400">WebGL context unavailable</p>
          <p className="text-white/50 text-sm mt-1">Too many 3D models are active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        ref={canvasRef}
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
        onCreated={({ gl }) => {
          // Handle context events
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            handleContextLoss();
          });
          
          gl.domElement.addEventListener('webglcontextrestored', () => {
            handleContextRestore();
          });
        }}
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
