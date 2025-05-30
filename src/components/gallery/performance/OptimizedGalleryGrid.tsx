
import React, { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BucketImage } from "../types";
import OptimizedModelPreview from "./OptimizedModelPreview";
import GalleryItemFooter from "../components/GalleryItemFooter";
import GalleryItemOverlay from "../components/GalleryItemOverlay";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { useGalleryItemState } from "../hooks/useGalleryItemState";
import GalleryPerformanceMonitor from "./GalleryPerformanceMonitor";

interface OptimizedGalleryGridProps {
  images: BucketImage[];
  isLoading: boolean;
  onDownload: (url: string, name: string) => void;
  onView: (url: string, name: string, type: 'image' | '3d-model') => void;
  onGenerate3D?: (url: string, name: string) => void;
  showPerformanceMonitor?: boolean;
}

const OptimizedGalleryItem: React.FC<{
  file: BucketImage;
  onDownload: (url: string, name: string) => void;
  onView: (url: string, name: string, type: 'image' | '3d-model') => void;
  onGenerate3D?: (url: string, name: string) => void;
}> = ({ file, onDownload, onView, onGenerate3D }) => {
  const { imageError, handleImageError } = useGalleryItemState(file);
  const { secureDownload, isDownloading } = useSecureDownload();

  // Check if this is a text-to-3D generated file
  const isTextTo3DFile = file.fullPath?.includes('figurine-models/') || false;
  const isImage = file.type === 'image';
  const is3DModel = file.type === '3d-model';

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
    if (onGenerate3D) {
      onGenerate3D(file.url, file.name);
    }
  };

  return (
    <div className={`glass-panel rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-200 ${isTextTo3DFile ? 'ring-1 ring-figuro-accent/30' : ''}`}>
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
          onGenerate3D={handleGenerate3D}
        />
        
        {isTextTo3DFile && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-figuro-accent/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              Text-to-3D
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
  // Memoize the sorted images to prevent unnecessary re-renders
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      // Prioritize 3D models for better UX
      if (a.type === '3d-model' && b.type === 'image') return -1;
      if (a.type === 'image' && b.type === '3d-model') return 1;
      
      // Then sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [images]);

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
        <GalleryPerformanceMonitor visible={showPerformanceMonitor} />
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
        <GalleryPerformanceMonitor visible={showPerformanceMonitor} />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedImages.map((file) => (
          <OptimizedGalleryItem
            key={file.id}
            file={file}
            onDownload={onDownload}
            onView={onView}
            onGenerate3D={onGenerate3D}
          />
        ))}
      </div>
      <GalleryPerformanceMonitor visible={showPerformanceMonitor} />
    </>
  );
};

export default OptimizedGalleryGrid;
