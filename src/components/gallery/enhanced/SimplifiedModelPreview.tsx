
import React, { useState, useEffect, useMemo } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import SimpleModelPreview from "../SimpleModelPreview";
import ModelPlaceholder from "../ModelPlaceholder";
import ModelErrorHandler from "./ModelErrorHandler";
import { validateAndCleanUrl } from "@/utils/urlValidationUtils";
import { logModelDebugInfo } from "@/utils/modelDebugUtils";

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
  const [retryCount, setRetryCount] = useState(0);
  
  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1,
    once: false
  });

  // Validate URL and generate stable model ID
  const { validatedUrl, modelId } = useMemo(() => {
    const validation = validateAndCleanUrl(modelUrl);
    
    // Generate stable model ID
    let id: string;
    try {
      const url = new URL(validation.cleanUrl || modelUrl);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1]?.split('.')[0] || 'unknown';
      const hostHash = url.hostname.replace(/\./g, '-');
      id = `simplified-${filename}-${hostHash}`;
    } catch (e) {
      const urlHash = Math.abs((validation.cleanUrl || modelUrl).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
      id = `simplified-${fileName.replace(/\W/g, '')}-${urlHash}`;
    }
    
    return {
      validatedUrl: validation,
      modelId: id
    };
  }, [modelUrl, fileName]);

  const handleError = (error: any) => {
    console.error(`SimplifiedModelPreview error for ${fileName}:`, error);
    
    // Log debug info for troubleshooting
    if (modelUrl) {
      logModelDebugInfo({
        id: modelId,
        title: fileName,
        model_url: modelUrl,
        style: '',
        image_url: '',
        saved_image_url: null,
        prompt: '',
        created_at: new Date().toISOString(),
        is_public: false
      });
    }
    
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

  const handleRetry = () => {
    console.log(`SimplifiedModelPreview: Retrying load for ${fileName}`);
    setHasError(false);
    setErrorMessage("");
    setShouldShowPreview(false);
    setRetryCount(prev => prev + 1);
    
    // Force re-render by toggling preview state
    setTimeout(() => {
      setShouldShowPreview(true);
    }, 100);
  };

  // Reset error state when URL changes
  useEffect(() => {
    console.log(`SimplifiedModelPreview: URL changed for ${fileName}, resetting state`);
    setHasError(false);
    setErrorMessage("");
    setShouldShowPreview(false);
    setRetryCount(0);
  }, [modelUrl, fileName]);

  // Validate URL on mount and when it changes
  useEffect(() => {
    if (!validatedUrl.isValid) {
      console.warn(`SimplifiedModelPreview: Invalid URL for ${fileName}:`, validatedUrl.error);
      setErrorMessage(validatedUrl.error || "Invalid URL");
      setHasError(true);
      return;
    }
  }, [validatedUrl, fileName]);

  // Show preview when intersecting with debouncing
  useEffect(() => {
    if (isIntersecting && !hasError && validatedUrl.isValid) {
      console.log(`SimplifiedModelPreview: Starting preview for ${fileName}`);
      const timer = setTimeout(() => {
        setShouldShowPreview(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isIntersecting) {
      setShouldShowPreview(false);
    }
  }, [isIntersecting, hasError, fileName, validatedUrl.isValid]);

  // Don't render preview if no model URL or invalid URL
  if (!modelUrl || !validatedUrl.isValid) {
    const errorMsg = !modelUrl ? "No 3D Model" : (validatedUrl.error || "Invalid URL");
    console.log(`SimplifiedModelPreview: ${errorMsg} for ${fileName}`);
    return (
      <div className="w-full h-full">
        <ModelErrorHandler
          error={errorMsg}
          fileName={fileName}
          onRetry={validatedUrl.error?.includes('network') ? handleRetry : undefined}
          modelUrl={modelUrl}
        />
      </div>
    );
  }

  if (hasError) {
    console.log(`SimplifiedModelPreview: Showing error state for ${fileName}: ${errorMessage}`);
    return (
      <div className="w-full h-full">
        <ModelErrorHandler
          error={errorMessage}
          fileName={fileName}
          onRetry={errorMessage.includes('network') ? handleRetry : undefined}
          modelUrl={modelUrl}
        />
      </div>
    );
  }

  console.log(`SimplifiedModelPreview: Render state for ${fileName}:`, {
    isIntersecting,
    shouldShowPreview,
    hasError,
    hasValidUrl: validatedUrl.isValid,
    retryCount
  });

  return (
    <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
      {shouldShowPreview ? (
        <SimpleModelPreview
          key={`${modelId}-${retryCount}`}
          modelUrl={validatedUrl.cleanUrl}
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
