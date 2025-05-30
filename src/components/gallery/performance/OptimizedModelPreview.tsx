
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/model-viewer/ErrorBoundary";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useOptimizedModelLoader } from "@/components/model-viewer/hooks/useOptimizedModelLoader";
import { enhancedResourcePool } from "./EnhancedResourcePool";
import { AdvancedLODSystem } from "./AdvancedLODSystem";
import ModelPlaceholder from "../ModelPlaceholder";

interface OptimizedModelContentProps {
  modelUrl: string;
  modelId: string;
  isVisible: boolean;
  onError: (error: any) => void;
}

// Enhanced model content with advanced LOD and performance optimizations
const OptimizedModelContent: React.FC<OptimizedModelContentProps> = ({
  modelUrl,
  modelId,
  isVisible,
  onError
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const lodRef = useRef<THREE.LOD | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rotationSpeed = useRef(0.5);
  const [currentDistance, setCurrentDistance] = useState(0);
  
  const { loading, model, error } = useOptimizedModelLoader({
    modelSource: isVisible ? modelUrl : null,
    visible: isVisible,
    modelId: modelId,
    priority: 1,
    onError: onError
  });

  // Create LOD system when model loads
  useEffect(() => {
    if (model && !lodRef.current) {
      console.log(`Creating LOD system for ${modelId}`);
      try {
        lodRef.current = AdvancedLODSystem.createLODFromModel(model, modelId);
      } catch (error) {
        console.warn(`Failed to create LOD for ${modelId}, using original model:`, error);
        lodRef.current = null;
      }
    }
  }, [model, modelId]);

  // Optimized animation loop with performance monitoring
  useFrame((state, delta) => {
    if (!groupRef.current || loading) return;
    
    // Store camera reference for distance calculations
    cameraRef.current = state.camera;
    
    // Calculate distance from camera for LOD
    if (lodRef.current && cameraRef.current) {
      const distance = groupRef.current.position.distanceTo(cameraRef.current.position);
      setCurrentDistance(distance);
      
      // Update LOD based on distance
      lodRef.current.update(cameraRef.current);
    }
    
    // Smooth rotation with performance consideration
    if (groupRef.current) {
      // Use requestAnimationFrame-friendly rotation
      const targetSpeed = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      rotationSpeed.current = THREE.MathUtils.lerp(rotationSpeed.current, targetSpeed, delta * 2);
      
      groupRef.current.rotation.y += rotationSpeed.current * delta;
    }
  });

  // Cleanup LOD on unmount
  useEffect(() => {
    return () => {
      if (lodRef.current) {
        lodRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
        lodRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <mesh position={[0, 0, 0]}>
        <primitive object={enhancedResourcePool.getSharedGeometry('box')} />
        <primitive object={enhancedResourcePool.getOrCreateMaterial({ type: 'basic', color: '#404040' })} />
      </mesh>
    );
  }

  if (error || (!model && !lodRef.current)) {
    return (
      <mesh position={[0, 0, 0]}>
        <primitive object={enhancedResourcePool.getSharedGeometry('box')} />
        <primitive object={enhancedResourcePool.getOrCreateMaterial({ type: 'basic', color: '#ff4444' })} />
      </mesh>
    );
  }

  const displayModel = lodRef.current || model;

  return (
    <group ref={groupRef}>
      <Center scale={1.2}>
        {displayModel && <primitive object={displayModel} />}
      </Center>
      
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={[0, 2, 0]} visible={false}>
          <planeGeometry args={[1, 0.2]} />
          <meshBasicMaterial color="white" transparent opacity={0.8} />
        </mesh>
      )}
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
    once: false
  });

  // Generate stable model ID with enhanced hashing
  const modelId = useMemo(() => {
    try {
      const url = new URL(modelUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1]?.split('.')[0] || 'unknown';
      const hostHash = url.hostname.replace(/\./g, '-');
      return `optimized-${filename}-${hostHash}`;
    } catch (e) {
      const urlHash = Math.abs(modelUrl.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
      return `optimized-${fileName.replace(/\W/g, '')}-${urlHash}`;
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
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: true
            }}
            dpr={[0.5, 1]}
            frameloop="demand"
            performance={{ 
              min: 0.2, 
              max: 1, 
              debounce: 200,
              regress: () => {
                // Automatic quality regression under heavy load
                return 0.5;
              }
            }}
            style={{ pointerEvents: "none" }}
            onCreated={({ gl, scene, camera }) => {
              // Optimize renderer settings
              gl.shadowMap.enabled = false;
              gl.shadowMap.type = THREE.PCFShadowMap;
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.0;
              
              // Set up automatic garbage collection
              gl.setAnimationLoop(() => {
                // Trigger cleanup periodically
                if (Math.random() < 0.01) { // 1% chance per frame
                  gl.renderLists.dispose();
                }
              });
            }}
          >
            <color attach="background" args={['#1a1a1a']} />
            
            {/* Optimized lighting setup */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[2, 2, 2]} 
              intensity={0.6}
              castShadow={false}
            />
            
            <OptimizedModelContent
              modelUrl={modelUrl}
              modelId={modelId}
              isVisible={isIntersecting}
              onError={handleError}
            />
            
            <Environment 
              preset="city" 
              resolution={64}
              background={false}
            />
          </Canvas>
        </ErrorBoundary>
      ) : (
        <ModelPlaceholder fileName={fileName} />
      )}
    </div>
  );
};

export default OptimizedModelPreview;
