import React, { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BucketImage } from "../types";
import OptimizedModelPreview from "./OptimizedModelPreview";
import GalleryItemFooter from "../components/GalleryItemFooter";
import GalleryItemOverlay from "../components/GalleryItemOverlay";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { useGalleryItemState } from "../hooks/useGalleryItemState";
import ComprehensivePerformanceMonitor from "./ComprehensivePerformanceMonitor";
import { enhancedResourcePool } from "./EnhancedResourcePool";

interface OptimizedGalleryGridProps {
  images: BucketImage[];
  isLoading: boolean;
  onDownload: (url: string, name: string) => void;
  onView: (url: string, name: string, type: 'image' | '3d-model' | 'web-icon') => void;
  onGenerate3D?: (url: string, name: string) => void;
  showPerformanceMonitor?: boolean;
}

const OptimizedGalleryItem: React.FC<{
  file: BucketImage;
  onDownload: (url: string, name: string) => void;
  onView: (url: string, name: string, type: 'image' | '3d-model' | 'web-icon') => void;
  onGenerate3D?: (url: string, name: string) => void;
  index: number;
}> = ({ file, onDownload, onView, onGenerate3D, index }) => {
  const { imageError, handleImageError } = useGalleryItemState(file);
  const { secureDownload, isDownloading } = useSecureDownload();
  const [isVisible, setIsVisible] = useState(false);

  // Stagger the visibility of items for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50); // 50ms delay between items

    return () => clearTimeout(timer);
  }, [index]);

  // Check if this is a text-to-3D generated file
  const isTextTo3DFile = file.fullPath?.includes('figurine-models/') || false;
  const isImage = file.type === 'image';
  const is3DModel = file.type === '3d-model';
  const isWebIcon = file.type === 'web-icon';

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await secureDownload(file.url, file.name);
    } catch (error) {
      console.error('Download failed:', error);
      onDownload(file.url, file.name);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(file.url, file.name, file.type);
  };

  const handleGenerate3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerate3D && !isWebIcon) {
      onGenerate3D(file.url, file.name);
    }
  };

  if (!isVisible) {
    return (
      <div className="glass-panel rounded-lg overflow-hidden">
        <Skeleton className="aspect-square w-full bg-white/10" />
      </div>
    );
  }

  return (
    <div className={`glass-panel rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-200 ${
      isTextTo3DFile ? 'ring-1 ring-figuro-accent/30' : 
      isWebIcon ? 'ring-1 ring-purple-500/30' : ''
    }`}>
      <div className="relative">
        <div className="aspect-square relative overflow-hidden bg-white/5">
          {is3DModel ? (
            <OptimizedModelPreview 
              modelUrl={file.url} 
              fileName={file.name}
            />
          ) : (
            !imageError ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white/60">
                  <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded" />
                  <p className="text-sm">Preview unavailable</p>
                </div>
              </div>
            )
          )}
        </div>
        
        <GalleryItemOverlay
          file={file}
          isDownloading={isDownloading}
          onDownload={handleDownload}
          onView={handleView}
          onGenerate3D={isWebIcon ? undefined : handleGenerate3D}
        />
        
        {isTextTo3DFile && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-figuro-accent/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              Text-to-3D
            </div>
          </div>
        )}
        
        {isWebIcon && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-purple-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              Web Icon
            </div>
          </div>
        )}
      </div>
      
      <GalleryItemFooter file={file} />
    </div>
  );
};

const OptimizedGalleryGrid: React.FC<OptimizedGalleryGridProps> = ({ 
  images, 
  isLoading, 
  onDownload, 
  onView,
  onGenerate3D,
  showPerformanceMonitor = false
}) => {
  const [gridMetrics, setGridMetrics] = useState({
    totalItems: 0,
    visibleItems: 0,
    modelItems: 0,
    imageItems: 0
  });

  // Memoize the sorted images with enhanced sorting logic
  const sortedImages = useMemo(() => {
    const sorted = [...images].sort((a, b) => {
      // Prioritize 3D models for better UX
      if (a.type === '3d-model' && b.type === 'image') return -1;
      if (a.type === 'image' && b.type === '3d-model') return 1;
      
      // Prioritize text-to-3D files
      const aIsTextTo3D = a.fullPath?.includes('figurine-models/') || false;
      const bIsTextTo3D = b.fullPath?.includes('figurine-models/') || false;
      
      if (aIsTextTo3D && !bIsTextTo3D) return -1;
      if (!aIsTextTo3D && bIsTextTo3D) return 1;
      
      // Then sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Update metrics
    setGridMetrics({
      totalItems: sorted.length,
      visibleItems: sorted.length,
      modelItems: sorted.filter(item => item.type === '3d-model').length,
      imageItems: sorted.filter(item => item.type === 'image').length
    });

    return sorted;
  }, [images]);

  // Monitor resource usage and provide cleanup
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const checkResourceUsage = () => {
        const stats = enhancedResourcePool.getPerformanceStats();
        
        if (stats.hitRatio < 0.5 && stats.cacheHits > 20) {
          console.warn('Gallery: Low cache hit ratio detected, consider cache optimization');
        }
        
        if (stats.geometries > 50) {
          console.warn('Gallery: High geometry count, consider cleanup');
        }
      };

      const interval = setInterval(checkResourceUsage, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  if (isLoading) {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="glass-panel rounded-lg overflow-hidden">
              <Skeleton className="aspect-square w-full bg-white/10" />
            </div>
          ))}
        </div>
        {showPerformanceMonitor && (
          <ComprehensivePerformanceMonitor 
            visible={true}
            position="bottom-right"
          />
        )}
      </>
    );
  }

  if (sortedImages.length === 0) {
    return (
      <>
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold text-white mb-4">No files yet</h3>
          <p className="text-white/60">
            Upload some models or create figurines to see them here.
          </p>
        </div>
        {showPerformanceMonitor && (
          <ComprehensivePerformanceMonitor 
            visible={true}
            position="bottom-right"
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Grid metrics for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 text-white/60 text-sm">
          Gallery: {gridMetrics.totalItems} items ({gridMetrics.modelItems} models, {gridMetrics.imageItems} images)
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedImages.map((file, index) => (
          <OptimizedGalleryItem
            key={file.id}
            file={file}
            index={index}
            onDownload={onDownload}
            onView={onView}
            onGenerate3D={onGenerate3D}
          />
        ))}
      </div>
      
      {showPerformanceMonitor && (
        <ComprehensivePerformanceMonitor 
          visible={true}
          position="bottom-right"
        />
      )}
    </>
  );
};

export default OptimizedGalleryGrid;
