
import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/model-viewer/ErrorBoundary";
import DummyBox from "@/components/model-viewer/DummyBox";
import LoadingSpinner from "@/components/model-viewer/LoadingSpinner";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useOptimizedModelLoader } from "@/components/model-viewer/hooks/useOptimizedModelLoader";
import { disposeModel, simplifyModelForPreview } from "@/components/model-viewer/utils/modelUtils";
import { webGLContextTracker } from "@/components/model-viewer/utils/resourceManager";
import ModelPlaceholder from "./ModelPlaceholder";

interface ModelPreviewProps {
  modelUrl: string;
  fileName: string;
}

// Function to check if URL is expired or invalid
const isUrlExpiredOrInvalid = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Check for Meshy.ai URLs with Expires parameter
    if (urlObj.hostname.includes('meshy.ai') && urlObj.searchParams.has('Expires')) {
      const expiresTimestamp = parseInt(urlObj.searchParams.get('Expires') || '0');
      const currentTimestamp = Math.floor(Date.now() / 1000);
      return expiresTimestamp < currentTimestamp;
    }
    
    return false;
  } catch (e) {
    return true; // Invalid URL
  }
};

// This component will render the actual 3D model with preview optimization
const ModelContent = ({ 
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
  
  // Clean URL from query parameters to prevent cache busting which causes reloads
  const cleanUrl = useMemo(() => {
    try {
      const url = new URL(modelUrl);
      // Remove all cache-busting parameters
      ['t', 'cb', 'cache'].forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
        }
      });
      return url.toString();
    } catch (e) {
      // If URL parsing fails, return the original
      return modelUrl;
    }
  }, [modelUrl]);

  // Check URL validity when component mounts or URL changes
  useEffect(() => {
    const checkUrl = async () => {
      console.log(`ModelContent: Checking URL validity for ${cleanUrl}`);
      
      // First check if URL is obviously expired
      if (isUrlExpiredOrInvalid(cleanUrl)) {
        console.warn(`Model URL appears to be expired: ${cleanUrl}`);
        setUrlValidated(false);
        onModelError(new Error('Model URL has expired'));
        return;
      }

      // For preview mode, we'll assume URLs are valid to avoid CORS issues
      // The actual loading will handle any accessibility problems
      console.log(`ModelContent: URL validated for ${cleanUrl}`);
      setUrlValidated(true);
    };

    if (isVisible) {
      checkUrl();
    }
  }, [cleanUrl, isVisible, onModelError]);

  const { loading, model, error } = useOptimizedModelLoader({ 
    modelSource: urlValidated === true ? cleanUrl : null,
    visible: isVisible && urlValidated === true,
    modelId: modelId,
    priority: 1, // Lower priority for previews
    onError: (err) => {
      console.error(`Error loading model ${cleanUrl}:`, err);
      onModelError(err);
    }
  });

  // Apply preview simplification to the loaded model
  useEffect(() => {
    if (model) {
      console.log(`ModelContent: Applying preview simplification for: ${cleanUrl}`);
      
      // Dispose previous processed model
      if (processedModelRef.current && processedModelRef.current !== model) {
        disposeModel(processedModelRef.current);
      }
      
      // Apply simplification for preview
      processedModelRef.current = simplifyModelForPreview(model);
    }
  }, [model, cleanUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processedModelRef.current) {
        disposeModel(processedModelRef.current);
        processedModelRef.current = null;
      }
    };
  }, []);
  
  // Show loading while validating URL
  if (urlValidated === null) {
    console.log(`ModelContent: Validating URL for ${cleanUrl}`);
    return <LoadingSpinner />;
  }
  
  // Show error state if URL is invalid/expired
  if (urlValidated === false) {
    console.log(`ModelContent: URL invalid for ${cleanUrl}`);
    return <DummyBox />;
  }
  
  if (loading) {
    console.log(`ModelContent: Loading model for ${cleanUrl}`);
    return <LoadingSpinner />;
  }
  
  if (error || !processedModelRef.current) {
    console.error(`ModelContent: Failed to load model: ${cleanUrl}`, error);
    return <DummyBox />;
  }
  
  console.log(`ModelContent: Rendering model for ${cleanUrl}`);
  return (
    <primitive object={processedModelRef.current} scale={1.5} />
  );
};

const ModelPreview: React.FC<ModelPreviewProps> = ({ modelUrl, fileName }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [contextLost, setContextLost] = useState(false);
  const { targetRef, isIntersecting, wasEverVisible } = useIntersectionObserver({
    rootMargin: '100px',
    threshold: 0.1,
    once: false
  });
  
  // Generate stable model ID that won't change between renders
  const stableModelId = useMemo(() => {
    // Create ID from URL without query params for stability
    try {
      const url = new URL(modelUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1]?.split('.')[0] || 'unknown';
      return `preview-${filename}-${url.hostname.replace(/\./g, '-')}`;
    } catch (e) {
      // Fallback for invalid URLs
      return `preview-${fileName.replace(/\W/g, '')}-${Math.abs(modelUrl.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`;
    }
  }, [modelUrl, fileName]);
  
  // Clean URL from query params for better caching
  const cleanModelUrl = useMemo(() => {
    try {
      const url = new URL(modelUrl);
      // Remove all cache-busting parameters
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
  
  // Handle errors and provide meaningful feedback
  const handleError = (error: any) => {
    console.error(`ModelPreview error for ${fileName}:`, error);
    
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

  // Handle WebGL context loss
  const handleContextLoss = () => {
    console.warn(`WebGL context lost for model preview: ${fileName}`);
    setContextLost(true);
    setHasError(true);
    setErrorMessage("WebGL context lost - too many 3D models");
  };

  // Reset error state when URL changes
  useEffect(() => {
    console.log(`ModelPreview: URL changed for ${fileName}, resetting error state`);
    setHasError(false);
    setErrorMessage("");
    setContextLost(false);
  }, [cleanModelUrl, fileName]);

  // Monitor WebGL context usage
  useEffect(() => {
    if (isIntersecting && webGLContextTracker.isNearingLimit()) {
      console.warn(`WebGL context limit approaching. Active contexts: ${webGLContextTracker.getActiveContextCount()}`);
    }
  }, [isIntersecting]);

  // If there's an error, show the placeholder with error info
  if (hasError) {
    console.log(`ModelPreview: Showing error state for ${fileName}: ${errorMessage}`);
    return (
      <div className="w-full h-full">
        <ModelPlaceholder fileName={`${fileName} (${errorMessage})`} />
      </div>
    );
  }

  // Don't render anything if context is lost
  if (contextLost) {
    console.log(`ModelPreview: Context lost for ${fileName}`);
    return (
      <div className="w-full h-full">
        <ModelPlaceholder fileName={`${fileName} (WebGL limit reached)`} />
      </div>
    );
  }

  console.log(`ModelPreview: Rendering for ${fileName}`, {
    isIntersecting,
    wasEverVisible,
    hasError,
    contextLost,
    cleanModelUrl
  });

  return (
    <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
      {(isIntersecting || wasEverVisible) ? (
        <ErrorBoundary fallback={<ModelPlaceholder fileName={fileName} />} onError={handleError}>
          <Canvas 
            id={`canvas-${stableModelId}`}
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
            dpr={[0.5, 1]} // Lower DPR for previews
            style={{pointerEvents: "none"}}
            frameloop="demand"
            onContextMenu={(e) => e.preventDefault()}
            onCreated={({ gl }) => {
              console.log(`Canvas created for ${fileName}`);
              
              // Register context creation
              webGLContextTracker.registerContext();
              
              // Handle context loss
              gl.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                handleContextLoss();
              });
              
              // Handle context restore
              gl.domElement.addEventListener('webglcontextrestored', () => {
                console.log(`WebGL context restored for: ${fileName}`);
                setContextLost(false);
                setHasError(false);
              });
            }}
          >
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} />
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            
            <Suspense fallback={<LoadingSpinner />}>
              <ModelContent 
                modelUrl={cleanModelUrl} 
                isVisible={isIntersecting || wasEverVisible}
                onModelError={handleError}
                modelId={stableModelId}
              />
            </Suspense>
            
            <OrbitControls 
              autoRotate={false}
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

export default ModelPreview;
