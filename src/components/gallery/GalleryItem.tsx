
import React from "react";
import { BucketImage } from "./types";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { useGalleryItemState } from "./hooks/useGalleryItemState";
import GalleryItemPreview from "./components/GalleryItemPreview";
import GalleryItemOverlay from "./components/GalleryItemOverlay";
import GalleryItemFooter from "./components/GalleryItemFooter";

interface GalleryItemProps {
  file: BucketImage;
  onDownload: (url: string, name: string) => void;
  onView: (url: string, name: string, type: 'image' | '3d-model') => void;
  onGenerate3D?: (url: string, name: string) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ 
  file, 
  onDownload, 
  onView,
  onGenerate3D 
}) => {
  const { imageError, handleImageError } = useGalleryItemState(file);
  const { secureDownload, isDownloading } = useSecureDownload();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await secureDownload(file.url, file.name);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to original download method
      onDownload(file.url, file.name);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pass the file type to determine which viewer to use
    onView(file.url, file.name, file.type);
  };

  const handleGenerate3D = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerate3D) {
      onGenerate3D(file.url, file.name);
    }
  };

  return (
    <div className="glass-panel rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-200">
      <div className="relative">
        <GalleryItemPreview 
          file={file}
          imageError={imageError}
          onImageError={handleImageError}
        />
        
        <GalleryItemOverlay
          file={file}
          isDownloading={isDownloading}
          onDownload={handleDownload}
          onView={handleView}
          onGenerate3D={onGenerate3D}
        />
      </div>
      
      <GalleryItemFooter file={file} />
    </div>
  );
};

export default GalleryItem;
