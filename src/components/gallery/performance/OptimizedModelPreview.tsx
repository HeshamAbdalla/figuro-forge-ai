
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/model-viewer/ErrorBoundary";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useOptimizedModelLoader } from "@/components/model-viewer/hooks/useOptimizedModelLoader";
import { sharedResourcePool } from "./SharedResourcePool";
import ModelPlaceholder from "../ModelPlaceholder";

interface OptimizedModelContentProps {
  modelUrl: string;
  modelId: string;
  isVisible: boolean;
  onError: (error: any) => void;
}

// Optimized model content with useFrame for smooth performance
const OptimizedModelContent: React.FC<OptimizedModelContentProps> = ({
  modelUrl,
  modelId,
  isVisible,
  onError
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const rotationSpeed = useRef(0.5);
  
  const { loading, model, error } = useOptimizedModelLoader({
    modelSource: isVisible ? modelUrl : null,
    visible: isVisible,
    modelId: modelId,
    priority: 1,
    onError: onError
  });

  // Use useFrame for smooth rotation instead of state updates
  useFrame((state, delta) => {
    if (groupRef.current && !loading && model) {
      groupRef.current.rotation.y += rotationSpeed.current * delta;
      
      // Smooth rotation speed variation
      rotationSpeed.current = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  if (loading) {
    return (
      <mesh position={[0, 0, 0]}>
        <primitive object={sharedResourcePool.getSharedGeometry('box')} />
        <primitive object={sharedResourcePool.getOrCreateMaterial({ type: 'basic', color: '#404040' })} />
      </mesh>
    );
  }

  if (error || !model) {
    return (
      <mesh position={[0, 0, 0]}>
        <primitive object={sharedResourcePool.getSharedGeometry('box')} />
        <primitive object={sharedResourcePool.getOrCreateMaterial({ type: 'basic', color: '#ff4444' })} />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <Center scale={1.2}>
        <primitive object={model} />
      </Center>
    </group>
  );
};

interface OptimizedModelPreviewProps {
  modelUrl: string;
  fileName: string;
}

const OptimizedModelPreview: React.FC<OptimizedModelPreviewProps> = ({
  modelUrl,
  fileName
}) => {
  const [hasError, setHasError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '100px',
    threshold: 0.1,
    once: false // Allow re-triggering for better resource management
  });

  // Generate stable model ID
  const modelId = useMemo(() => {
    try {
      const url = new URL(modelUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1]?.split('.')[0] || 'unknown';
      return `optimized-${filename}-${url.hostname.replace(/\./g, '-')}`;
    } catch (e) {
      return `optimized-${fileName.replace(/\W/g, '')}-${Math.abs(modelUrl.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`;
    }
  }, [modelUrl, fileName]);

  const handleError = (error: any) => {
    console.error(`OptimizedModelPreview error for ${fileName}:`, error);
    setHasError(true);
  };

  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
  }, [modelUrl]);

  if (hasError) {
    return (
      <div className="w-full h-full">
        <ModelPlaceholder fileName={`${fileName} (Error)`} />
      </div>
    );
  }

  return (
    <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
      {isIntersecting ? (
        <ErrorBoundary fallback={<ModelPlaceholder fileName={fileName} />} onError={handleError}>
          <Canvas
            ref={canvasRef}
            gl={{
              powerPreference: "low-power",
              antialias: false,
              alpha: true,
              depth: true,
              stencil: false,
              preserveDrawingBuffer: false
            }}
            dpr={[0.5, 1]}
            frameloop="demand"
            performance={{ min: 0.2, max: 1, debounce: 200 }}
            style={{ pointerEvents: "none" }}
          >
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[2, 2, 2]} intensity={0.6} />
            
            <OptimizedModelContent
              modelUrl={modelUrl}
              modelId={modelId}
              isVisible={isIntersecting}
              onError={handleError}
            />
            
            <Environment preset="city" resolution={64} />
          </Canvas>
        </ErrorBoundary>
      ) : (
        <ModelPlaceholder fileName={fileName} />
      )}
    </div>
  );
};

export default OptimizedModelPreview;
