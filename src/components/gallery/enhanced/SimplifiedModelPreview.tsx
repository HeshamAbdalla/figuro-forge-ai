
import React, { useState, useEffect, useMemo } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import SimpleModelPreview from "../SimpleModelPreview";
import ModelPlaceholder from "../ModelPlaceholder";
import ModelErrorHandler from "./ModelErrorHandler";
import { validateAndCleanUrl, validateModelUrl } from "@/utils/urlValidationUtils";
import { logModelDebugInfo } from "@/utils/modelDebugUtils";
import { Figurine } from "@/types/figurine";

interface SimplifiedModelPreviewProps {
  modelUrl: string;
  fileName: string;
  metadata?: any; // For URL info and fallback URLs
}

const SimplifiedModelPreview: React.FC<SimplifiedModelPreviewProps> = ({
  modelUrl,
  fileName,
  metadata
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

  // Enhanced URL validation with metadata
  const { validatedUrl, modelId, canRetry } = useMemo(() => {
    const validation = validateAndCleanUrl(modelUrl);
    const modelValidation = validateModelUrl(modelUrl);
    
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
    
    // Determine if retry is possible based on URL info and available fallbacks
    const urlInfo = metadata?.url_info;
    const fallbackUrls = metadata?.fallback_urls || [];
    const hasAlternatives = fallbackUrls.length > 1;
    const isExpiredMeshy = urlInfo?.isMeshyUrl && urlInfo?.isExpired;
    
    return {
      validatedUrl: validation,
      modelId: id,
      canRetry: modelValidation.canFallback || hasAlternatives || !isExpiredMeshy
    };
  }, [modelUrl, fileName, metadata]);

  const handleError = (error: any) => {
    console.error(`SimplifiedModelPreview error for ${fileName}:`, error);
    
    // Log debug info for troubleshooting
    if (modelUrl) {
      logModelDebugInfo({
        id: modelId,
        title: fileName,
        model_url: modelUrl,
        style: 'isometric' as Figurine['style'], // Use valid style instead of empty string
        image_url: '',
        saved_image_url: null,
        prompt: '',
        created_at: new Date().toISOString(),
        user_id: '',
        is_public: false,
        file_type: '3d-model' as const,
        metadata
      });
    }
    
    // Enhanced error message handling based on URL info
    let message = "Model failed to load";
    if (error?.message) {
      if (error.message.includes('expired')) {
        message = "Model URL expired";
      } else if (error.message.includes('not accessible') || error.message.includes('not found')) {
        message = "Model not accessible";
      } else if (error.message.includes('CORS') || error.message.includes('blocked')) {
        message = "Access blocked";
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        message = "Model not found";
      } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        message = "Network error";
      } else if (error.message.includes('invalid') || error.message.includes('empty')) {
        message = "Invalid model";
      } else {
        message = error.message;
      }
    }
    
    // Check if this is an expired Meshy URL with potential fallbacks
    const urlInfo = metadata?.url_info;
    if (urlInfo?.isMeshyUrl && urlInfo?.isExpired) {
      message = "Model URL expired - download may still work";
    }
    
    setErrorMessage(message);
    setHasError(true);
  };

  const handleRetry = () => {
    console.log(`SimplifiedModelPreview: Retrying load for ${fileName} (attempt ${retryCount + 1})`);
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

  // Enhanced URL validation on mount
  useEffect(() => {
    if (!validatedUrl.isValid) {
      console.warn(`SimplifiedModelPreview: Invalid URL for ${fileName}:`, validatedUrl.error);
      setErrorMessage(validatedUrl.error || "Invalid URL");
      setHasError(true);
      return;
    }
    
    // Check for expired URLs with specific handling
    if (validatedUrl.error?.includes('expired')) {
      console.warn(`SimplifiedModelPreview: Expired URL for ${fileName}, showing with download option`);
      setErrorMessage("Model URL expired - download available");
      setHasError(true);
      return;
    }
  }, [validatedUrl, fileName]);

  // Show preview when intersecting with enhanced conditions
  useEffect(() => {
    if (isIntersecting && !hasError && validatedUrl.isValid && !validatedUrl.error?.includes('expired')) {
      console.log(`SimplifiedModelPreview: Starting preview for ${fileName}`);
      const timer = setTimeout(() => {
        setShouldShowPreview(true);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isIntersecting) {
      setShouldShowPreview(false);
    }
  }, [isIntersecting, hasError, fileName, validatedUrl.isValid, validatedUrl.error]);

  // Don't render preview if no model URL or invalid URL
  if (!modelUrl || !validatedUrl.isValid) {
    const errorMsg = !modelUrl ? "No 3D Model" : (validatedUrl.error || "Invalid URL");
    console.log(`SimplifiedModelPreview: ${errorMsg} for ${fileName}`);
    return (
      <div className="w-full h-full">
        <ModelErrorHandler
          error={errorMsg}
          fileName={fileName}
          onRetry={canRetry && validatedUrl.error?.includes('network') ? handleRetry : undefined}
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
          onRetry={canRetry && (errorMessage.includes('network') || errorMessage.includes('failed')) ? handleRetry : undefined}
          modelUrl={modelUrl}
          showDetails={retryCount > 0} // Show more details after first retry
        />
      </div>
    );
  }

  console.log(`SimplifiedModelPreview: Render state for ${fileName}:`, {
    isIntersecting,
    shouldShowPreview,
    hasError,
    hasValidUrl: validatedUrl.isValid,
    retryCount,
    canRetry
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
