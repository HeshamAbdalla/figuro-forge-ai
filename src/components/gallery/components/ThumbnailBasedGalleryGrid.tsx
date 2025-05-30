
import React, { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BucketImage } from "../types";
import ThumbnailBasedGalleryItem from "./ThumbnailBasedGalleryItem";
import OnDemand3DPreviewModal from "./OnDemand3DPreviewModal";
import { useSecureDownload } from "@/hooks/useSecureDownload";

interface ThumbnailBasedGalleryGridProps {
  images: BucketImage[];
  isLoading: boolean;
  onDownload: (url: string, name: string) => void;
  onView: (url: string, name: string, type: 'image' | '3d-model') => void;
  onGenerate3D?: (url: string, name: string) => void;
}

const ThumbnailBasedGalleryGrid: React.FC<ThumbnailBasedGalleryGridProps> = ({ 
  images, 
  isLoading, 
  onDownload, 
  onView,
  onGenerate3D 
}) => {
  const [preview3DModal, setPreview3DModal] = useState({
    open: false,
    modelUrl: null as string | null,
    modelName: null as string | null
  });
  
  const { secureDownload } = useSecureDownload();

  // Sort images to prioritize 3D models and text-to-3D files
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      // Prioritize 3D models
      if (a.type === '3d-model' && b.type === 'image') return -1;
      if (a.type === 'image' && b.type === '3d-model') return 1;
      
      // Prioritize text-to-3D files
      const aIsTextTo3D = a.fullPath?.includes('figurine-models/') || false;
      const bIsTextTo3D = b.fullPath?.includes('figurine-models/') || false;
      
      if (aIsTextTo3D && !bIsTextTo3D) return -1;
      if (!aIsTextTo3D && bIsTextTo3D) return 1;
      
      // Sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [images]);

  const handlePreview3D = (modelUrl: string, modelName: string) => {
    setPreview3DModal({
      open: true,
      modelUrl,
      modelName
    });
  };

  const handleClosePreview3D = () => {
    setPreview3DModal({
      open: false,
      modelUrl: null,
      modelName: null
    });
  };

  const handleDownloadFromModal = async () => {
    if (preview3DModal.modelUrl && preview3DModal.modelName) {
      try {
        await secureDownload(preview3DModal.modelUrl, preview3DModal.modelName);
      } catch (error) {
        console.error('Download failed:', error);
        onDownload(preview3DModal.modelUrl, preview3DModal.modelName);
      }
    }
  };

  const handleViewFullFromModal = () => {
    if (preview3DModal.modelUrl && preview3DModal.modelName) {
      handleClosePreview3D();
      onView(preview3DModal.modelUrl, preview3DModal.modelName, '3d-model');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glass-panel rounded-lg overflow-hidden">
            <Skeleton className="aspect-square w-full bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (sortedImages.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-white mb-4">No files yet</h3>
        <p className="text-white/60">
          Upload some models or create figurines to see them here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedImages.map((file) => (
          <ThumbnailBasedGalleryItem
            key={file.id}
            file={file}
            onDownload={onDownload}
            onView={onView}
            onGenerate3D={onGenerate3D}
            onPreview3D={handlePreview3D}
          />
        ))}
      </div>

      {/* On-demand 3D preview modal */}
      <OnDemand3DPreviewModal
        open={preview3DModal.open}
        onOpenChange={(open) => !open && handleClosePreview3D()}
        modelUrl={preview3DModal.modelUrl}
        modelName={preview3DModal.modelName}
        onDownload={handleDownloadFromModal}
        onViewFull={handleViewFullFromModal}
      />
    </>
  );
};

export default ThumbnailBasedGalleryGrid;
