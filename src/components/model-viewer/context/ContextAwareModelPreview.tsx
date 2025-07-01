
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { smartWebGLManager } from './SmartWebGLManager';
import { smartBatchLoader } from './SmartBatchLoader';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import ModelPlaceholder from '@/components/gallery/ModelPlaceholder';

interface ContextAwareModelPreviewProps {
  modelUrl: string;
  fileName: string;
  priority?: number;
  className?: string;
  onError?: (error: string) => void;
}

const ContextAwareModelPreview: React.FC<ContextAwareModelPreviewProps> = ({
  modelUrl,
  fileName,
  priority = 0.5,
  className = '',
  onError
}) => {
  const [modelState, setModelState] = useState<'pending' | 'loading' | 'loaded' | 'error' | 'fallback'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [contextStats, setContextStats] = useState(smartWebGLManager.getStats());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  
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
      return `context-aware-${filename}-${url.hostname.replace(/\./g, '-')}`;
    } catch (e) {
      return `context-aware-${fileName.replace(/\W/g, '')}-${Math.abs(modelUrl.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))}`;
    }
  }, [modelUrl, fileName]);

  // Monitor context stats for development
  useEffect(() => {
    const interval = setInterval(() => {
      setContextStats(smartWebGLManager.getStats());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Handle model loading when visible
  useEffect(() => {
    if (!isIntersecting) {
      setModelState('pending');
      return;
    }

    // Check if we should show fallback immediately
    if (!contextStats.canCreate && contextStats.queued > 3) {
      console.log(`[ContextAware] Showing fallback for ${modelId} - no contexts available`);
      setModelState('fallback');
      return;
    }

    // Add to batch loader
    setModelState('loading');
    
    // Set loading timeout
    loadingTimeoutRef.current = setTimeout(() => {
      console.log(`[ContextAware] Loading timeout for ${modelId}`);
      setModelState('fallback');
      setErrorMessage('Loading timeout - showing fallback');
    }, 10000); // 10 second timeout

    smartBatchLoader.addToBatch(
      modelId,
      modelUrl,
      priority,
      (success, data) => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }

        if (success) {
          console.log(`[ContextAware] Model loaded successfully: ${modelId}`);
          setModelState('loaded');
        } else {
          console.log(`[ContextAware] Model loading failed: ${modelId}`, data);
          setModelState('error');
          setErrorMessage(data?.error || 'Loading failed');
          
          if (onError) {
            onError(data?.error || 'Loading failed');
          }
        }
      }
    );

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      smartBatchLoader.removeFromBatch(modelId);
    };
  }, [isIntersecting, modelId, modelUrl, priority, onError, contextStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      smartWebGLManager.releaseContext(modelId);
      smartBatchLoader.removeFromBatch(modelId);
    };
  }, [modelId]);

  const renderContent = () => {
    switch (modelState) {
      case 'pending':
        return <ModelPlaceholder fileName={fileName} />;
      
      case 'loading':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-figuro-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-white/70 text-sm">Loading 3D model...</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-white/50 text-xs mt-1">
                  Queue: {contextStats.queued}, Active: {contextStats.active}/{contextStats.max}
                </p>
              )}
            </div>
          </div>
        );
      
      case 'loaded':
        return (
          <div className="w-full h-full bg-gray-900 relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' }}
            />
            <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded">
              3D Model
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-red-400 text-xl">⚠</span>
              </div>
              <p className="text-red-400 text-sm font-medium">Failed to load</p>
              <p className="text-white/50 text-xs mt-1">{errorMessage}</p>
            </div>
          </div>
        );
      
      case 'fallback':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-400 text-xl">📦</span>
              </div>
              <p className="text-blue-400 text-sm font-medium">3D Model</p>
              <p className="text-white/70 text-xs mt-1">{fileName}</p>
              <p className="text-white/50 text-xs mt-1">Click to view in full screen</p>
            </div>
          </div>
        );
      
      default:
        return <ModelPlaceholder fileName={fileName} />;
    }
  };

  return (
    <div
      ref={targetRef as React.RefObject<HTMLDivElement>}
      className={`w-full h-full relative ${className}`}
    >
      {renderContent()}
      
      {/* Development stats overlay */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs p-2 rounded font-mono pointer-events-none">
          <div>State: {modelState}</div>
          <div>Contexts: {contextStats.active}/{contextStats.max}</div>
          <div>Queue: {contextStats.queued}</div>
          <div>Priority: {priority}</div>
        </div>
      )}
    </div>
  );
};

export default ContextAwareModelPreview;
