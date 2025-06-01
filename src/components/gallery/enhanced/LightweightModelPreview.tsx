
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { validateAndCleanUrl } from "@/utils/urlValidationUtils";
import ModelPlaceholder from "../ModelPlaceholder";

interface LightweightModelPreviewProps {
  modelUrl: string;
  fileName: string;
}

const LightweightModelPreview: React.FC<LightweightModelPreviewProps> = ({
  modelUrl,
  fileName
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1,
    once: false
  });

  // Validate URL and generate stable model ID
  const { validatedUrl, modelId } = useMemo(() => {
    const validation = validateAndCleanUrl(modelUrl);
    
    let id: string;
    try {
      const url = new URL(validation.cleanUrl || modelUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1]?.split('.')[0] || 'unknown';
      const hostHash = url.hostname.replace(/\./g, '-');
      id = `lightweight-${filename}-${hostHash}`;
    } catch (e) {
      const urlHash = Math.abs((validation.cleanUrl || modelUrl).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
      id = `lightweight-${fileName.replace(/\W/g, '')}-${urlHash}`;
    }
    
    return {
      validatedUrl: validation,
      modelId: id
    };
  }, [modelUrl, fileName]);

  const handleError = (error: any) => {
    console.error(`LightweightModelPreview error for ${fileName}:`, error);
    
    let message = "Model failed to load";
    if (error?.message) {
      if (error.message.includes('expired')) {
        message = "Model URL expired";
      } else if (error.message.includes('not accessible')) {
        message = "Model not accessible";
      } else if (error.message.includes('CORS')) {
        message = "Access blocked";
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        message = "Model not found";
      } else if (error.message.includes('network')) {
        message = "Network error";
      }
    }
    
    setErrorMessage(message);
    setHasError(true);
  };

  // Load model only when intersecting
  useEffect(() => {
    if (!isIntersecting || !validatedUrl.isValid || hasError) {
      return;
    }

    let isMounted = true;

    const loadModel = async () => {
      try {
        console.log(`LightweightModelPreview: Loading model for ${fileName}`);
        
        // Dynamic import to reduce initial bundle size
        const [{ Canvas }, { OrbitControls, Environment }, { GLTFLoader }] = await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei'),
          import('three/examples/jsm/loaders/GLTFLoader.js')
        ]);

        if (!isMounted) return;

        const loader = new GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            validatedUrl.cleanUrl,
            resolve,
            undefined,
            reject
          );
        });

        if (!isMounted) return;

        console.log(`LightweightModelPreview: Model loaded successfully for ${fileName}`);
        setIsLoaded(true);
        
        // Store scene for cleanup
        sceneRef.current = gltf.scene;
        
      } catch (error) {
        if (isMounted) {
          handleError(error);
        }
      }
    };

    loadModel();

    return () => {
      isMounted = false;
    };
  }, [isIntersecting, validatedUrl.isValid, validatedUrl.cleanUrl, fileName, hasError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage("");
    setIsLoaded(false);
  }, [modelUrl]);

  if (!modelUrl || !validatedUrl.isValid) {
    const errorMsg = !modelUrl ? "No 3D Model" : (validatedUrl.error || "Invalid URL");
    return (
      <div className="w-full h-full">
        <ModelPlaceholder fileName={`${fileName} (${errorMsg})`} />
      </div>
    );
  }

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
        isLoaded ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ background: '#1a1a1a' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800/50">
            <div className="text-center text-white/50">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs">Loading...</p>
            </div>
          </div>
        )
      ) : (
        <ModelPlaceholder fileName={fileName} />
      )}
    </div>
  );
};

export default LightweightModelPreview;
