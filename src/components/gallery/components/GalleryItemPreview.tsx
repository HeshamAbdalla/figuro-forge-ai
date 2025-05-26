
import React from "react";
import ModelPreview from "../ModelPreview";
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
    <div className="aspect-square relative overflow-hidden bg-white/5">
      {is3DModel ? (
        // Display 3D model directly using ModelPreview
        <ModelPreview 
          modelUrl={file.url} 
          fileName={file.name}
        />
      ) : (
        // Display image as before
        !imageError ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={onImageError}
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
  );
};

export default GalleryItemPreview;
