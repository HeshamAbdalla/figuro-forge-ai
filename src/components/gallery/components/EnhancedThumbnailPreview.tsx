
import React, { useState, useEffect } from "react";
import { Play, Box, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbnailService, ThumbnailResult } from "../services/ThumbnailService";

interface EnhancedThumbnailPreviewProps {
  fileName: string;
  fullPath: string;
  onPreview3D?: () => void;
  className?: string;
}

const EnhancedThumbnailPreview: React.FC<EnhancedThumbnailPreviewProps> = ({
  fileName,
  fullPath,
  onPreview3D,
  className = ""
}) => {
  const [thumbnailResult, setThumbnailResult] = useState<ThumbnailResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const loadThumbnail = async () => {
    setIsLoading(true);
    setImageError(false);
    
    try {
      const result = await ThumbnailService.findThumbnail(fullPath, fileName);
      setThumbnailResult(result);
      
      if (result.exists && result.url) {
        console.log('✅ [PREVIEW] Thumbnail loaded:', result);
      } else {
        console.log('ℹ️ [PREVIEW] No thumbnail available:', result);
      }
    } catch (error) {
      console.error('❌ [PREVIEW] Error loading thumbnail:', error);
      setThumbnailResult({
        url: null,
        exists: false,
        source: 'error',
        taskId: null,
        confidence: 'low'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThumbnail();
  }, [fullPath, fileName, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    ThumbnailService.clearCache(fullPath, fileName);
    loadThumbnail();
  };

  const handleImageError = () => {
    console.warn('⚠️ [PREVIEW] Image failed to load:', thumbnailResult?.url);
    setImageError(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-800 ${className}`}>
        <div className="text-center">
          <RefreshCw size={24} className="text-figuro-accent mx-auto mb-2 animate-spin" />
          <p className="text-white/60 text-xs">Loading preview...</p>
        </div>
      </div>
    );
  }

  // Show thumbnail if available and no error
  if (thumbnailResult?.exists && thumbnailResult.url && !imageError) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <img
          src={thumbnailResult.url}
          alt={fileName}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* 3D Model Overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black/60 rounded-full p-3 backdrop-blur-sm">
            <Play size={24} className="text-white" />
          </div>
        </div>
        
        {/* Confidence Badge */}
        {thumbnailResult.confidence && (
          <div className="absolute top-2 left-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                thumbnailResult.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                thumbnailResult.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}
            >
              {thumbnailResult.confidence}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  // Show fallback with enhanced 3D preview option
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gray-800 p-4 text-center ${className}`}>
      <Box size={32} className="text-figuro-accent mb-3" />
      <p className="text-white/60 text-sm mb-1">3D Model</p>
      <p className="text-white/40 text-xs mb-3 break-words">{fileName}</p>
      
      {onPreview3D && (
        <Button
          variant="ghost"
          size="sm"
          className="text-figuro-accent hover:text-figuro-accent/80 hover:bg-figuro-accent/10"
          onClick={onPreview3D}
        >
          <Play size={16} className="mr-1" />
          Preview
        </Button>
      )}
      
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && thumbnailResult && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-white/30">
            Source: {thumbnailResult.source}
          </p>
          {thumbnailResult.taskId && (
            <p className="text-xs text-white/30">
              Task: {thumbnailResult.taskId.substring(0, 8)}...
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="text-xs text-white/40 hover:text-white/60"
          >
            <RefreshCw size={12} className="mr-1" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedThumbnailPreview;
