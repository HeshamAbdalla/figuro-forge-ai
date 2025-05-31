
import React, { useState, useEffect, useMemo } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import ModelPreview from "../ModelPreview";
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
  const [forceModelPreview, setForceModelPreview] = useState(false);
  
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
    setHasError(true);
  };

  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
  }, [modelUrl]);

  // Force fallback to ModelPreview after a short delay to ensure rendering
  useEffect(() => {
    if (isIntersecting && !hasError) {
      const timer = setTimeout(() => {
        setForceModelPreview(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isIntersecting, hasError]);

  if (hasError) {
    return (
      <div className="w-full h-full">
        <ModelPlaceholder fileName={`${fileName} (Error)`} />
      </div>
    );
  }

  return (
    <div className="w-full h-full" ref={targetRef as React.RefObject<HTMLDivElement>}>
      {(isIntersecting && forceModelPreview) ? (
        <ModelPreview
          modelUrl={modelUrl}
          fileName={fileName}
        />
      ) : (
        <ModelPlaceholder fileName={fileName} />
      )}
    </div>
  );
};

export default SimplifiedModelPreview;
