
import React, { useState, useEffect, useMemo } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import SimpleModelPreview from "../SimpleModelPreview";
import ModelPlaceholder from "../ModelPlaceholder";

interface SimplifiedModelPreviewProps {
  modelUrl: string;
  fileName: string;
}

const SimplifiedModelPreview: React.FC<SimplifiedModelPreviewProps> = ({
  modelUrl,
  fileName
}) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [shouldShowPreview, setShouldShowPreview] = useState(false);
  
  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1,
    once: false
  });

  // Generate stable model ID
  const modelId = useMemo(() => {
    try {
      const url = new URL(modelUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1]?.split('.')[0] || 'unknown';
      const hostHash = url.hostname.replace(/\./g, '-');
      return `simplified-${filename}-${hostHash}`;
    } catch (e) {
      const urlHash = Math.abs(modelUrl.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
      return `simplified-${fileName.replace(/\W/g, '')}-${urlHash}`;
    }
  }, [modelUrl, fileName]);

  const handleError = (error: any) => {
    console.error(`SimplifiedModelPreview error for ${fileName}:`, error);
    
    // Provide more specific error messages
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
      } else if (error.message.includes('invalid') || error.message.includes('empty')) {
        message = "Invalid model";
      }
    }
    
    setErrorMessage(message);
    setHasError(true);
  };

  // Reset error state when URL changes
  useEffect(() => {
    console.log(`SimplifiedModelPreview: URL changed for ${fileName}, resetting state`);
    setHasError(false);
    setErrorMessage("");
    setShouldShowPreview(false);
  }, [modelUrl, fileName]);

  // Show preview when intersecting with debouncing
  useEffect(() => {
    if (isIntersecting && !hasError && modelUrl) {
      console.log(`SimplifiedModelPreview: Starting preview for ${fileName}`);
      const timer = setTimeout(() => {
        setShouldShowPreview(true);
      }, 100); // Reduced delay for better responsiveness
      return () => clearTimeout(timer);
    } else if (!isIntersecting) {
      setShouldShowPreview(false);
    }
  }, [isIntersecting, hasError, fileName, modelUrl]);

  // Don't render preview if no model URL
  if (!modelUrl) {
    console.log(`SimplifiedModelPreview: No model URL for ${fileName}`);
    return (
      <div className="w-full h-full">
        <ModelPlaceholder fileName={`${fileName} (No 3D Model)`} />
      </div>
    );
  }

  if (hasError) {
    console.log(`SimplifiedModelPreview: Showing error state for ${fileName}: ${errorMessage}`);
    return (
      <div className="w-full h-full">
        <ModelPlaceholder fileName={`${fileName} (${errorMessage})`} />
      </div>
    );
  }

  console.log(`SimplifiedModelPreview: Render state for ${fileName}:`, {
    isIntersecting,
    shouldShowPreview,
    hasError,
    hasModelUrl: !!modelUrl
  });

  return (
    <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
      {shouldShowPreview ? (
        <SimpleModelPreview
          modelUrl={modelUrl}
          fileName={fileName}
          onError={handleError}
        />
      ) : (
        <ModelPlaceholder fileName={fileName} />
      )}
    </div>
  );
};

export default SimplifiedModelPreview;
