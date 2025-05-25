
import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { ErrorBoundary } from "@/components/model-viewer/ErrorBoundary";
import DummyBox from "@/components/model-viewer/DummyBox";
import LoadingSpinner from "@/components/model-viewer/LoadingSpinner";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useOptimizedModelLoader } from "@/components/model-viewer/hooks/useOptimizedModelLoader";
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

// Function to validate URL accessibility
const validateUrlAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch (error) {
    console.warn(`URL validation failed for ${url}:`, error);
    return false;
  }
};

// This component will render the actual 3D model
const ModelContent = ({ 
  modelUrl, 
  isVisible,
  onModelError 
}: { 
  modelUrl: string; 
  isVisible: boolean;
  onModelError: (error: any) => void;
}) => {
  const [urlValidated, setUrlValidated] = useState<boolean | null>(null);
  
  // Create a stable ID based on the URL to prevent reloads
  const modelIdRef = useRef(`preview-${modelUrl.split('/').pop()?.split('?')[0]}-${Math.random().toString(36).substring(2, 9)}`);
  
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
      // First check if URL is obviously expired
      if (isUrlExpiredOrInvalid(cleanUrl)) {
        console.warn(`Model URL appears to be expired: ${cleanUrl}`);
        setUrlValidated(false);
        onModelError(new Error('Model URL has expired'));
        return;
      }

      // Then validate accessibility
      const isAccessible = await validateUrlAccessibility(cleanUrl);
      setUrlValidated(isAccessible);
      
      if (!isAccessible) {
        onModelError(new Error('Model URL is not accessible'));
      }
    };

    if (isVisible) {
      checkUrl();
    }
  }, [cleanUrl, isVisible, onModelError]);

  const { loading, model, error } = useOptimizedModelLoader({ 
    modelSource: urlValidated === true ? cleanUrl : null,
    visible: isVisible && urlValidated === true,
    modelId: modelIdRef.current,
    onError: (err) => {
      console.error(`Error loading model ${cleanUrl}:`, err);
      onModelError(err);
    }
  });
  
  // Show loading while validating URL
  if (urlValidated === null) {
    return <LoadingSpinner />;
  }
  
  // Show error state if URL is invalid/expired
  if (urlValidated === false) {
    return <DummyBox />;
  }
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error || !model) {
    console.error(`Failed to load model: ${cleanUrl}`, error);
    return <DummyBox />;
  }
  
  return (
    <primitive object={model} scale={1.5} />
  );
};

const ModelPreview: React.FC<ModelPreviewProps> = ({ modelUrl, fileName }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { targetRef, isIntersecting, wasEverVisible } = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1,
    once: true
  });
  
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
      }
    }
    
    setErrorMessage(message);
    setHasError(true);
  };

  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage("");
  }, [cleanModelUrl]);

  // If there's an error, show the placeholder with error info
  if (hasError) {
    return (
      <div className="w-full h-full">
        <ModelPlaceholder fileName={`${fileName} (${errorMessage})`} />
      </div>
    );
  }

  // Create unique ID for this preview canvas to avoid conflicts
  const canvasId = useRef(`canvas-${fileName.replace(/\W/g, '')}-${Math.random().toString(36).substring(2, 10)}`);

  return (
    <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
      {(isIntersecting || wasEverVisible) ? (
        <ErrorBoundary fallback={<ModelPlaceholder fileName={fileName} />} onError={handleError}>
          <Canvas 
            id={canvasId.current}
            shadows 
            gl={{ 
              powerPreference: "low-power",
              antialias: false,
              depth: true,
              stencil: false,
              alpha: true
            }}
            dpr={[0.8, 1]}
            style={{pointerEvents: "none"}}
            frameloop="demand"
          >
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            
            <Suspense fallback={<LoadingSpinner />}>
              <ModelContent 
                modelUrl={cleanModelUrl} 
                isVisible={isIntersecting || wasEverVisible}
                onModelError={handleError}
              />
            </Suspense>
            
            <OrbitControls 
              autoRotate={isIntersecting}
              autoRotateSpeed={1.5}
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
