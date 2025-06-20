
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/model-viewer/ErrorBoundary";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { intelligentModelCache } from "./IntelligentModelCache";
import { enhancedResourcePool } from "./EnhancedResourcePool";
import { AdvancedLODSystem } from "./AdvancedLODSystem";
import ModelPlaceholder from "../ModelPlaceholder";

interface OptimizedModelContentProps {
  modelUrl: string;
  modelId: string;
  isVisible: boolean;
  onError: (error: any) => void;
}

// Enhanced model content with intelligent caching and advanced LOD
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
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Load model using intelligent cache
  useEffect(() => {
    if (!isVisible || !modelUrl) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadModel = async () => {
      try {
        // Use intelligent cache with high priority for visible models
        const loadedModel = await intelligentModelCache.getModel(modelUrl, 1.0);
        
        if (!isMounted) return;
        
        setModel(loadedModel);
        setLoading(false);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to load model ${modelId}:`, err);
        }
        if (isMounted) {
          setError(err);
          setLoading(false);
          onError(err);
        }
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [modelUrl, modelId, isVisible, onError]);

  // Create LOD system when model loads
  useEffect(() => {
    if (model && !lodRef.current) {
      try {
        lodRef.current = AdvancedLODSystem.createLODFromModel(model, modelId);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to create LOD for ${modelId}, using original model:`, error);
        }
        lodRef.current = null;
      }
    }
  }, [model, modelId]);

  // Optimized animation loop with performance monitoring
  useFrame((state, delta) => {
    if (!groupRef.current || loading) return;
    
    // Store camera reference for distance calculations
    cameraRef.current = state.camera;
    
    // Update LOD based on distance
    if (lodRef.current && cameraRef.current) {
      lodRef.current.update(cameraRef.current);
    }
    
    // Smooth rotation with performance consideration
    if (groupRef.current) {
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
    if (process.env.NODE_ENV === 'development') {
      console.error(`OptimizedModelPreview error for ${fileName}:`, error);
    }
    setHasError(true);
  };

  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
  }, [modelUrl]);

  // Preload model when it comes into view (development only)
  useEffect(() => {
    if (isIntersecting && !hasError && process.env.NODE_ENV === 'development') {
      // Start preloading with medium priority
      intelligentModelCache.getModel(modelUrl, 0.7).catch(() => {
        // Ignore preload errors - they'll be handled by the actual render
      });
    }
  }, [isIntersecting, modelUrl, hasError]);

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
              debounce: 200
            }}
            style={{ pointerEvents: "none" }}
            onCreated={({ gl, scene, camera }) => {
              // Optimize renderer settings
              gl.shadowMap.enabled = false;
              gl.shadowMap.type = THREE.PCFShadowMap;
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.0;
              
              // Set up automatic garbage collection (production safe)
              if (process.env.NODE_ENV === 'development') {
                gl.setAnimationLoop(() => {
                  // Trigger cleanup periodically
                  if (Math.random() < 0.01) { // 1% chance per frame
                    gl.renderLists.dispose();
                  }
                });
              }
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
