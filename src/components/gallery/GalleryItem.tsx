
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

  // Check if this is a text-to-3D generated file
  const isTextTo3DFile = file.fullPath?.includes('figurine-models/') || false;
  
  // Check if this is a web icon
  const isWebIcon = file.name.includes('web-icon') || file.type === 'web-icon';

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
    if (onGenerate3D && !isWebIcon) { // Don't allow 3D generation for web icons
      onGenerate3D(file.url, file.name);
    }
  };

  return (
    <div className={`glass-panel rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-200 ${
      isTextTo3DFile ? 'ring-1 ring-figuro-accent/30' : 
      isWebIcon ? 'ring-1 ring-purple-500/30' : ''
    }`}>
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
          onGenerate3D={isWebIcon ? undefined : handleGenerate3D} // Hide 3D generation for web icons
        />
        
        {/* Badge for text-to-3D files */}
        {isTextTo3DFile && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-figuro-accent/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              Text-to-3D
            </div>
          </div>
        )}
        
        {/* Badge for web icons */}
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

export default GalleryItem;
