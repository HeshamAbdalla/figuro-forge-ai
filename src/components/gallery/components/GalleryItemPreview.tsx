
import React from "react";
import EnhancedGalleryModelPreview from "../enhanced/EnhancedGalleryModelPreview";
import { BucketImage } from "../types";

interface GalleryItemPreviewProps {
  file: BucketImage;
  imageError: boolean;
  onImageError: () => void;
}

const GalleryItemPreview: React.FC<GalleryItemPreviewProps> = ({ 
  file, 
  imageError, 
  onImageError 
}) => {
  const isImage = file.type === 'image';
  const is3DModel = file.type === '3d-model';

  return (
    <div className="aspect-square relative overflow-hidden bg-white/5 rounded-lg">
      {is3DModel ? (
        // Use enhanced 3D model preview with visual improvements
        <EnhancedGalleryModelPreview 
          modelUrl={file.url} 
          fileName={file.name}
        />
      ) : (
        // Display image as before with enhanced styling
        !imageError ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={onImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="text-center text-white/60">
              <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white/20 rounded"></div>
              </div>
              <p className="text-sm font-medium">Preview unavailable</p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default GalleryItemPreview;
