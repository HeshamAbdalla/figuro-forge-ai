
import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/model-viewer/ErrorBoundary";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useOptimizedModelLoader } from "@/components/model-viewer/hooks/useOptimizedModelLoader";
import { disposeModel, simplifyModelForPreview } from "@/components/model-viewer/utils/modelUtils";
import { webGLContextTracker } from "@/components/model-viewer/utils/resourceManager";
import EnhancedGalleryLoadingView from "./EnhancedGalleryLoadingView";
import EnhancedGalleryErrorView from "./EnhancedGalleryErrorView";
import EnhancedGalleryPlaceholder from "./EnhancedGalleryPlaceholder";

interface EnhancedGalleryModelPreviewProps {
  model

: string;
  fileName: string;
}

// Enhanced model content with glass morphism and smooth animations
const EnhancedModelContent = ({ 
  modelUrl, 
  isVisible,
  onModelError,
  modelId
}: { 
  modelUrl: string; 
  isVisible: boolean;
  onModelError: (error: any) => void;
  modelId: string;
}) => {
  const [urlValidated, setUrlValidated] = useState<boolean | null>(null);
  const processedModelRef = useRef<THREE.Group | null>(null);
  
  const cleanUrl = useMemo(() => {
    try {
      const url = new URL(modelUrl);
      ['t', 'cb', 'cache'].forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
        }
      });
      return url.toString();
    } catch (e) {
      return modelUrl;
    }
  }, [modelUrl]);

  // URL validation with enhanced error handling
  useEffect(() => {
    const checkUrl = async () => {
      console.log(`EnhancedGalleryModelPreview: Checking URL validity for ${cleanUrl}`);
      
      try {
        const urlObj = new URL(cleanUrl);
        if (urlObj.hostname.includes('meshy.ai') && urlObj.searchParams.has('Expires')) {
          const expiresTimestamp = parseInt(urlObj.searchParams.get('Expires') || '0');
          const currentTimestamp = Math.floor(Date.now() / 1000);
          if (expiresTimestamp < currentTimestamp) {
            console.warn(`Model URL appears to be expired: ${cleanUrl}`);
            setUrlValidated(false);
            onModelError(new Error('Model URL has expired'));
            return;
          }
        }
        
        console.log(`EnhancedGalleryModelPreview: URL validated for ${cleanUrl}`);
        setUrlValidated(true);
      } catch (error) {
        console.error(`Invalid URL: ${cleanUrl}`, error);
        setUrlValidated(false);
        onModelError(new Error('Invalid model URL'));
      }
    };

    if (isVisible) {
      checkUrl();
    }
  }, [cleanUrl, isVisible, onModelError]);

  const { loading, model, error } = useOptimizedModelLoader({ 
    modelSource: urlValidated === true ? cleanUrl : null,
    visible: isVisible && urlValidated === true,
    modelId: modelId,
    priority: 1,
    onError: (err) => {
      console.error(`Error loading model ${cleanUrl}:`, err);
      onModelError(err);
    }
  });

  // Apply preview simplification with enhanced processing
  useEffect(() => {
    if (model) {
      console.log(`EnhancedGalleryModelPreview: Applying preview simplification for: ${cleanUrl}`);
      
      if (processedModelRef.current && processedModelRef.current !== model) {
        disposeModel(processedModelRef.current);
      }
      
      processedModelRef.current = simplifyModelForPreview(model);
    }
  }, [model, cleanUrl]);

  useEffect(() => {
    return () => {
      if (processedModelRef.current) {
        disposeModel(processedModelRef.current);
        processedModelRef.current = null;
      }
    };
  }, []);
  
  if (urlValidated === null) {
    return <EnhancedGalleryLoadingView progress={10} loadingStage="downloading" />;
  }
  
  if (urlValidated === false) {
    return <EnhancedGalleryErrorView 
      errorMessage="URL validation failed" 
      displayModelUrl={cleanUrl}
    />;
  }
  
  if (loading) {
    return <EnhancedGalleryLoadingView progress={60} loadingStage="processing" />;
  }
  
  if (error || !processedModelRef.current) {
    return <EnhancedGalleryErrorView 
      errorMessage={error?.message || "Failed to load model"} 
      displayModelUrl={cleanUrl}
    />;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full"
    >
      <primitive object={processedModelRef.current} scale={1.5} />
    </motion.div>
  );
};

const EnhancedGalleryModelPreview: React.FC<EnhancedGalleryModelPreviewProps> = ({ 
  modelUrl, 
  fileName 
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [contextLost, setContextLost] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { targetRef, isIntersecting, wasEverVisible } = useIntersectionObserver({
    rootMargin: '100px',
    threshold: 0.1,
    once: false
  });
  
  const stableModelId = useMemo(() => {
    try {
      const url = new URL(modelUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1]?.split('.')[0] || 'unknown';
      return `enhanced-gallery-${filename}-${url.hostname.replace(/\./g, '-')}`;
    } catch (e) {
      return `enhanced-gallery-${fileName.replace(/\W/g, '')}-${Math.abs(modelUrl.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`;
    }
  }, [modelUrl, fileName]);
  
  const cleanModelUrl = useMemo(() => {
    try {
      const url = new URL(modelUrl);
      ['t', 'cb', 'cache'].forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
        }
      });
      return url.toString();
    } catch (e) {
      return modelUrl;
    }
  }, [modelUrl]);
  
  const handleError = (error: any) => {
    console.error(`EnhancedGalleryModelPreview error for ${fileName}:`, error);
    
    let message = "Model failed to load";
    if (error.message) {
      if (error.message.includes('expired')) {
        message = "Model URL has expired";
      } else if (error.message.includes('not accessible')) {
        message = "Model is not accessible";
      } else if (error.message.includes('CORS')) {
        message = "Model blocked by CORS policy";
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        message = "Model file not found";
      } else if (error.message.includes('context')) {
        message = "WebGL context error";
        setContextLost(true);
      }
    }
    
    setErrorMessage(message);
    setHasError(true);
  };

  const handleContextLoss = () => {
    console.warn(`WebGL context lost for enhanced gallery model preview: ${fileName}`);
    setContextLost(true);
    setHasError(true);
    setErrorMessage("WebGL context lost - too many 3D models");
  };

  useEffect(() => {
    console.log(`EnhancedGalleryModelPreview: URL changed for ${fileName}, resetting error state`);
    setHasError(false);
    setErrorMessage("");
    setContextLost(false);
  }, [cleanModelUrl, fileName]);

  useEffect(() => {
    if (isIntersecting && webGLContextTracker.isNearingLimit()) {
      console.warn(`WebGL context limit approaching. Active contexts: ${webGLContextTracker.getActiveContextCount()}`);
    }
  }, [isIntersecting]);

  if (hasError) {
    return (
      <div className="w-full h-full">
        <EnhancedGalleryErrorView 
          errorMessage={errorMessage} 
          displayModelUrl={cleanModelUrl}
        />
      </div>
    );
  }

  if (contextLost) {
    return (
      <div className="w-full h-full">
        <EnhancedGalleryPlaceholder 
          fileName={fileName} 
          message="WebGL limit reached"
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full relative"
      ref={targetRef as React.RefObject<HTMLDivElement>}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glass morphism overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 backdrop-blur-sm rounded-lg pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      
      {(isIntersecting || wasEverVisible) ? (
        <ErrorBoundary 
          fallback={<EnhancedGalleryPlaceholder fileName={fileName} />} 
          onError={handleError}
        >
          <Canvas 
            id={`enhanced-canvas-${stableModelId}`}
            shadows 
            gl={{ 
              powerPreference: "low-power",
              antialias: false,
              depth: true,
              stencil: false,
              alpha: true,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: true
            }}
            dpr={[0.5, 1]}
            style={{ pointerEvents: "none" }}
            frameloop="demand"
            onContextMenu={(e) => e.preventDefault()}
            onCreated={({ gl }) => {
              console.log(`Enhanced Canvas created for ${fileName}`);
              
              webGLContextTracker.registerContext();
              
              gl.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                handleContextLoss();
              });
              
              gl.domElement.addEventListener('webglcontextrestored', () => {
                console.log(`WebGL context restored for: ${fileName}`);
                setContextLost(false);
                setHasError(false);
              });
            }}
          >
            {/* Enhanced background with gradient */}
            <color attach="background" args={['#0f0f0f']} />
            
            {/* Improved lighting setup - no HDR environment */}
            <ambientLight intensity={0.3} color="#ffffff" />
            <directionalLight 
              position={[3, 3, 3]} 
              intensity={0.5}
              color="#ffffff"
              castShadow={false}
            />
            <directionalLight 
              position={[-2, 2, -2]} 
              intensity={0.3}
              color="#4f46e5"
              castShadow={false}
            />
            
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            
            <Suspense fallback={<EnhancedGalleryLoadingView progress={90} loadingStage="finalizing" />}>
              <EnhancedModelContent 
                modelUrl={cleanModelUrl} 
                isVisible={isIntersecting || wasEverVisible}
                onModelError={handleError}
                modelId={stableModelId}
              />
            </Suspense>
            
            <OrbitControls 
              autoRotate={false}
              autoRotateSpeed={0.3}
              enablePan={false}
              enableZoom={false}
              enableRotate={false}
            />
          </Canvas>
        </ErrorBoundary>
      ) : (
        <EnhancedGalleryPlaceholder fileName={fileName} />
      )}
      
      {/* Enhanced border glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.1), transparent)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: isHovered ? ['0% 0%', '100% 100%'] : '0% 0%',
        }}
        transition={{ duration: 2, repeat: isHovered ? Infinity : 0, repeatType: 'reverse' }}
      />
    </motion.div>
  );
};

export default EnhancedGalleryModelPreview;
