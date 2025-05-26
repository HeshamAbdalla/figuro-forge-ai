
import React from "react";
import { BucketImage } from "../types";

interface GalleryItemFooterProps {
  file: BucketImage;
}

const GalleryItemFooter: React.FC<GalleryItemFooterProps> = ({ file }) => {
  const is3DModel = file.type === '3d-model';

  return (
    <div className="p-4">
      <p className="text-white/60 text-sm mb-2">
        {new Date(file.created_at).toLocaleDateString()}
      </p>
      <div className="flex items-center">
        <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">
          {is3DModel ? '3D Model' : 'Image'}
        </span>
      </div>
    </div>
  );
};

export default GalleryItemFooter;
