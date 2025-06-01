
import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/model-viewer/ErrorBoundary";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ModelLoader } from "./ModelLoader";
import ModelPlaceholder from "./ModelPlaceholder";

interface ModelContentProps {
  modelUrl: string;
  onError: (error: Error) => void;
}

const ModelContent: React.FC<ModelContentProps> = ({ modelUrl, onError }) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadModel = async () => {
      try {
        setLoading(true);
        setModel(null);
        
        console.log(`ModelContent: Loading model: ${modelUrl}`);
        
        const loadedModel = await ModelLoader.loadModel(modelUrl, {
          onError: (error) => {
            console.error('ModelContent: ModelLoader error:', error);
            if (isMounted) {
              onError(error);
            }
          }
        });
        
        if (isMounted) {
          console.log('ModelContent: Model loaded successfully');
          setModel(loadedModel);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('ModelContent: Model loading failed:', error);
          onError(error as Error);
          setLoading(false);
        }
      }
    };
    
    if (modelUrl) {
      loadModel();
    } else {
      setLoading(false);
      onError(new Error('No model URL provided'));
    }
    
    return () => {
      isMounted = false;
    };
  }, [modelUrl, onError]);
  
  if (loading) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#404040" wireframe />
      </mesh>
    );
  }
  
  if (!model) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
    );
  }
  
  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
};

interface SimpleModelPreviewProps {
  modelUrl: string;
  fileName: string;
  modelId?: string;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

const SimpleModelPreview: React.FC<SimpleModelPreviewProps> = ({ 
  modelUrl, 
  fileName, 
  modelId,
  onError,
  onSuccess
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '100px',
    threshold: 0.1,
    once: false
  });
  
  const handleError = (error: Error) => {
    console.error(`SimpleModelPreview error for ${fileName}:`, error);
    setHasError(true);
    setErrorMessage(error.message || "Failed to load model");
    
    // Call external error handler if provided
    if (onError) {
      onError(error);
    }
  };

  const handleSuccess = () => {
    console.log(`SimpleModelPreview: Model loaded successfully for ${fileName}`);
    if (onSuccess) {
      onSuccess();
    }
  };
  
  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage("");
  }, [modelUrl]);
  
  if (hasError) {
    return (
      <div className="w-full h-full">
        <ModelPlaceholder fileName={`${fileName} (${errorMessage})`} />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
      {isIntersecting ? (
        <ErrorBoundary 
          fallback={<ModelPlaceholder fileName={fileName} />} 
          onError={handleError}
        >
          <Canvas
            shadows={false}
            gl={{
              powerPreference: "low-power",
              antialias: false,
              alpha: true,
              preserveDrawingBuffer: false
            }}
            dpr={[0.5, 1]}
            frameloop="demand"
            style={{ pointerEvents: "none" }}
          >
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <PerspectiveCamera makeDefault position={[0, 0, 4]} />
            
            <Suspense fallback={null}>
              <ModelContent
                modelUrl={modelUrl}
                onError={handleError}
              />
            </Suspense>
            
            <OrbitControls
              autoRotate={true}
              autoRotateSpeed={0.5}
              enablePan={false}
              enableZoom={false}
              enableRotate={false}
            />
            <Environment preset="sunset" />
          </Canvas>
        </ErrorBoundary>
      ) : (
        <ModelPlaceholder fileName={fileName} />
      )}
    </div>
  );
};

export default SimpleModelPreview;
