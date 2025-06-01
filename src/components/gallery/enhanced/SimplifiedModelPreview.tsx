
import React, { useState, useEffect, useMemo } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import SimpleModelPreview from "../SimpleModelPreview";
import ModelPlaceholder from "../ModelPlaceholder";
import ModelErrorHandler from "./ModelErrorHandler";
import { validateAndCleanUrl, generateStableModelId } from "@/utils/urlValidationUtils";
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
  const [lastError, setLastError] = useState<Error | null>(null);
  
  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1,
    once: false
  });

  // Validate URL and generate stable model ID
  const { validatedUrl, modelId } = useMemo(() => {
    const validation = validateAndCleanUrl(modelUrl);
    const id = generateStableModelId(modelUrl, fileName);
    
    logModelDebugInfo(id, modelUrl, fileName, 'source_change', {
      isValid: validation.isValid,
      isExpired: validation.isExpired,
      cleanUrl: validation.cleanUrl
    });
    
    return {
      validatedUrl: validation.isValid ? validation.cleanUrl : null,
      modelId: id
    };
  }, [modelUrl, fileName]);

  // Handle intersection changes
  useEffect(() => {
    if (isIntersecting && validatedUrl && !hasError) {
      setShouldShowPreview(true);
      logModelDebugInfo(modelId, modelUrl, fileName, 'load_start', {
        isIntersecting,
        retryCount
      });
    } else {
      setShouldShowPreview(false);
    }
  }, [isIntersecting, validatedUrl, hasError, modelId, modelUrl, fileName, retryCount]);

  // Handle URL validation errors
  useEffect(() => {
    if (!validatedUrl) {
      const validation = validateAndCleanUrl(modelUrl);
      if (!validation.isValid) {
        setHasError(true);
        setErrorMessage(validation.error || 'Invalid URL');
        const error = new Error(validation.error || 'Invalid URL');
        setLastError(error);
        logModelDebugInfo(modelId, modelUrl, fileName, 'load_error', {
          error: validation.error,
          isExpired: validation.isExpired
        });
      }
    } else {
      setHasError(false);
      setErrorMessage("");
      setLastError(null);
    }
  }, [validatedUrl, modelUrl, modelId, fileName]);

  const handleRetry = () => {
    console.log(`🔄 [SIMPLIFIED-PREVIEW] Retrying load for ${modelId}`);
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setErrorMessage("");
    setLastError(null);
    setShouldShowPreview(true);
    
    logModelDebugInfo(modelId, modelUrl, fileName, 'load_start', {
      isRetry: true,
      retryCount: retryCount + 1
    });
  };

  const handleModelError = (error: any) => {
    console.error(`❌ [SIMPLIFIED-PREVIEW] Error for ${fileName}:`, error);
    setHasError(true);
    setErrorMessage(error.message || 'Model loading failed');
    setLastError(error);
    
    logModelDebugInfo(modelId, modelUrl, fileName, 'load_error', {
      error: error.message,
      retryCount
    });
  };

  const handleModelSuccess = () => {
    console.log(`✅ [SIMPLIFIED-PREVIEW] Model loaded successfully for ${fileName}`);
    setHasError(false);
    setErrorMessage("");
    setLastError(null);
    
    logModelDebugInfo(modelId, modelUrl, fileName, 'load_success', {
      retryCount
    });
  };

  // Show error handler if there's an error
  if (hasError && lastError) {
    return (
      <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
        <ModelErrorHandler
          error={lastError}
          modelUrl={modelUrl}
          fileName={fileName}
          onRetry={retryCount < 3 ? handleRetry : undefined}
        />
      </div>
    );
  }

  // Show placeholder if not intersecting or no valid URL
  if (!isIntersecting || !validatedUrl || !shouldShowPreview) {
    return (
      <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
        <ModelPlaceholder fileName={fileName} />
      </div>
    );
  }

  // Show the actual model preview
  return (
    <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
      <SimpleModelPreview 
        modelUrl={validatedUrl} 
        fileName={fileName}
        modelId={modelId}
        onError={handleModelError}
        onSuccess={handleModelSuccess}
      />
    </div>
  );
};

export default SimplifiedModelPreview;
